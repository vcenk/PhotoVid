import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    UploadCloud,
    Sparkles,
    Download,
    RefreshCw,
    Moon,
    Loader2,
    Trash2,
    Image as ImageIcon,
    Sun,
    Lightbulb,
    Check,
    AlertCircle
} from 'lucide-react';
import { NavigationRail, FlyoutType } from '../../dashboard/navigation/NavigationRail';
import { FlyoutPanels } from '../../dashboard/navigation/FlyoutPanels';
import { generateTwilight, isFalConfigured } from '@/lib/api/toolGeneration';
import type { TwilightOptions } from '@/lib/types/generation';

// Twilight styles
const TWILIGHT_STYLES = [
    { id: 'blue-hour', name: 'Blue Hour', description: 'Deep blue sky, warm interior glow', color: 'from-blue-600 to-indigo-900' },
    { id: 'golden-dusk', name: 'Golden Dusk', description: 'Warm orange sunset tones', color: 'from-orange-500 to-purple-700' },
    { id: 'purple-twilight', name: 'Purple Twilight', description: 'Rich purple evening sky', color: 'from-purple-600 to-indigo-900' },
    { id: 'dramatic', name: 'Dramatic Night', description: 'Dark sky, bright windows', color: 'from-slate-800 to-slate-950' },
];

// Window glow intensity
const GLOW_OPTIONS = [
    { id: 'subtle', name: 'Subtle', value: 30 },
    { id: 'medium', name: 'Medium', value: 60 },
    { id: 'bright', name: 'Bright', value: 100 },
];

