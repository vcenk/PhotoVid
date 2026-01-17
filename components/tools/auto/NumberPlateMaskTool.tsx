import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, UploadCloud, Sparkles, Download, RefreshCw, Loader2, Trash2,
    AlertCircle, RectangleHorizontal, Car, Check, Undo, Paintbrush
} from 'lucide-react';
import { NavigationRail, FlyoutType } from '../../dashboard/navigation/NavigationRail';
import { FlyoutPanels } from '../../dashboard/navigation/FlyoutPanels';
import { generateNumberPlateMask, isFalConfigured } from '@/lib/api/toolGeneration';
import type { NumberPlateMaskOptions } from '@/lib/types/generation';

const MASK_TYPES = [
    { id: 'blur', name: 'Blur', desc: 'Simple privacy blur' },
    { id: 'dealer-logo', name: 'Dealer Logo', desc: 'Replace with your logo' },
    { id: 'custom-text', name: 'Custom Text', desc: 'Add custom text' },
];

export const NumberPlateMaskTool: React.FC = () => {
    const navigate = useNavigate();
    const [activeFlyout, setActiveFlyout] = useState<FlyoutType>(null);

    const [uploadedImage, setUploadedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [maskType, setMaskType] = useState<'blur' | 'dealer-logo' | 'custom-text'>('blur');
    const [customText, setCustomText] = useState('FOR SALE');
    const [autoDetect, setAutoDetect] = useState(true);

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
        if (imagePreview && canvasRef.current && maskCanvasRef.current && !autoDetect) {
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
    }, [imagePreview, autoDetect]);

    const draw = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing || !maskCanvasRef.current) return;
        const canvas = maskCanvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;
        const ctx = canvas.getContext('2d')!;
        ctx.fillStyle = 'rgba(255, 200, 0, 0.5)';
        ctx.beginPath();
        ctx.arc(x, y, 30, 0, Math.PI * 2);
        ctx.fill();
        setHasMask(true);
    }, [isDrawing]);

    const clearMask = () => {
        if (maskCanvasRef.current) {
            const ctx = maskCanvasRef.current.getContext('2d')!;
            ctx.clearRect(0, 0, maskCanvasRef.current.width, maskCanvasRef.current.height);
            setHasMask(false);
        }
    };

    const handleGenerate = async () => {
        if (!uploadedImage) return;
        if (!autoDetect && !hasMask) return;

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
            const options: NumberPlateMaskOptions = {
                maskType,
                customText: maskType === 'custom-text' ? customText : undefined,
                autoDetect
            };
            const resultUrl = await generateNumberPlateMask(
                uploadedImage,
                options,
                !autoDetect ? maskCanvasRef.current || undefined : undefined,
                (progress, status) => {
                    setGenerationProgress(progress);
                    console.log('Number plate mask status:', status);
                }
            );
            setResultImage(resultUrl);
        } catch (err) {
            console.error('Number plate mask error:', err);
            setError(err instanceof Error ? err.message : 'Plate masking failed. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="h-screen flex bg-[#0a0a0b]">
            <NavigationRail activeFlyout={activeFlyout} onFlyoutChange={setActiveFlyout} />
            <FlyoutPanels activeFlyout={activeFlyout} onClose={() => setActiveFlyout(null)} />

            <div className="flex-1 flex ml-[72px]">
                <div className="w-[320px] flex-shrink-0 bg-[#111113] border-r border-white/5 flex flex-col">
                    <div className="p-4 border-b border-white/5">
                        <div className="flex items-center gap-3">
                            <button onClick={() => navigate('/studio/apps/auto')} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                                <ArrowLeft size={18} className="text-zinc-400" />
                            </button>
                            <h1 className="text-base font-semibold text-white flex items-center gap-2">
                                <RectangleHorizontal size={18} className="text-yellow-400" />
                                Number Plate Mask
                            </h1>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-5">
                        <div>
                            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-2 block">Vehicle Photo</label>
                            {!imagePreview ? (
                                <div
                                    onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
                                    className={`relative border border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${isDragging ? 'border-yellow-500 bg-yellow-500/10' : 'border-white/10 hover:border-white/20 bg-white/[0.02]'}`}
                                >
                                    <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleFileChange} accept="image/*" />
                                    <UploadCloud size={28} className="mx-auto mb-2 text-zinc-500" />
                                    <p className="text-sm text-zinc-400">Drop vehicle photo here</p>
                                    <p className="text-xs text-zinc-600 mt-1">License plate should be visible</p>
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

                        <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                            <div>
                                <p className="text-sm text-white font-medium">Auto-Detect Plate</p>
                                <p className="text-xs text-zinc-500">AI finds the plate</p>
                            </div>
                            <button
                                onClick={() => { setAutoDetect(!autoDetect); setHasMask(false); }}
                                className={`w-11 h-6 rounded-full transition-colors ${autoDetect ? 'bg-yellow-500' : 'bg-white/10'}`}
                            >
                                <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${autoDetect ? 'translate-x-5' : 'translate-x-0.5'}`} />
                            </button>
                        </div>

                        {!autoDetect && canvasReady && (
                            <div className="flex gap-2">
                                <button
                                    onClick={clearMask}
                                    className="flex-1 py-2.5 px-4 rounded-xl text-sm font-medium text-zinc-400 bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Undo size={16} />
                                    Clear
                                </button>
                            </div>
                        )}

                        <div>
                            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-3 block">Mask Type</label>
                            <div className="space-y-2">
                                {MASK_TYPES.map((type) => (
                                    <button
                                        key={type.id}
                                        onClick={() => setMaskType(type.id as typeof maskType)}
                                        className={`w-full p-3 rounded-xl text-left transition-all ${maskType === type.id ? 'bg-yellow-500/10 border border-yellow-500/30' : 'bg-white/[0.02] border border-white/5 hover:border-white/10'}`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-white">{type.name}</span>
                                            {maskType === type.id && <Check size={16} className="text-yellow-400" />}
                                        </div>
                                        <p className="text-xs text-zinc-500 mt-1">{type.desc}</p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {maskType === 'custom-text' && (
                            <div>
                                <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-2 block">Custom Text</label>
                                <input
                                    type="text"
                                    value={customText}
                                    onChange={(e) => setCustomText(e.target.value)}
                                    placeholder="e.g., FOR SALE, SOLD"
                                    className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-yellow-500/50"
                                />
                            </div>
                        )}

                        <div className="p-3 rounded-xl bg-yellow-500/5 border border-yellow-500/10">
                            <p className="text-xs text-yellow-300/80 leading-relaxed">
                                <strong className="text-yellow-300">Privacy Tool:</strong> Mask license plates for online listings. Auto-detect or manually mark the plate area.
                            </p>
                        </div>
                    </div>

                    <div className="p-4 border-t border-white/5">
                        <button
                            onClick={handleGenerate}
                            disabled={!uploadedImage || (!autoDetect && !hasMask) || isGenerating}
                            className={`w-full py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${uploadedImage && (autoDetect || hasMask) && !isGenerating ? 'bg-yellow-600 hover:bg-yellow-500 text-white' : 'bg-white/5 text-zinc-600 cursor-not-allowed'}`}
                        >
                            {isGenerating ? <><Loader2 size={18} className="animate-spin" />Masking {generationProgress}%</> : <><Sparkles size={18} />Mask Plate</>}
                        </button>
                        <p className="text-xs text-zinc-600 text-center mt-2">1 credit per generation</p>
                    </div>
                </div>

                <div className="flex-1 flex flex-col bg-[#0a0a0b]">
                    <div className="h-14 flex items-center justify-between px-6 border-b border-white/5">
                        <span className="text-sm text-zinc-500 flex items-center gap-2">
                            {!autoDetect && canvasReady && !resultImage && <><Paintbrush size={14} />Paint over plate area</>}
                            {resultImage && `Plate Masked: ${maskType}`}
                            {(autoDetect || !canvasReady) && !resultImage && 'Preview'}
                        </span>
                        {resultImage && (
                            <div className="flex items-center gap-2">
                                <button onClick={() => { setResultImage(null); clearMask(); }} className="px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors flex items-center gap-1.5"><RefreshCw size={14} />Start Over</button>
                                <button className="px-3 py-1.5 text-xs font-medium text-white bg-yellow-600 hover:bg-yellow-500 rounded-lg transition-colors flex items-center gap-1.5"><Download size={14} />Download</button>
                            </div>
                        )}
                    </div>

                    <div className="flex-1 flex items-center justify-center p-8">
                        {error ? (
                            <div className="text-center">
                                <div className="w-20 h-20 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                                    <AlertCircle size={32} className="text-red-500" />
                                </div>
                                <p className="text-red-400 text-sm font-medium mb-2">Plate Masking Failed</p>
                                <p className="text-zinc-500 text-xs max-w-xs">{error}</p>
                                <button onClick={() => setError(null)} className="mt-4 px-4 py-2 text-xs font-medium text-white bg-yellow-600 hover:bg-yellow-500 rounded-lg transition-colors">Try Again</button>
                            </div>
                        ) : !imagePreview ? (
                            <div className="text-center">
                                <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4"><Car size={32} className="text-zinc-700" /></div>
                                <p className="text-zinc-500 text-sm">Upload a vehicle photo</p>
                                <p className="text-xs text-zinc-600 mt-1">Mask license plates for privacy</p>
                            </div>
                        ) : isGenerating ? (
                            <div className="text-center">
                                <div className="relative w-24 h-24 mx-auto mb-6">
                                    <svg className="w-full h-full -rotate-90"><circle cx="48" cy="48" r="44" stroke="currentColor" strokeWidth="4" fill="none" className="text-white/10" /><circle cx="48" cy="48" r="44" stroke="currentColor" strokeWidth="4" fill="none" strokeDasharray={276.46} strokeDashoffset={276.46 - (276.46 * generationProgress) / 100} className="text-yellow-500 transition-all duration-300" strokeLinecap="round" /></svg>
                                    <span className="absolute inset-0 flex items-center justify-center text-xl font-semibold text-white">{generationProgress}%</span>
                                </div>
                                <p className="text-zinc-400 font-medium">Masking plate...</p>
                            </div>
                        ) : resultImage ? (
                            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                                <img src={resultImage} alt="Result" className="max-w-full max-h-[calc(100vh-180px)] object-contain" />
                                <div className="absolute top-4 right-4 px-3 py-1.5 bg-yellow-500/80 backdrop-blur rounded-lg text-xs text-white font-medium flex items-center gap-1.5"><RectangleHorizontal size={12} />Plate Masked</div>
                            </div>
                        ) : !autoDetect && canvasReady ? (
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
                        ) : (
                            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                                <img src={imagePreview} alt="Preview" className="max-w-full max-h-[calc(100vh-180px)] object-contain" />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/40"><div className="text-center text-white"><RectangleHorizontal size={28} className="mx-auto mb-2 opacity-80" /><p className="text-sm font-medium">Ready to mask</p></div></div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
