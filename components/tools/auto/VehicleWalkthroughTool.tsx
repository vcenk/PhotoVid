import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, UploadCloud, Sparkles, Download, RefreshCw, Loader2, Trash2,
    AlertCircle, Video, Car, Check, Crown, Play
} from 'lucide-react';
import { NavigationRail } from '../../dashboard/navigation/NavigationRail';
import { generateVehicleWalkthrough, isFalConfigured } from '@/lib/api/toolGeneration';
import type { VehicleWalkthroughOptions } from '@/lib/types/generation';

const START_POINTS = [
    { id: 'exterior-front', name: 'Front Exterior' },
    { id: 'exterior-rear', name: 'Rear Exterior' },
    { id: 'driver-door', name: 'Driver Door' },
    { id: 'interior', name: 'Interior Start' },
];

const DURATIONS = [
    { value: 10, label: '10s' },
    { value: 15, label: '15s' },
    { value: 20, label: '20s' },
    { value: 30, label: '30s' },
];

const HIGHLIGHTS = [
    { id: 'dashboard', name: 'Dashboard' },
    { id: 'seats', name: 'Seats' },
    { id: 'trunk', name: 'Trunk' },
    { id: 'engine', name: 'Engine' },
    { id: 'wheels', name: 'Wheels' },
];

const MOTION_STYLES = [
    { id: 'smooth', name: 'Smooth', desc: 'Flowing movement' },
    { id: 'cinematic', name: 'Cinematic', desc: 'Dramatic shots' },
    { id: 'dynamic', name: 'Dynamic', desc: 'Engaging motion' },
];

