import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    UploadCloud,
    Sparkles,
    Download,
    RefreshCw,
    Video,
    Loader2,
    Trash2,
    Image as ImageIcon,
    Play,
    Clock,
    Move,
    Check,
    AlertCircle,
    BookmarkPlus
} from 'lucide-react';
import { NavigationRail } from '../../dashboard/navigation/NavigationRail';
import { AssetProvider, useAssets } from '@/lib/store/contexts/AssetContext';
import { generateRoomTourVideo, isFalConfigured } from '@/lib/api/toolGeneration';
import { downloadFile } from '@/lib/utils';
import type { RoomTourOptions } from '@/lib/types/generation';

// Motion styles
const MOTION_STYLES = [
    { id: 'smooth-pan', name: 'Smooth Pan', description: 'Gentle horizontal sweep', duration: '5s' },
    { id: 'zoom-in', name: 'Zoom In', description: 'Slow zoom into the room', duration: '4s' },
    { id: 'orbit', name: 'Orbit', description: 'Slight circular movement', duration: '6s' },
    { id: 'cinematic', name: 'Cinematic', description: 'Dramatic slow motion', duration: '8s' },
];

// Duration options
const DURATION_OPTIONS = [
    { id: '3', label: '3s', seconds: 3 },
    { id: '5', label: '5s', seconds: 5 },
    { id: '8', label: '8s', seconds: 8 },
    { id: '10', label: '10s', seconds: 10 },
];