export const TwilightTool: React.FC = () => {
    const navigate = useNavigate();
    const [activeFlyout, setActiveFlyout] = useState<FlyoutType>(null);

    const [uploadedImage, setUploadedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [selectedStyle, setSelectedStyle] = useState('blue-hour');
    const [glowIntensity, setGlowIntensity] = useState('medium');

    const [isGenerating, setIsGenerating] = useState(false);
    const [generationProgress, setGenerationProgress] = useState(0);
    const [resultImage, setResultImage] = useState<string | null>(null);
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
            setResultImage(null);
        }
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            const file = e.target.files[0];
            setUploadedImage(file);
            setImagePreview(URL.createObjectURL(file));
            setResultImage(null);
        }
    };

    const removeImage = () => {
        setUploadedImage(null);
        setImagePreview(null);
        setResultImage(null);
    };

    const handleGenerate = async () => {
        if (!uploadedImage) return;
        setIsGenerating(true);
        setGenerationProgress(0);
        setError(null);

        if (!isFalConfigured()) {
            const progressInterval = setInterval(() => {
                setGenerationProgress(prev => prev >= 90 ? (clearInterval(progressInterval), 90) : prev + 10);
            }, 500);

            setTimeout(() => {
                clearInterval(progressInterval);
                setGenerationProgress(100);
                setResultImage('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&h=800&fit=crop');
                setIsGenerating(false);
            }, 3500);
            return;
        }

        try {
            const glowValue = GLOW_OPTIONS.find(g => g.id === glowIntensity)?.value || 60;

            const options: TwilightOptions = {
                style: selectedStyle as TwilightOptions['style'],
                glowIntensity: glowValue as TwilightOptions['glowIntensity'],
            };

            const resultUrl = await generateTwilight(
                uploadedImage,
                options,
                (progress, status) => {
                    setGenerationProgress(progress);
                    console.log('Twilight conversion status:', status);
                }
            );

            setResultImage(resultUrl);
        } catch (err) {
            console.error('Twilight conversion error:', err);
            setError(err instanceof Error ? err.message : 'Twilight conversion failed. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    const selectedStyleData = TWILIGHT_STYLES.find(s => s.id === selectedStyle);

    return (
        <div className="h-screen flex bg-[#0a0a0b]">
            <NavigationRail activeFlyout={activeFlyout} onFlyoutChange={setActiveFlyout} />
            <FlyoutPanels activeFlyout={activeFlyout} onClose={() => setActiveFlyout(null)} />

            <div className="flex-1 flex ml-[72px]">
                {/* Sidebar */}
                <div className="w-[320px] flex-shrink-0 bg-[#111113] border-r border-white/5 flex flex-col">
                    <div className="p-4 border-b border-white/5">
                        <div className="flex items-center gap-3">
                            <button onClick={() => navigate('/studio/apps/real-estate')} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                                <ArrowLeft size={18} className="text-zinc-400" />
                            </button>
                            <h1 className="text-base font-semibold text-white flex items-center gap-2">
                                <Moon size={18} className="text-indigo-400" />
                                Day to Twilight
                            </h1>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-5">
                        {/* Upload */}
                        <div>
                            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-2 block">Daytime Photo</label>
                            {!imagePreview ? (
                                <div
                                    onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
                                    className={`relative border border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${isDragging ? 'border-indigo-500 bg-indigo-500/10' : 'border-white/10 hover:border-white/20 bg-white/[0.02]'}`}
                                >
                                    <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleFileChange} accept="image/*" />
                                    <Sun size={28} className="mx-auto mb-2 text-zinc-500" />
                                    <p className="text-sm text-zinc-400">Drop daytime exterior</p>
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

                        {/* Twilight Style */}
                        <div>
                            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-3 block">Twilight Style</label>
                            <div className="space-y-2">
                                {TWILIGHT_STYLES.map((style) => (
                                    <button
                                        key={style.id}
                                        onClick={() => setSelectedStyle(style.id)}
                                        className={`w-full p-3 rounded-xl text-left transition-all flex items-center gap-3 ${selectedStyle === style.id ? 'bg-indigo-600/20 border border-indigo-500/50' : 'bg-white/[0.02] border border-transparent hover:bg-white/[0.05]'}`}
                                    >
                                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${style.color}`} />
                                        <div className="flex-1">
                                            <p className={`text-sm font-medium ${selectedStyle === style.id ? 'text-indigo-300' : 'text-zinc-300'}`}>{style.name}</p>
                                            <p className="text-xs text-zinc-500">{style.description}</p>
                                        </div>
                                        {selectedStyle === style.id && <Check size={16} className="text-indigo-400" />}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Window Glow */}
                        <div>
                            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-3 block flex items-center gap-2">
                                <Lightbulb size={14} />
                                Window Glow
                            </label>
                            <div className="flex gap-2">
                                {GLOW_OPTIONS.map((option) => (
                                    <button
                                        key={option.id}
                                        onClick={() => setGlowIntensity(option.id)}
                                        className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all ${glowIntensity === option.id ? 'bg-indigo-600 text-white' : 'bg-white/5 text-zinc-400 hover:bg-white/10'}`}
                                    >
                                        {option.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="p-4 border-t border-white/5">
                        <button
                            onClick={handleGenerate}
                            disabled={!uploadedImage || isGenerating}
                            className={`w-full py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${uploadedImage && !isGenerating ? 'bg-indigo-600 hover:bg-indigo-500 text-white' : 'bg-white/5 text-zinc-600 cursor-not-allowed'}`}
                        >
                            {isGenerating ? <><Loader2 size={18} className="animate-spin" />Converting {generationProgress}%</> : <><Moon size={18} />Convert to Twilight</>}
                        </button>
                    </div>
                </div>

                {/* Preview */}
                <div className="flex-1 flex flex-col bg-[#0a0a0b]">
                    <div className="h-14 flex items-center justify-between px-6 border-b border-white/5">
                        <span className="text-sm text-zinc-500">{resultImage ? `${selectedStyleData?.name} Effect` : 'Preview'}</span>
                        {resultImage && (
                            <div className="flex items-center gap-2">
                                <button onClick={() => setResultImage(null)} className="px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors flex items-center gap-1.5"><RefreshCw size={14} />Try Again</button>
                                <button className="px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors flex items-center gap-1.5"><Download size={14} />Download</button>
                            </div>
                        )}
                    </div>

                    <div className="flex-1 flex items-center justify-center p-8">
                        {error ? (
                            <div className="text-center">
                                <div className="w-20 h-20 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                                    <AlertCircle size={32} className="text-red-500" />
                                </div>
                                <p className="text-red-400 text-sm font-medium mb-2">Twilight Conversion Failed</p>
                                <p className="text-zinc-500 text-xs max-w-xs">{error}</p>
                                <button
                                    onClick={() => setError(null)}
                                    className="mt-4 px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors"
                                >
                                    Try Again
                                </button>
                            </div>
                        ) : !imagePreview ? (
                            <div className="text-center">
                                <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4"><ImageIcon size={32} className="text-zinc-700" /></div>
                                <p className="text-zinc-500 text-sm">Upload a daytime exterior photo</p>
                            </div>
                        ) : isGenerating ? (
                            <div className="text-center">
                                <div className="relative w-24 h-24 mx-auto mb-6">
                                    <svg className="w-full h-full -rotate-90"><circle cx="48" cy="48" r="44" stroke="currentColor" strokeWidth="4" fill="none" className="text-white/10" /><circle cx="48" cy="48" r="44" stroke="currentColor" strokeWidth="4" fill="none" strokeDasharray={276.46} strokeDashoffset={276.46 - (276.46 * generationProgress) / 100} className="text-indigo-500 transition-all duration-300" strokeLinecap="round" /></svg>
                                    <span className="absolute inset-0 flex items-center justify-center text-xl font-semibold text-white">{generationProgress}%</span>
                                </div>
                                <p className="text-zinc-400 font-medium">Converting to twilight...</p>
                                <p className="text-zinc-600 text-sm mt-1">Adding window glow & evening sky</p>
                            </div>
                        ) : (
                            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                                <img src={resultImage || imagePreview} alt="Preview" className="max-w-full max-h-[calc(100vh-180px)] object-contain" />
                                {resultImage && <div className="absolute top-4 right-4 px-3 py-1.5 bg-indigo-500/80 backdrop-blur rounded-lg text-xs text-white font-medium flex items-center gap-1.5"><Moon size={12} />{selectedStyleData?.name}</div>}
                                {!resultImage && <div className="absolute inset-0 flex items-center justify-center bg-black/40"><div className="text-center text-white"><Sun size={28} className="mx-auto mb-2 opacity-80" /><p className="text-sm font-medium">Daytime → Twilight</p></div></div>}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
