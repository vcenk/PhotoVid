import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, UploadCloud, Sparkles, Download, RefreshCw, Loader2, Trash2,
    Image as ImageIcon, AlertCircle, Eraser, BookmarkPlus, Check, Undo2, Brush
} from 'lucide-react';
import { NavigationRail } from '../../dashboard/navigation/NavigationRail';
import { AssetProvider, useAssets } from '@/lib/store/contexts/AssetContext';
import { generateObjectRemoval, isFalConfigured } from '@/lib/api/toolGeneration';
import { downloadFile } from '@/lib/utils';

const BRUSH_SIZES = [
    { id: 'small', size: 20, label: 'S' },
    { id: 'medium', size: 40, label: 'M' },
    { id: 'large', size: 80, label: 'L' },
];

const ObjectRemovalToolInner: React.FC = () => {
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const [uploadedImage, setUploadedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [brushSize, setBrushSize] = useState(40);

    // Canvas state for mask drawing
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [maskDataUrl, setMaskDataUrl] = useState<string | null>(null);
    const [hasDrawn, setHasDrawn] = useState(false);

    const [isGenerating, setIsGenerating] = useState(false);
    const [generationProgress, setGenerationProgress] = useState(0);
    const [resultImage, setResultImage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [savedToLibrary, setSavedToLibrary] = useState(false);
    const { addAsset } = useAssets();

    // Initialize canvas when image loads
    useEffect(() => {
        if (imagePreview && canvasRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            const img = new Image();
            img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            };
            img.src = imagePreview;
        }
    }, [imagePreview]);

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
            setHasDrawn(false);
            setMaskDataUrl(null);
        }
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            const file = e.target.files[0];
            setUploadedImage(file);
            setImagePreview(URL.createObjectURL(file));
            setResultImage(null);
            setError(null);
            setHasDrawn(false);
            setMaskDataUrl(null);
        }
    };

    const removeImage = () => {
        setUploadedImage(null);
        setImagePreview(null);
        setResultImage(null);
        setError(null);
        setHasDrawn(false);
        setMaskDataUrl(null);
    };

    const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        };
    };

    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
        setIsDrawing(true);
        draw(e);
    };

    const stopDrawing = () => {
        setIsDrawing(false);
        // Save mask data URL
        if (canvasRef.current) {
            setMaskDataUrl(canvasRef.current.toDataURL('image/png'));
        }
    };

    const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing || !canvasRef.current) return;
        const ctx = canvasRef.current.getContext('2d');
        if (!ctx) return;

        const { x, y } = getCanvasCoords(e);
        ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
        ctx.beginPath();
        ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
        ctx.fill();
        setHasDrawn(true);
    };

    const clearMask = () => {
        if (canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d');
            if (ctx) {
                ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
                setHasDrawn(false);
                setMaskDataUrl(null);
            }
        }
    };

    const handleGenerate = async () => {
        if (!uploadedImage || !hasDrawn) return;
        setIsGenerating(true);
        setGenerationProgress(0);
        setError(null);
        setSavedToLibrary(false);

        if (!isFalConfigured()) {
            const progressInterval = setInterval(() => {
                setGenerationProgress(prev => prev >= 90 ? (clearInterval(progressInterval), 90) : prev + 10);
            }, 400);

            setTimeout(async () => {
                clearInterval(progressInterval);
                setGenerationProgress(100);
                const mockUrl = 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&h=800&fit=crop';
                setResultImage(mockUrl);
                try { await addAsset(mockUrl, 'image', 'Object Removed'); setSavedToLibrary(true); } catch {}
                setIsGenerating(false);
            }, 3500);
            return;
        }

        try {
            const resultUrl = await generateObjectRemoval(
                uploadedImage,
                { maskDataUrl: maskDataUrl || undefined },
                (progress) => setGenerationProgress(progress)
            );
            setResultImage(resultUrl);
            try { await addAsset(resultUrl, 'image', 'Object Removed'); setSavedToLibrary(true); } catch {}
        } catch (err) {
            console.error('Object removal error:', err);
            setError(err instanceof Error ? err.message : 'Object removal failed.');
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
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center">
                                <Eraser size={20} className="text-white" />
                            </div>
                            <div>
                                <h1 className="text-lg font-semibold text-white">Object Removal</h1>
                                <p className="text-xs text-zinc-500">Erase unwanted objects from photos</p>
                            </div>
                        </div>
                    </div>

                    {resultImage && (
                        <div className="flex items-center gap-2">
                            <button onClick={() => { setResultImage(null); setError(null); clearMask(); }} className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-colors flex items-center gap-2">
                                <RefreshCw size={16} />Regenerate
                            </button>
                            {savedToLibrary ? (
                                <span className="px-4 py-2 text-sm font-medium text-emerald-400 bg-emerald-500/10 rounded-xl flex items-center gap-2"><Check size={16} />Saved</span>
                            ) : (
                                <button onClick={async () => { if (resultImage) { try { await addAsset(resultImage, 'image', 'Object Removed'); setSavedToLibrary(true); } catch {} } }} className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-colors flex items-center gap-2">
                                    <BookmarkPlus size={16} />Save
                                </button>
                            )}
                            <button onClick={() => resultImage && downloadFile(resultImage, `object-removed-${Date.now()}.jpg`)} className="px-4 py-2 text-sm font-medium text-white bg-rose-600 hover:bg-rose-500 rounded-xl transition-colors flex items-center gap-2">
                                <Download size={16} />Download
                            </button>
                        </div>
                    )}
                </div>

                {/* Main Content */}
                <div className="flex-1 flex overflow-hidden">
                    {/* Left: Upload & Options */}
                    <div className="w-80 flex-shrink-0 border-r border-white/5 bg-[#111113] flex flex-col">
                        <div className="flex-1 overflow-y-auto p-5 space-y-6">
                            {/* Upload */}
                            <div>
                                <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-3 block">Upload Image</label>
                                {!imagePreview ? (
                                    <div
                                        onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
                                        className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${isDragging ? 'border-rose-500 bg-rose-500/10' : 'border-white/10 hover:border-white/20 bg-white/[0.02]'}`}
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

                            {/* Brush Size */}
                            {imagePreview && !resultImage && (
                                <div>
                                    <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-3 block">Brush Size</label>
                                    <div className="flex gap-2">
                                        {BRUSH_SIZES.map((b) => (
                                            <button
                                                key={b.id}
                                                onClick={() => setBrushSize(b.size)}
                                                className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all ${brushSize === b.size ? 'bg-rose-500/15 text-rose-400 ring-1 ring-rose-500/50' : 'bg-white/[0.03] text-zinc-400 hover:bg-white/[0.06]'}`}
                                            >
                                                {b.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Clear Mask Button */}
                            {hasDrawn && !resultImage && (
                                <button
                                    onClick={clearMask}
                                    className="w-full py-3 rounded-xl text-sm font-medium text-zinc-400 hover:text-white bg-white/[0.03] hover:bg-white/[0.06] transition-colors flex items-center justify-center gap-2"
                                >
                                    <Undo2 size={16} />Clear Selection
                                </button>
                            )}

                            {/* Instructions */}
                            {imagePreview && !resultImage && (
                                <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/10">
                                    <div className="flex items-start gap-3">
                                        <Brush size={18} className="text-rose-400 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium text-rose-300">Paint to Remove</p>
                                            <p className="text-xs text-rose-300/70 mt-1">Brush over objects you want to erase. They'll be seamlessly removed.</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Generate Button */}
                        <div className="p-5 border-t border-white/5">
                            <button
                                onClick={handleGenerate}
                                disabled={!uploadedImage || !hasDrawn || isGenerating}
                                className={`w-full py-4 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${uploadedImage && hasDrawn && !isGenerating ? 'bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white shadow-lg shadow-rose-500/25' : 'bg-white/5 text-zinc-600 cursor-not-allowed'}`}
                            >
                                {isGenerating ? <><Loader2 size={18} className="animate-spin" />Removing {generationProgress}%</> : <><Eraser size={18} />Remove Objects</>}
                            </button>
                        </div>
                    </div>

                    {/* Right: Preview/Canvas */}
                    <div className="flex-1 flex items-center justify-center p-8 bg-[#0a0a0b]">
                        {error ? (
                            <div className="text-center max-w-md">
                                <div className="w-20 h-20 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                                    <AlertCircle size={36} className="text-red-500" />
                                </div>
                                <p className="text-red-400 text-lg font-medium mb-2">Removal Failed</p>
                                <p className="text-zinc-500 text-sm mb-6">{error}</p>
                                <button onClick={() => setError(null)} className="px-6 py-3 text-sm font-medium text-white bg-rose-600 hover:bg-rose-500 rounded-xl transition-colors">
                                    Try Again
                                </button>
                            </div>
                        ) : !imagePreview ? (
                            <div className="text-center">
                                <div className="w-24 h-24 rounded-3xl bg-white/5 flex items-center justify-center mx-auto mb-4">
                                    <ImageIcon size={40} className="text-zinc-700" />
                                </div>
                                <p className="text-zinc-500 text-lg">Upload an image to get started</p>
                            </div>
                        ) : isGenerating ? (
                            <div className="text-center">
                                <div className="relative w-32 h-32 mx-auto mb-6">
                                    <svg className="w-full h-full -rotate-90">
                                        <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="6" fill="none" className="text-white/10" />
                                        <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="6" fill="none" strokeDasharray={351.86} strokeDashoffset={351.86 - (351.86 * generationProgress) / 100} className="text-rose-500 transition-all duration-300" strokeLinecap="round" />
                                    </svg>
                                    <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-white">{generationProgress}%</span>
                                </div>
                                <p className="text-zinc-400 font-medium text-lg">Removing objects...</p>
                                <p className="text-zinc-600 text-sm mt-2">AI is filling in the gaps</p>
                            </div>
                        ) : resultImage ? (
                            <div className="relative">
                                <div className="rounded-2xl overflow-hidden shadow-2xl bg-zinc-900">
                                    <img src={resultImage} alt="Result" className="max-w-full max-h-[calc(100vh-220px)] object-contain" />
                                </div>
                                <div className="absolute top-4 right-4 px-3 py-1.5 bg-rose-500/90 backdrop-blur rounded-lg text-xs text-white font-medium flex items-center gap-1.5">
                                    <Eraser size={12} />Objects Removed
                                </div>
                            </div>
                        ) : (
                            <div className="relative rounded-2xl overflow-hidden shadow-2xl" style={{ cursor: `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="${brushSize}" height="${brushSize}"><circle cx="${brushSize/2}" cy="${brushSize/2}" r="${brushSize/2 - 2}" fill="rgba(244,63,94,0.5)" stroke="white" stroke-width="2"/></svg>') ${brushSize/2} ${brushSize/2}, crosshair` }}>
                                <img src={imagePreview} alt="Preview" className="max-w-full max-h-[calc(100vh-220px)] object-contain" />
                                <canvas
                                    ref={canvasRef}
                                    onMouseDown={startDrawing}
                                    onMouseUp={stopDrawing}
                                    onMouseLeave={stopDrawing}
                                    onMouseMove={draw}
                                    className="absolute inset-0 w-full h-full"
                                />
                                {!hasDrawn && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none">
                                        <div className="text-center text-white">
                                            <Brush size={36} className="mx-auto mb-3 opacity-80" />
                                            <p className="text-lg font-medium">Paint over objects to remove</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export const ObjectRemovalTool: React.FC = () => (
    <AssetProvider>
        <ObjectRemovalToolInner />
    </AssetProvider>
);
