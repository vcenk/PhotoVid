import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, UploadCloud, Sparkles, Download, RefreshCw, Loader2, Trash2,
    AlertCircle, Eraser, Car, Undo, Paintbrush
} from 'lucide-react';
import { NavigationRail, FlyoutType } from '../../dashboard/navigation/NavigationRail';
import { FlyoutPanels } from '../../dashboard/navigation/FlyoutPanels';
import { generateBlemishRemoval, isFalConfigured } from '@/lib/api/toolGeneration';

const BRUSH_SIZES = [
    { size: 15, label: 'S' },
    { size: 30, label: 'M' },
    { size: 50, label: 'L' },
    { size: 80, label: 'XL' },
];

export const BlemishRemovalTool: React.FC = () => {
    const navigate = useNavigate();
    const [activeFlyout, setActiveFlyout] = useState<FlyoutType>(null);

    const [uploadedImage, setUploadedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [brushSize, setBrushSize] = useState(30);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const maskCanvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [canvasReady, setCanvasReady] = useState(false);
    const [hasMask, setHasMask] = useState(false);

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
            setCanvasReady(false);
            setHasMask(false);
        }
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            const file = e.target.files[0];
            setUploadedImage(file);
            setImagePreview(URL.createObjectURL(file));
            setResultImage(null);
            setCanvasReady(false);
            setHasMask(false);
        }
    };

    const removeImage = () => {
        setUploadedImage(null);
        setImagePreview(null);
        setResultImage(null);
        setCanvasReady(false);
        setHasMask(false);
    };

    useEffect(() => {
        if (imagePreview && canvasRef.current && maskCanvasRef.current) {
            const img = new Image();
            img.onload = () => {
                const canvas = canvasRef.current!;
                const maskCanvas = maskCanvasRef.current!;
                canvas.width = img.width;
                canvas.height = img.height;
                maskCanvas.width = img.width;
                maskCanvas.height = img.height;
                const ctx = canvas.getContext('2d')!;
                ctx.drawImage(img, 0, 0);
                setCanvasReady(true);
            };
            img.src = imagePreview;
        }
    }, [imagePreview]);

    const draw = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing || !maskCanvasRef.current) return;
        const canvas = maskCanvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;
        const ctx = canvas.getContext('2d')!;
        ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
        ctx.beginPath();
        ctx.arc(x, y, brushSize, 0, Math.PI * 2);
        ctx.fill();
        setHasMask(true);
    }, [isDrawing, brushSize]);

    const clearMask = () => {
        if (maskCanvasRef.current) {
            const ctx = maskCanvasRef.current.getContext('2d')!;
            ctx.clearRect(0, 0, maskCanvasRef.current.width, maskCanvasRef.current.height);
            setHasMask(false);
        }
    };

    const handleGenerate = async () => {
        if (!uploadedImage || !maskCanvasRef.current || !hasMask) return;
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
                setResultImage('https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=1200&h=800&fit=crop');
                setIsGenerating(false);
            }, 5000);
            return;
        }

        try {
            const resultUrl = await generateBlemishRemoval(
                uploadedImage,
                maskCanvasRef.current,
                (progress, status) => {
                    setGenerationProgress(progress);
                    console.log('Blemish removal status:', status);
                }
            );
            setResultImage(resultUrl);
        } catch (err) {
            console.error('Blemish removal error:', err);
            setError(err instanceof Error ? err.message : 'Blemish removal failed. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="h-screen flex bg-[#0a0a0b]">
            <NavigationRail activeFlyout={activeFlyout} onFlyoutChange={setActiveFlyout} />
            <FlyoutPanels activeFlyout={activeFlyout} onClose={() => setActiveFlyout(null)} />

            <div className="flex-1 flex ml-56">
                <div className="w-[320px] flex-shrink-0 bg-[#111113] border-r border-white/5 flex flex-col">
                    <div className="p-4 border-b border-white/5">
                        <div className="flex items-center gap-3">
                            <button onClick={() => navigate('/studio/apps/auto')} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                                <ArrowLeft size={18} className="text-zinc-400" />
                            </button>
                            <h1 className="text-base font-semibold text-white flex items-center gap-2">
                                <Eraser size={18} className="text-blue-400" />
                                Blemish Removal
                            </h1>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-5">
                        <div>
                            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-2 block">Vehicle Photo</label>
                            {!imagePreview ? (
                                <div
                                    onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
                                    className={`relative border border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${isDragging ? 'border-blue-500 bg-blue-500/10' : 'border-white/10 hover:border-white/20 bg-white/[0.02]'}`}
                                >
                                    <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleFileChange} accept="image/*" />
                                    <UploadCloud size={28} className="mx-auto mb-2 text-zinc-500" />
                                    <p className="text-sm text-zinc-400">Drop vehicle photo here</p>
                                    <p className="text-xs text-zinc-600 mt-1">PNG, JPG up to 10MB</p>
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

                        {canvasReady && (
                            <>
                                <div>
                                    <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-3 block">Brush Size</label>
                                    <div className="flex gap-2">
                                        {BRUSH_SIZES.map((b) => (
                                            <button
                                                key={b.size}
                                                onClick={() => setBrushSize(b.size)}
                                                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${brushSize === b.size ? 'bg-blue-500/20 text-blue-300 ring-1 ring-blue-500/50' : 'bg-white/5 text-zinc-400 hover:bg-white/10'}`}
                                            >
                                                {b.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={clearMask}
                                        className="flex-1 py-2.5 px-4 rounded-xl text-sm font-medium text-zinc-400 bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Undo size={16} />
                                        Clear Mask
                                    </button>
                                </div>
                            </>
                        )}

                        <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/10">
                            <p className="text-xs text-blue-300/80 leading-relaxed">
                                <strong className="text-blue-300">Instructions:</strong> Paint over scratches, dents, or blemishes you want to remove. The AI will repair these areas seamlessly.
                            </p>
                        </div>
                    </div>

                    <div className="p-4 border-t border-white/5">
                        <button
                            onClick={handleGenerate}
                            disabled={!uploadedImage || !hasMask || isGenerating}
                            className={`w-full py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${uploadedImage && hasMask && !isGenerating ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-white/5 text-zinc-600 cursor-not-allowed'}`}
                        >
                            {isGenerating ? <><Loader2 size={18} className="animate-spin" />Removing {generationProgress}%</> : <><Sparkles size={18} />Remove Blemishes</>}
                        </button>
                        <p className="text-xs text-zinc-600 text-center mt-2">2 credits per generation</p>
                    </div>
                </div>

                <div className="flex-1 flex flex-col bg-[#0a0a0b]">
                    <div className="h-14 flex items-center justify-between px-6 border-b border-white/5">
                        <span className="text-sm text-zinc-500 flex items-center gap-2">
                            {canvasReady && !resultImage && <><Paintbrush size={14} />Paint over blemishes to remove</>}
                            {resultImage && 'Blemishes Removed'}
                            {!canvasReady && !resultImage && 'Preview'}
                        </span>
                        {resultImage && (
                            <div className="flex items-center gap-2">
                                <button onClick={() => { setResultImage(null); clearMask(); }} className="px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors flex items-center gap-1.5"><RefreshCw size={14} />Start Over</button>
                                <button className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors flex items-center gap-1.5"><Download size={14} />Download</button>
                            </div>
                        )}
                    </div>

                    <div className="flex-1 flex items-center justify-center p-8">
                        {error ? (
                            <div className="text-center">
                                <div className="w-20 h-20 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                                    <AlertCircle size={32} className="text-red-500" />
                                </div>
                                <p className="text-red-400 text-sm font-medium mb-2">Blemish Removal Failed</p>
                                <p className="text-zinc-500 text-xs max-w-xs">{error}</p>
                                <button onClick={() => setError(null)} className="mt-4 px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors">Try Again</button>
                            </div>
                        ) : !imagePreview ? (
                            <div className="text-center">
                                <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4"><Car size={32} className="text-zinc-700" /></div>
                                <p className="text-zinc-500 text-sm">Upload a vehicle photo to remove blemishes</p>
                                <p className="text-xs text-zinc-600 mt-1">Remove scratches, dents, and imperfections</p>
                            </div>
                        ) : isGenerating ? (
                            <div className="text-center">
                                <div className="relative w-24 h-24 mx-auto mb-6">
                                    <svg className="w-full h-full -rotate-90"><circle cx="48" cy="48" r="44" stroke="currentColor" strokeWidth="4" fill="none" className="text-white/10" /><circle cx="48" cy="48" r="44" stroke="currentColor" strokeWidth="4" fill="none" strokeDasharray={276.46} strokeDashoffset={276.46 - (276.46 * generationProgress) / 100} className="text-blue-500 transition-all duration-300" strokeLinecap="round" /></svg>
                                    <span className="absolute inset-0 flex items-center justify-center text-xl font-semibold text-white">{generationProgress}%</span>
                                </div>
                                <p className="text-zinc-400 font-medium">Removing blemishes...</p>
                            </div>
                        ) : resultImage ? (
                            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                                <img src={resultImage} alt="Result" className="max-w-full max-h-[calc(100vh-180px)] object-contain" />
                                <div className="absolute top-4 right-4 px-3 py-1.5 bg-blue-500/80 backdrop-blur rounded-lg text-xs text-white font-medium flex items-center gap-1.5"><Eraser size={12} />Blemishes Removed</div>
                            </div>
                        ) : (
                            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                                <canvas ref={canvasRef} className="max-w-full max-h-[calc(100vh-180px)] object-contain" />
                                <canvas
                                    ref={maskCanvasRef}
                                    className="absolute top-0 left-0 w-full h-full cursor-crosshair"
                                    onMouseDown={() => setIsDrawing(true)}
                                    onMouseUp={() => setIsDrawing(false)}
                                    onMouseLeave={() => setIsDrawing(false)}
                                    onMouseMove={draw}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