export const VehicleWalkthroughTool: React.FC = () => {
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const [uploadedImage, setUploadedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startPoint, setStartPoint] = useState<'exterior-front' | 'exterior-rear' | 'driver-door' | 'interior'>('driver-door');
    const [duration, setDuration] = useState<10 | 15 | 20 | 30>(15);
    const [highlights, setHighlights] = useState<('dashboard' | 'seats' | 'trunk' | 'engine' | 'wheels')[]>(['dashboard', 'seats']);
    const [motionStyle, setMotionStyle] = useState<'smooth' | 'cinematic' | 'dynamic'>('cinematic');

    const [isGenerating, setIsGenerating] = useState(false);
    const [generationProgress, setGenerationProgress] = useState(0);
    const [resultVideo, setResultVideo] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') setIsDragging(true);
        else if (e.type === 'dragleave') setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files?.[0]?.type.startsWith('image/')) {
            const file = e.dataTransfer.files[0];
            setUploadedImage(file);
            setImagePreview(URL.createObjectURL(file));
            setResultVideo(null);
        }
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            const file = e.target.files[0];
            setUploadedImage(file);
            setImagePreview(URL.createObjectURL(file));
            setResultVideo(null);
        }
    };

    const removeImage = () => {
        setUploadedImage(null);
        setImagePreview(null);
        setResultVideo(null);
    };

    const toggleHighlight = (id: typeof highlights[number]) => {
        setHighlights(prev =>
            prev.includes(id) ? prev.filter(h => h !== id) : [...prev, id]
        );
    };

    const handleGenerate = async () => {
        if (!uploadedImage) return;
        setIsGenerating(true);
        setGenerationProgress(0);
        setError(null);

        if (!isFalConfigured()) {
            const progressInterval = setInterval(() => {
                setGenerationProgress(prev => prev >= 90 ? (clearInterval(progressInterval), 90) : prev + 5);
            }, 800);

            setTimeout(() => {
                clearInterval(progressInterval);
                setGenerationProgress(100);
                setResultVideo('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4');
                setIsGenerating(false);
            }, 10000);
            return;
        }

        try {
            const options: VehicleWalkthroughOptions = { startPoint, duration, highlights, motionStyle };
            const resultUrl = await generateVehicleWalkthrough(
                uploadedImage,
                options,
                (progress, status) => {
                    setGenerationProgress(progress);
                    console.log('Vehicle walkthrough status:', status);
                }
            );
            setResultVideo(resultUrl);
        } catch (err) {
            console.error('Vehicle walkthrough error:', err);
            setError(err instanceof Error ? err.message : 'Video generation failed. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="h-screen flex bg-[#0a0a0b]">
            <NavigationRail isMobileOpen={mobileMenuOpen} onMobileClose={() => setMobileMenuOpen(false)} />
<div className="flex-1 flex ml-0 lg:ml-16">
                <div className="w-[320px] flex-shrink-0 bg-[#111113] border-r border-white/5 flex flex-col">
                    <div className="p-4 border-b border-white/5">
                        <div className="flex items-center gap-3">
                            <button onClick={() => navigate('/studio/apps/auto')} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                                <ArrowLeft size={18} className="text-zinc-400" />
                            </button>
                            <h1 className="text-base font-semibold text-white flex items-center gap-2">
                                <Video size={18} className="text-emerald-400" />
                                Vehicle Walkthrough
                            </h1>
                            <span className="ml-auto px-2 py-0.5 bg-gradient-to-r from-amber-500 to-orange-500 rounded text-[10px] font-bold text-white flex items-center gap-1">
                                <Crown size={10} />PRO
                            </span>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-5">
                        <div>
                            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-2 block">Vehicle Photo</label>
                            {!imagePreview ? (
                                <div
                                    onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
                                    className={`relative border border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${isDragging ? 'border-emerald-500 bg-emerald-500/10' : 'border-white/10 hover:border-white/20 bg-white/[0.02]'}`}
                                >
                                    <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleFileChange} accept="image/*" />
                                    <UploadCloud size={28} className="mx-auto mb-2 text-zinc-500" />
                                    <p className="text-sm text-zinc-400">Drop interior photo here</p>
                                    <p className="text-xs text-zinc-600 mt-1">Interior or exterior view</p>
                                </div>
                            ) : (
                                <div className="relative rounded-xl overflow-hidden group">
                                    <img src={imagePreview} alt="Vehicle" className="w-full h-24 object-cover" />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <button onClick={removeImage} className="p-2 bg-red-500/80 hover:bg-red-500 rounded-lg text-white"><Trash2 size={16} /></button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-3 block">Start Point</label>
                            <div className="grid grid-cols-2 gap-2">
                                {START_POINTS.map((sp) => (
                                    <button
                                        key={sp.id}
                                        onClick={() => setStartPoint(sp.id as typeof startPoint)}
                                        className={`p-2.5 rounded-xl text-center transition-all ${startPoint === sp.id ? 'bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/50' : 'bg-white/5 text-zinc-400 hover:bg-white/10'}`}
                                    >
                                        <span className="text-xs font-medium">{sp.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-3 block">Duration</label>
                            <div className="grid grid-cols-4 gap-2">
                                {DURATIONS.map((d) => (
                                    <button
                                        key={d.value}
                                        onClick={() => setDuration(d.value as typeof duration)}
                                        className={`p-2.5 rounded-xl text-center transition-all ${duration === d.value ? 'bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/50' : 'bg-white/5 text-zinc-400 hover:bg-white/10'}`}
                                    >
                                        <span className="text-sm font-bold">{d.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-3 block">Highlights</label>
                            <div className="flex flex-wrap gap-2">
                                {HIGHLIGHTS.map((h) => (
                                    <button
                                        key={h.id}
                                        onClick={() => toggleHighlight(h.id as typeof highlights[number])}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${highlights.includes(h.id as typeof highlights[number]) ? 'bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/50' : 'bg-white/5 text-zinc-400 hover:bg-white/10'}`}
                                    >
                                        {h.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-3 block">Motion Style</label>
                            <div className="space-y-2">
                                {MOTION_STYLES.map((style) => (
                                    <button
                                        key={style.id}
                                        onClick={() => setMotionStyle(style.id as typeof motionStyle)}
                                        className={`w-full p-3 rounded-xl text-left transition-all ${motionStyle === style.id ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-white/[0.02] border border-white/5 hover:border-white/10'}`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-white">{style.name}</span>
                                            {motionStyle === style.id && <Check size={16} className="text-emerald-400" />}
                                        </div>
                                        <p className="text-xs text-zinc-500 mt-1">{style.desc}</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="p-4 border-t border-white/5">
                        <button
                            onClick={handleGenerate}
                            disabled={!uploadedImage || isGenerating}
                            className={`w-full py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${uploadedImage && !isGenerating ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'bg-white/5 text-zinc-600 cursor-not-allowed'}`}
                        >
                            {isGenerating ? <><Loader2 size={18} className="animate-spin" />Generating {generationProgress}%</> : <><Sparkles size={18} />Generate Walkthrough</>}
                        </button>
                        <p className="text-xs text-zinc-600 text-center mt-2">5 credits per video</p>
                    </div>
                </div>

                <div className="flex-1 flex flex-col bg-[#0a0a0b]">
                    <div className="h-14 flex items-center justify-between px-6 border-b border-white/5">
                        <span className="text-sm text-zinc-500">{resultVideo ? `Walkthrough: ${motionStyle} ${duration}s` : 'Preview'}</span>
                        {resultVideo && (
                            <div className="flex items-center gap-2">
                                <button onClick={() => setResultVideo(null)} className="px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors flex items-center gap-1.5"><RefreshCw size={14} />New Video</button>
                                <button className="px-3 py-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors flex items-center gap-1.5"><Download size={14} />Download</button>
                            </div>
                        )}
                    </div>

                    <div className="flex-1 flex items-center justify-center p-8">
                        {error ? (
                            <div className="text-center">
                                <div className="w-20 h-20 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                                    <AlertCircle size={32} className="text-red-500" />
                                </div>
                                <p className="text-red-400 text-sm font-medium mb-2">Video Generation Failed</p>
                                <p className="text-zinc-500 text-xs max-w-xs">{error}</p>
                                <button onClick={() => setError(null)} className="mt-4 px-4 py-2 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors">Try Again</button>
                            </div>
                        ) : !imagePreview ? (
                            <div className="text-center">
                                <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4"><Car size={32} className="text-zinc-700" /></div>
                                <p className="text-zinc-500 text-sm">Upload a vehicle photo</p>
                                <p className="text-xs text-zinc-600 mt-1">Generate an interior walkthrough video</p>
                            </div>
                        ) : isGenerating ? (
                            <div className="text-center">
                                <div className="relative w-24 h-24 mx-auto mb-6">
                                    <svg className="w-full h-full -rotate-90"><circle cx="48" cy="48" r="44" stroke="currentColor" strokeWidth="4" fill="none" className="text-white/10" /><circle cx="48" cy="48" r="44" stroke="currentColor" strokeWidth="4" fill="none" strokeDasharray={276.46} strokeDashoffset={276.46 - (276.46 * generationProgress) / 100} className="text-emerald-500 transition-all duration-300" strokeLinecap="round" /></svg>
                                    <span className="absolute inset-0 flex items-center justify-center text-xl font-semibold text-white">{generationProgress}%</span>
                                </div>
                                <p className="text-zinc-400 font-medium">Generating walkthrough video...</p>
                                <p className="text-xs text-zinc-600 mt-1">This may take a moment</p>
                            </div>
                        ) : resultVideo ? (
                            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                                <video src={resultVideo} controls autoPlay loop className="max-w-full max-h-[calc(100vh-180px)]" />
                                <div className="absolute top-4 right-4 px-3 py-1.5 bg-emerald-500/80 backdrop-blur rounded-lg text-xs text-white font-medium flex items-center gap-1.5"><Video size={12} />Walkthrough</div>
                            </div>
                        ) : (
                            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                                <img src={imagePreview} alt="Preview" className="max-w-full max-h-[calc(100vh-180px)] object-contain" />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                    <div className="text-center text-white">
                                        <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3">
                                            <Play size={32} className="ml-1" />
                                        </div>
                                        <p className="text-sm font-medium">Ready to generate video</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
