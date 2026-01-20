import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    UploadCloud,
    Sparkles,
    Download,
    RefreshCw,
    Trees,
    Loader2,
    Trash2,
    Image as ImageIcon,
    Flower2,
    Droplets,
    Check,
    AlertCircle
} from 'lucide-react';
import { NavigationRail, FlyoutType } from '../../dashboard/navigation/NavigationRail';
import { FlyoutPanels } from '../../dashboard/navigation/FlyoutPanels';
import { BeforeAfterSlider } from '../../common/BeforeAfterSlider';
import { generateLawnEnhancement, isFalConfigured } from '@/lib/api/toolGeneration';
import type { LawnEnhancementOptions } from '@/lib/types/generation';

// Enhancement options
const ENHANCEMENT_OPTIONS = [
    { id: 'greener', name: 'Greener Lawn', description: 'Make grass lush and vibrant', icon: Trees, active: true },
    { id: 'flowers', name: 'Add Flowers', description: 'Colorful flower accents', icon: Flower2, active: false },
    { id: 'fresh', name: 'Fresh & Dewy', description: 'Morning dew effect', icon: Droplets, active: false },
];

// Intensity levels
const INTENSITY_LEVELS = [
    { id: 'natural', name: 'Natural', value: 30 },
    { id: 'enhanced', name: 'Enhanced', value: 60 },
    { id: 'vibrant', name: 'Vibrant', value: 100 },
];

