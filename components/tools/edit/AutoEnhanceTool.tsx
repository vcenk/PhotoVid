import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, UploadCloud, Sparkles, Download, RefreshCw, Loader2, Trash2,
    Image as ImageIcon, AlertCircle, Zap, BookmarkPlus, Check
} from 'lucide-react';
import { NavigationRail } from '../../dashboard/navigation/NavigationRail';
import { AssetProvider, useAssets } from '@/lib/store/contexts/AssetContext';
import { generateAutoEnhance, isFalConfigured } from '@/lib/api/toolGeneration';
import { downloadFile } from '@/lib/utils';
import { BeforeAfterSlider } from '@/components/common/BeforeAfterSlider';

const AutoEnhanceToolInner: React.FC = () => {
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const [uploadedImage, setUploadedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    const [isGenerating, setIsGenerating] = useState(false);
    const [generationProgress, setGenerationProgress] = useState(0);
    const [resultImage, setResultImage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [savedToLibrary, setSavedToLibrary] = useState(false);
    const { addAsset } = useAssets();

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
            setError(null);
        }
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            const file = e.target.files[0];
            setUploadedImage(file);
            setImagePreview(URL.createObjectURL(file));
            setResultImage(null);
            setError(null);
        }
    };

    const removeImage = () => {
        setUploadedImage(null);
        setImagePreview(null);
        setResultImage(null);
        setError(null);
    };

    const handleGenerate = async () => {
        if (!uploadedImage) return;
        setIsGenerating(true);
        setGenerationProgress(0);
        setError(null);
        setSavedToLibrary(false);

        if (!isFalConfigured()) {
            const progressInterval = setInterval(() => {
                setGenerationProgress(prev => prev >= 90 ? (clearInterval(progressInterval), 90) : prev + 10);
            }, 300);

            setTimeout(async () => {
                clearInterval(progressInterval);
                setGenerationProgress(100);
                const mockUrl = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&h=800&fit=crop';
                setResultImage(mockUrl);
                try { await addAsset(mockUrl, 'image', 'Auto Enhanced'); setSavedToLibrary(true); } catch {}
                setIsGenerating(false);
            }, 2500);
            return;
        }

        try {
            const resultUrl = await generateAutoEnhance(
                uploadedImage,
                { preset: 'auto' as const },
                (progress) => setGenerationProgress(progress)
            );
            setResultImage(resultUrl);
            try { await addAsset(resultUrl, 'image', 'Auto Enhanced'); setSavedToLibrary(true); } catch {}
        } catch (err) {
            console.error('Auto enhance error:', err);
            setError(err instanceof Error ? err.message : 'Enhancement failed.');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="h-screen flex bg-[#0a0a0b]">
            <NavigationRail isMobileOpen={mobileMenuOpen} onMobileClose={() => setMobileMenuOpen(false)} />

            <div className="flex-1 flex flex-col ml-0 lg:ml-16 overflow-hidden">
                {/* Header */}
                <div className="h-16 flex items-center justify-between px-6 border-b border-white/5 bg-[#111113]">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/studio/edit')} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                            <ArrowLeft size={20} className="text-zinc-400" />
                        </button>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
                                <Zap size={20} className="text-white" />
                            </div>
                            <div>
                                <h1 className="text-lg font-semibold text-white">Auto Enhance</h1>
                                <p className="text-xs text-zinc-500">One-click photo improvement</p>
                            </div>
                        </div>
                    </div>

                    {resultImage && (
                        <div className="flex items-center gap-2">
                            <button onClick={() => { setResultImage(null); setError(null); }} className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-colors flex items-center gap-2">
                                <RefreshCw size={16} />Regenerate
                            </button>
                            {savedToLibrary ? (
                                <span className="px-4 py-2 text-sm font-medium text-emerald-400 bg-emerald-500/10 rounded-xl flex items-center gap-2"><Check size={16} />Saved</span>
                            ) : (
                                <button onClick={async () => { if (resultImage) { try { await addAsset(resultImage, 'image', 'Auto Enhanced'); setSavedToLibrary(true); } catch {} } }} className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-colors flex items-center gap-2">
                                    <BookmarkPlus size={16} />Save
                                </button>
                            )}
                            <button onClick={() => resultImage && downloadFile(resultImage, `enhanced-${Date.now()}.jpg`)} className="px-4 py-2 text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-500 rounded-xl transition-colors flex items-center gap-2">
                                <Download size={16} />Download
                            </button>
                        </div>
                    )}
                </div>

                {/* Main Content */}
                <div className="flex-1 flex overflow-hidden">
                    {/* Left: Upload */}
                    <div className="w-80 flex-shrink-0 border-r border-white/5 bg-[#111113] flex flex-col">
                        <div className="flex-1 overflow-y-auto p-5 space-y-6">
                            {/* Upload */}
                            <div>
                                <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-3 block">Upload Image</label>
                                {!imagePreview ? (
                                    <div
                                        onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
                                        className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${isDragging ? 'border-yellow-500 bg-yellow-500/10' : 'border-white/10 hover:border-white/20 bg-white/[0.02]'}`}
                                    >
                                        <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleFileChange} accept="image/*" />
                                        <UploadCloud size={32} className="mx-auto mb-3 text-zinc-500" />
                                        <p className="text-sm text-zinc-400 font-medium">Drop image here</p>
                                        <p className="text-xs text-zinc-600 mt-1">or click to browse</p>
                                    </div>
                                ) : (
                                    <div className="relative rounded-2xl overflow-hidden group aspect-video">
                                        <img src={imagePreview} alt="Upload" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <button onClick={removeImage} className="p-3 bg-red-500/80 hover:bg-red-500 rounded-xl text-white transition-colors">
                                                <Trash2 size={20} />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Info */}
                            <div className="p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/10">
                                <div className="flex items-start gap-3">
                                    <Zap size={18} className="text-yellow-400 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium text-yellow-300">One-Click Magic</p>
                                        <p className="text-xs text-yellow-300/70 mt-1">AI automatically adjusts brightness, contrast, colors, and sharpness for optimal results.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Generate Button */}
                        <div className="p-5 border-t border-white/5">
                            <button
                                onClick={handleGenerate}
                                disabled={!uploadedImage || isGenerating}
                                className={`w-full py-4 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${uploadedImage && !isGenerating ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-white shadow-lg shadow-yellow-500/25' : 'bg-white/5 text-zinc-600 cursor-not-allowed'}`}
                            >
                                {isGenerating ? <><Loader2 size={18} className="animate-spin" />Enhancing {generationProgress}%</> : <><Zap size={18} />Auto Enhance</>}
                            </button>
                        </div>
                    </div>

                    {/* Right: Preview */}
                    <div className="flex-1 flex items-center justify-center p-8 bg-[#0a0a0b]">
                        {error ? (
                            <div className="text-center max-w-md">
                                <div className="w-20 h-20 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                                    <AlertCircle size={36} className="text-red-500" />
                                </div>
                                <p className="text-red-400 text-lg font-medium mb-2">Enhancement Failed</p>
                                <p className="text-zinc-500 text-sm mb-6">{error}</p>
                                <button onClick={() => setError(null)} className="px-6 py-3 text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-500 rounded-xl transition-colors">
                                    Try Again
                                </button>
                            </div>
                        ) : !imagePreview ? (
                            <div className="text-center">
                                <div className="w-24 h-24 rounded-3xl bg-white/5 flex items-center justify-center mx-auto mb-4">
                                    <ImageIcon size={40} className="text-zinc-700" />
                                </div>
                                <p className="text-zinc-500 text-lg">Upload an image to enhance</p>
                            </div>
                        ) : isGenerating ? (
                            <div className="text-center">
                                <div className="relative w-32 h-32 mx-auto mb-6">
                                    <svg className="w-full h-full -rotate-90">
                                        <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="6" fill="none" className="text-white/10" />
                                        <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="6" fill="none" strokeDasharray={351.86} strokeDashoffset={351.86 - (351.86 * generationProgress) / 100} className="text-yellow-500 transition-all duration-300" strokeLinecap="round" />
                                    </svg>
                                    <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-white">{generationProgress}%</span>
                                </div>
                                <p className="text-zinc-400 font-medium text-lg">Enhancing image...</p>
                                <p className="text-zinc-600 text-sm mt-2">AI is optimizing your photo</p>
                            </div>
                        ) : resultImage && imagePreview ? (
                            <div className="w-full max-w-4xl">
                                <BeforeAfterSlider
                                    beforeImage={imagePreview}
                                    afterImage={resultImage}
                                    beforeLabel="Original"
                                    afterLabel="Enhanced"
                                />
                            </div>
                        ) : (
                            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                                <img src={imagePreview} alt="Preview" className="max-w-full max-h-[calc(100vh-220px)] object-contain" />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                                    <div className="text-center text-white">
                                        <Zap size={36} className="mx-auto mb-3 opacity-80" />
                                        <p className="text-lg font-medium">Ready to enhance</p>
                                        <p className="text-sm text-white/60 mt-1">One click to improve</p>
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

export const AutoEnhanceTool: React.FC = () => (
    <AssetProvider>
        <AutoEnhanceToolInner />
    </AssetProvider>
);