const RoomTourToolInner: React.FC = () => {
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const [uploadedImage, setUploadedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [selectedMotion, setSelectedMotion] = useState('smooth-pan');
    const [selectedDuration, setSelectedDuration] = useState('5');

    const [isGenerating, setIsGenerating] = useState(false);
    const [generationProgress, setGenerationProgress] = useState(0);
    const [resultVideo, setResultVideo] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [savedToLibrary, setSavedToLibrary] = useState(false);
    const { addAsset } = useAssets();

    // Check for pre-selected asset from library
    useEffect(() => {
        const selectedAssetUrl = sessionStorage.getItem('selectedAssetUrl');
        if (selectedAssetUrl) {
            sessionStorage.removeItem('selectedAssetUrl');
            setImagePreview(selectedAssetUrl);
            fetch(selectedAssetUrl)
                .then(res => res.blob())
                .then(blob => {
                    const fileName = selectedAssetUrl.split('/').pop() || 'image.jpg';
                    const file = new File([blob], fileName, { type: blob.type || 'image/jpeg' });
                    setUploadedImage(file);
                })
                .catch(err => console.error('Failed to load pre-selected image:', err));
        }
    }, []);

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

    const handleGenerate = async () => {
        if (!uploadedImage) return;
        setIsGenerating(true);
        setGenerationProgress(0);
        setError(null);
        setSavedToLibrary(false);

        if (!isFalConfigured()) {
            const progressInterval = setInterval(() => {
                setGenerationProgress(prev => prev >= 90 ? (clearInterval(progressInterval), 90) : prev + 5);
            }, 600);

            setTimeout(async () => {
                clearInterval(progressInterval);
                setGenerationProgress(100);
                const mockUrl = 'https://videos.pexels.com/video-files/5977249/5977249-uhd_2560_1440_30fps.mp4';
                setResultVideo(mockUrl);
                try { await addAsset(mockUrl, 'video', 'Room Tour Video'); setSavedToLibrary(true); } catch {}
                setIsGenerating(false);
            }, 6000);
            return;
        }

        try {
            const options: RoomTourOptions = {
                motionStyle: selectedMotion as RoomTourOptions['motionStyle'],
                duration: parseInt(selectedDuration) as RoomTourOptions['duration'],
            };

            const resultUrl = await generateRoomTourVideo(
                uploadedImage,
                options,
                (progress, status) => {
                    setGenerationProgress(progress);
                    console.log('Room tour video status:', status);
                }
            );

            setResultVideo(resultUrl);
            try { await addAsset(resultUrl, 'video', 'Room Tour Video'); setSavedToLibrary(true); } catch {}
        } catch (err) {
            console.error('Room tour video error:', err);
            setError(err instanceof Error ? err.message : 'Video generation failed. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    const selectedMotionData = MOTION_STYLES.find(m => m.id === selectedMotion);

    return (
        <div className="h-screen flex bg-[#0a0a0b]">
            <NavigationRail isMobileOpen={mobileMenuOpen} onMobileClose={() => setMobileMenuOpen(false)} />
<div className="flex-1 flex ml-0 lg:ml-16">
                {/* Sidebar */}
                <div className="w-[360px] flex-shrink-0 bg-[#111113] border-r border-white/5 flex flex-col">
                    <div className="p-4 border-b border-white/5">
                        <div className="flex items-center gap-3">
                            <button onClick={() => navigate('/studio/real-estate')} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                                <ArrowLeft size={18} className="text-zinc-400" />
                            </button>
                            <h1 className="text-base font-semibold text-white flex items-center gap-2">
                                <Video size={18} className="text-emerald-400" />
                                Room Tour Video
                            </h1>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-5">
                        {/* Upload */}
                        <div>
                            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-2 block">Room Photo</label>
                            {!imagePreview ? (
                                <div
                                    onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
                                    className={`relative border border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${isDragging ? 'border-emerald-500 bg-emerald-500/10' : 'border-white/10 hover:border-white/20 bg-white/[0.02]'}`}
                                >
                                    <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleFileChange} accept="image/*" />
                                    <UploadCloud size={28} className="mx-auto mb-2 text-zinc-500" />
                                    <p className="text-sm text-zinc-400">Drop room photo</p>
                                </div>
                            ) : (
                                <div className="relative rounded-xl overflow-hidden group">
                                    <img src={imagePreview} alt="Photo" className="w-full h-36 object-cover" />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <button onClick={removeImage} className="p-2 bg-red-500/80 hover:bg-red-500 rounded-lg text-white"><Trash2 size={16} /></button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Motion Style */}
                        <div>
                            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-3 block flex items-center gap-2">
                                <Move size={14} />
                                Camera Motion
                            </label>
                            <div className="space-y-2">
                                {MOTION_STYLES.map((motion) => (
                                    <button
                                        key={motion.id}
                                        onClick={() => setSelectedMotion(motion.id)}
                                        className={`w-full p-3 rounded-xl text-left transition-all flex items-center gap-3 ${selectedMotion === motion.id ? 'bg-emerald-600/20 border border-emerald-500/50' : 'bg-white/[0.02] border border-transparent hover:bg-white/[0.05]'}`}
                                    >
                                        <div className="flex-1">
                                            <p className={`text-sm font-medium ${selectedMotion === motion.id ? 'text-emerald-300' : 'text-zinc-300'}`}>{motion.name}</p>
                                            <p className="text-xs text-zinc-500">{motion.description}</p>
                                        </div>
                                        {selectedMotion === motion.id && <Check size={16} className="text-emerald-400" />}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Duration */}
                        <div>
                            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-3 block flex items-center gap-2">
                                <Clock size={14} />
                                Duration
                            </label>
                            <div className="flex gap-2">
                                {DURATION_OPTIONS.map((option) => (
                                    <button
                                        key={option.id}
                                        onClick={() => setSelectedDuration(option.id)}
                                        className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-medium transition-all ${selectedDuration === option.id ? 'bg-emerald-600 text-white' : 'bg-white/5 text-zinc-400 hover:bg-white/10'}`}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Info */}
                        <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                            <p className="text-xs text-emerald-300/80 leading-relaxed">
                                <strong className="text-emerald-300">Pro tip:</strong> Use high-resolution photos for best video quality. The AI will add smooth camera movement.
                            </p>
                        </div>
                    </div>

                    <div className="p-4 border-t border-white/5">
                        <button
                            onClick={handleGenerate}
                            disabled={!uploadedImage || isGenerating}
                            className={`w-full py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${uploadedImage && !isGenerating ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'bg-white/5 text-zinc-600 cursor-not-allowed'}`}
                        >
                            {isGenerating ? <><Loader2 size={18} className="animate-spin" />Generating {generationProgress}%</> : <><Video size={18} />Generate Video</>}
                        </button>
                    </div>
                </div>

                {/* Preview */}
                <div className="flex-1 flex flex-col bg-[#0a0a0b]">
                    <div className="h-14 flex items-center justify-between px-6 border-b border-white/5">
                        <span className="text-sm text-zinc-500">{resultVideo ? `${selectedMotionData?.name} • ${selectedDuration}s` : 'Preview'}</span>
                        {resultVideo && (
                            <div className="flex items-center gap-2">
                                <button onClick={() => setResultVideo(null)} className="px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors flex items-center gap-1.5"><RefreshCw size={14} />Regenerate</button>
                                {savedToLibrary ? (
                                    <span className="px-3 py-1.5 text-xs font-medium text-emerald-400 bg-emerald-500/10 rounded-lg flex items-center gap-1.5"><BookmarkPlus size={14} />Saved to Library</span>
                                ) : (
                                    <button onClick={async () => { if (resultVideo) { try { await addAsset(resultVideo, 'video', 'Room Tour Video'); setSavedToLibrary(true); } catch {} } }} className="px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors flex items-center gap-1.5"><BookmarkPlus size={14} />Save to Library</button>
                                )}
                                <button onClick={() => resultVideo && downloadFile(resultVideo, `room-tour-${Date.now()}.mp4`, 'mp4')} className="px-3 py-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors flex items-center gap-1.5"><Download size={14} />Download MP4</button>
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
                                <button
                                    onClick={() => setError(null)}
                                    className="mt-4 px-4 py-2 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors"
                                >
                                    Try Again
                                </button>
                            </div>
                        ) : !imagePreview ? (
                            <div className="text-center">
                                <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4"><ImageIcon size={32} className="text-zinc-700" /></div>
                                <p className="text-zinc-500 text-sm">Upload a room photo to create video</p>
                            </div>
                        ) : isGenerating ? (
                            <div className="text-center">
                                <div className="relative w-24 h-24 mx-auto mb-6">
                                    <svg className="w-full h-full -rotate-90"><circle cx="48" cy="48" r="44" stroke="currentColor" strokeWidth="4" fill="none" className="text-white/10" /><circle cx="48" cy="48" r="44" stroke="currentColor" strokeWidth="4" fill="none" strokeDasharray={276.46} strokeDashoffset={276.46 - (276.46 * generationProgress) / 100} className="text-emerald-500 transition-all duration-300" strokeLinecap="round" /></svg>
                                    <span className="absolute inset-0 flex items-center justify-center text-xl font-semibold text-white">{generationProgress}%</span>
                                </div>
                                <p className="text-zinc-400 font-medium">Generating video...</p>
                                <p className="text-zinc-600 text-sm mt-1">This may take 30-60 seconds</p>
                            </div>
                        ) : resultVideo ? (
                            <div className="relative rounded-2xl overflow-hidden shadow-2xl max-w-4xl w-full">
                                <video
                                    src={resultVideo}
                                    className="w-full h-auto"
                                    controls
                                    autoPlay
                                    loop
                                    muted
                                />
                                <div className="absolute top-4 right-4 px-3 py-1.5 bg-emerald-500/80 backdrop-blur rounded-lg text-xs text-white font-medium flex items-center gap-1.5">
                                    <Video size={12} />
                                    {selectedDuration}s Video
                                </div>
                            </div>
                        ) : (
                            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                                <img src={imagePreview} alt="Preview" className="max-w-full max-h-[calc(100vh-180px)] object-contain" />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                    <div className="text-center text-white">
                                        <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur flex items-center justify-center mx-auto mb-3">
                                            <Play size={28} className="ml-1" />
                                        </div>
                                        <p className="text-sm font-medium">Ready to generate video</p>
                                        <p className="text-white/60 text-xs mt-1">{selectedMotionData?.name} • {selectedDuration}s</p>
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

export const RoomTourTool: React.FC = () => (
    <AssetProvider>
        <RoomTourToolInner />
    </AssetProvider>
);