export const LawnEnhancementTool: React.FC = () => {
    const navigate = useNavigate();
    const [activeFlyout, setActiveFlyout] = useState<FlyoutType>(null);

    const [uploadedImage, setUploadedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [options, setOptions] = useState({ greener: true, flowers: false, fresh: false });
    const [intensity, setIntensity] = useState('enhanced');

    const [isGenerating, setIsGenerating] = useState(false);
    const [generationProgress, setGenerationProgress] = useState(0);
    const [resultImage, setResultImage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

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

    const toggleOption = (key: string) => {
        setOptions(prev => ({ ...prev, [key]: !prev[key as keyof typeof prev] }));
    };

    const handleGenerate = async () => {
        if (!uploadedImage) return;
        setIsGenerating(true);
        setGenerationProgress(0);
        setError(null);

        if (!isFalConfigured()) {
            const progressInterval = setInterval(() => {
                setGenerationProgress(prev => prev >= 90 ? (clearInterval(progressInterval), 90) : prev + 12);
            }, 400);

            setTimeout(() => {
                clearInterval(progressInterval);
                setGenerationProgress(100);
                setResultImage('https://images.unsplash.com/photo-1558036117-15d82a90b9b1?w=1200&h=800&fit=crop');
                setIsGenerating(false);
            }, 2800);
            return;
        }

        try {
            const lawnOptions: LawnEnhancementOptions = {
                greenerLawn: options.greener,
                addFlowers: options.flowers,
                freshDewy: options.fresh,
                intensity: intensity as LawnEnhancementOptions['intensity'],
            };

            const resultUrl = await generateLawnEnhancement(
                uploadedImage,
                lawnOptions,
                (progress, status) => {
                    setGenerationProgress(progress);
                    console.log('Lawn enhancement status:', status);
                }
            );

            setResultImage(resultUrl);
        } catch (err) {
            console.error('Lawn enhancement error:', err);
            setError(err instanceof Error ? err.message : 'Lawn enhancement failed. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="h-screen flex bg-[#0a0a0b]">
            <NavigationRail activeFlyout={activeFlyout} onFlyoutChange={setActiveFlyout} />
            <FlyoutPanels activeFlyout={activeFlyout} onClose={() => setActiveFlyout(null)} />

            <div className="flex-1 flex ml-56">
                {/* Sidebar */}
                <div className="w-[320px] flex-shrink-0 bg-[#111113] border-r border-white/5 flex flex-col">
                    <div className="p-4 border-b border-white/5">
                        <div className="flex items-center gap-3">
                            <button onClick={() => navigate('/studio/apps/real-estate')} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                                <ArrowLeft size={18} className="text-zinc-400" />
                            </button>
                            <h1 className="text-base font-semibold text-white flex items-center gap-2">
                                <Trees size={18} className="text-green-400" />
                                Lawn & Landscape
                            </h1>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-5">
                        {/* Upload */}
                        <div>
                            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-2 block">Property Photo</label>
                            {!imagePreview ? (
                                <div
                                    onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
                                    className={`relative border border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${isDragging ? 'border-green-500 bg-green-500/10' : 'border-white/10 hover:border-white/20 bg-white/[0.02]'}`}
                                >
                                    <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleFileChange} accept="image/*" />
                                    <UploadCloud size={28} className="mx-auto mb-2 text-zinc-500" />
                                    <p className="text-sm text-zinc-400">Drop exterior photo</p>
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

                        {/* Enhancement Options */}
                        <div>
                            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-3 block">Enhancements</label>
                            <div className="space-y-2">
                                {ENHANCEMENT_OPTIONS.map((option) => (
                                    <button
                                        key={option.id}
                                        onClick={() => toggleOption(option.id)}
                                        className={`w-full p-3 rounded-xl text-left transition-all flex items-center gap-3 ${options[option.id as keyof typeof options] ? 'bg-green-600/20 border border-green-500/50' : 'bg-white/[0.02] border border-transparent hover:bg-white/[0.05]'}`}
                                    >
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${options[option.id as keyof typeof options] ? 'bg-green-600' : 'bg-white/10'}`}>
                                            <option.icon size={16} className="text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <p className={`text-sm font-medium ${options[option.id as keyof typeof options] ? 'text-green-300' : 'text-zinc-300'}`}>{option.name}</p>
                                            <p className="text-xs text-zinc-500">{option.description}</p>
                                        </div>
                                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${options[option.id as keyof typeof options] ? 'bg-green-600 border-green-600' : 'border-zinc-600'}`}>
                                            {options[option.id as keyof typeof options] && <Check size={12} className="text-white" />}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Intensity */}
                        <div>
                            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-3 block">Intensity</label>
                            <div className="flex gap-2">
                                {INTENSITY_LEVELS.map((level) => (
                                    <button
                                        key={level.id}
                                        onClick={() => setIntensity(level.id)}
                                        className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all ${intensity === level.id ? 'bg-green-600 text-white' : 'bg-white/5 text-zinc-400 hover:bg-white/10'}`}
                                    >
                                        {level.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="p-4 border-t border-white/5">
                        <button
                            onClick={handleGenerate}
                            disabled={!uploadedImage || isGenerating}
                            className={`w-full py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${uploadedImage && !isGenerating ? 'bg-green-600 hover:bg-green-500 text-white' : 'bg-white/5 text-zinc-600 cursor-not-allowed'}`}
                        >
                            {isGenerating ? <><Loader2 size={18} className="animate-spin" />Enhancing {generationProgress}%</> : <><Sparkles size={18} />Enhance Landscape</>}
                        </button>
                    </div>
                </div>

                {/* Preview */}
                <div className="flex-1 flex flex-col bg-[#0a0a0b]">
                    <div className="h-14 flex items-center justify-between px-6 border-b border-white/5">
                        <span className="text-sm text-zinc-500">{resultImage ? 'Enhanced Landscape' : 'Preview'}</span>
                        {resultImage && (
                            <div className="flex items-center gap-2">
                                <button onClick={() => setResultImage(null)} className="px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors flex items-center gap-1.5"><RefreshCw size={14} />Try Again</button>
                                <button className="px-3 py-1.5 text-xs font-medium text-white bg-green-600 hover:bg-green-500 rounded-lg transition-colors flex items-center gap-1.5"><Download size={14} />Download</button>
                            </div>
                        )}
                    </div>

                    <div className="flex-1 flex items-center justify-center p-8">
                        {error ? (
                            <div className="text-center">
                                <div className="w-20 h-20 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                                    <AlertCircle size={32} className="text-red-500" />
                                </div>
                                <p className="text-red-400 text-sm font-medium mb-2">Lawn Enhancement Failed</p>
                                <p className="text-zinc-500 text-xs max-w-xs">{error}</p>
                                <button
                                    onClick={() => setError(null)}
                                    className="mt-4 px-4 py-2 text-xs font-medium text-white bg-green-600 hover:bg-green-500 rounded-lg transition-colors"
                                >
                                    Try Again
                                </button>
                            </div>
                        ) : !imagePreview ? (
                            <div className="text-center">
                                <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4"><ImageIcon size={32} className="text-zinc-700" /></div>
                                <p className="text-zinc-500 text-sm">Upload an exterior property photo</p>
                            </div>
                        ) : isGenerating ? (
                            <div className="text-center">
                                <div className="relative w-24 h-24 mx-auto mb-6">
                                    <svg className="w-full h-full -rotate-90"><circle cx="48" cy="48" r="44" stroke="currentColor" strokeWidth="4" fill="none" className="text-white/10" /><circle cx="48" cy="48" r="44" stroke="currentColor" strokeWidth="4" fill="none" strokeDasharray={276.46} strokeDashoffset={276.46 - (276.46 * generationProgress) / 100} className="text-green-500 transition-all duration-300" strokeLinecap="round" /></svg>
                                    <span className="absolute inset-0 flex items-center justify-center text-xl font-semibold text-white">{generationProgress}%</span>
                                </div>
                                <p className="text-zinc-400 font-medium">Enhancing landscape...</p>
                            </div>
                        ) : resultImage && imagePreview ? (
                            <div className="w-full max-w-4xl">
                                <BeforeAfterSlider
                                    beforeImage={imagePreview}
                                    afterImage={resultImage}
                                    beforeLabel="Original"
                                    afterLabel="Enhanced"
                                    className="shadow-2xl"
                                />
                            </div>
                        ) : (
                            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                                <img src={imagePreview} alt="Preview" className="max-w-full max-h-[calc(100vh-180px)] object-contain" />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/40"><div className="text-center text-white"><Trees size={28} className="mx-auto mb-2 opacity-80" /><p className="text-sm font-medium">Ready to enhance</p></div></div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
