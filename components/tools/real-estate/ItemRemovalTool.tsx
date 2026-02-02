import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    UploadCloud,
    Sparkles,
    Download,
    RefreshCw,
    Eraser,
    Loader2,
    Trash2,
    Undo2,
    Circle,
    MousePointer2,
    Image as ImageIcon,
    ZoomIn,
    ZoomOut,
    RotateCcw,
    AlertCircle,
    BookmarkPlus
} from 'lucide-react';
import { NavigationRail } from '../../dashboard/navigation/NavigationRail';
import { AssetProvider, useAssets } from '@/lib/store/contexts/AssetContext';
import { BeforeAfterSlider } from '../../common/BeforeAfterSlider';
import { generateItemRemoval, isFalConfigured } from '@/lib/api/toolGeneration';
import { downloadFile } from '@/lib/utils';

const ItemRemovalToolInner: React.FC = () => {
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Upload state
    const [uploadedImage, setUploadedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    // Canvas state
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [brushSize, setBrushSize] = useState(30);
    const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
    const [imageLoaded, setImageLoaded] = useState(false);
    const [maskHistory, setMaskHistory] = useState<ImageData[]>([]);

    // Generation state
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationProgress, setGenerationProgress] = useState(0);
    const [resultImage, setResultImage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [savedToLibrary, setSavedToLibrary] = useState(false);
    const { addAsset } = useAssets();

    // Handle drag events
    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setIsDragging(true);
        } else if (e.type === 'dragleave') {
            setIsDragging(false);
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            if (file.type.startsWith('image/')) {
                setUploadedImage(file);
                setImagePreview(URL.createObjectURL(file));
                setResultImage(null);
                setImageLoaded(false);
                setMaskHistory([]);
            }
        }
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setUploadedImage(file);
            setImagePreview(URL.createObjectURL(file));
            setResultImage(null);
            setImageLoaded(false);
            setMaskHistory([]);
        }
    };

    const removeImage = () => {
        setUploadedImage(null);
        setImagePreview(null);
        setResultImage(null);
        setImageLoaded(false);
        setMaskHistory([]);
    };

    // Check for pre-selected asset from library
    useEffect(() => {
        const selectedAssetUrl = sessionStorage.getItem('selectedAssetUrl');
        if (selectedAssetUrl) {
            sessionStorage.removeItem('selectedAssetUrl');
            setImagePreview(selectedAssetUrl);
            setImageLoaded(false);
            setMaskHistory([]);
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

    // Initialize canvas when image loads
    useEffect(() => {
        if (!imagePreview || !containerRef.current) return;

        const img = new Image();
        img.onload = () => {
            const container = containerRef.current;
            if (!container) return;

            const containerWidth = container.clientWidth;
            const containerHeight = container.clientHeight;

            // Calculate size to fit container while maintaining aspect ratio
            const imgAspect = img.width / img.height;
            const containerAspect = containerWidth / containerHeight;

            let width, height;
            if (imgAspect > containerAspect) {
                width = Math.min(containerWidth - 48, img.width);
                height = width / imgAspect;
            } else {
                height = Math.min(containerHeight - 48, img.height);
                width = height * imgAspect;
            }

            setCanvasSize({ width, height });
            setImageLoaded(true);
        };
        img.src = imagePreview;
    }, [imagePreview]);

    // Setup canvas context
    useEffect(() => {
        if (!canvasRef.current || !imageLoaded) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }, [canvasSize, imageLoaded]);

    // Save current mask state for undo
    const saveMaskState = () => {
        if (!canvasRef.current) return;
        const ctx = canvasRef.current.getContext('2d');
        if (!ctx) return;
        const imageData = ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
        setMaskHistory(prev => [...prev, imageData]);
    };

    // Drawing functions
    const getCanvasCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return null;

        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        let clientX, clientY;
        if ('touches' in e) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }

        return {
            x: (clientX - rect.left) * scaleX,
            y: (clientY - rect.top) * scaleY
        };
    };

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        if (resultImage) return;
        saveMaskState();
        setIsDrawing(true);
        draw(e);
    };

    const stopDrawing = () => {
        setIsDrawing(false);
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing || !canvasRef.current || resultImage) return;

        const coords = getCanvasCoordinates(e);
        if (!coords) return;

        const ctx = canvasRef.current.getContext('2d');
        if (!ctx) return;

        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = 'rgba(255, 59, 48, 0.5)';
        ctx.beginPath();
        ctx.arc(coords.x, coords.y, brushSize / 2, 0, Math.PI * 2);
        ctx.fill();
    };

    const handleUndo = () => {
        if (maskHistory.length === 0 || !canvasRef.current) return;
        const ctx = canvasRef.current.getContext('2d');
        if (!ctx) return;

        const newHistory = [...maskHistory];
        const lastState = newHistory.pop();

        if (lastState) {
            ctx.putImageData(lastState, 0, 0);
        } else {
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }

        setMaskHistory(newHistory);
    };

    const clearMask = () => {
        if (!canvasRef.current) return;
        const ctx = canvasRef.current.getContext('2d');
        if (!ctx) return;

        saveMaskState();
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    };

    // Check if mask has any content
    const hasMask = () => {
        if (!canvasRef.current) return false;
        const ctx = canvasRef.current.getContext('2d');
        if (!ctx) return false;

        const imageData = ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
        return imageData.data.some((value, index) => index % 4 === 3 && value > 0);
    };

    // Handle generation
    const handleGenerate = async () => {
        if (!uploadedImage || !hasMask() || !canvasRef.current) return;

        setIsGenerating(true);
        setGenerationProgress(0);
        setError(null);
        setSavedToLibrary(false);

        if (!isFalConfigured()) {
            const progressInterval = setInterval(() => {
                setGenerationProgress(prev => {
                    if (prev >= 90) {
                        clearInterval(progressInterval);
                        return 90;
                    }
                    return prev + 10;
                });
            }, 500);

            setTimeout(async () => {
                clearInterval(progressInterval);
                setGenerationProgress(100);
                const mockUrl = 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&h=800&fit=crop';
                setResultImage(mockUrl);
                try { await addAsset(mockUrl, 'image', 'Item Removal Result'); setSavedToLibrary(true); } catch {}
                setIsGenerating(false);
            }, 3000);
            return;
        }

        try {
            const resultUrl = await generateItemRemoval(
                uploadedImage,
                canvasRef.current,
                (progress, status) => {
                    setGenerationProgress(progress);
                    console.log('Item removal status:', status);
                }
            );

            setResultImage(resultUrl);
            try { await addAsset(resultUrl, 'image', 'Item Removal Result'); setSavedToLibrary(true); } catch {}
        } catch (err) {
            console.error('Item removal error:', err);
            setError(err instanceof Error ? err.message : 'Item removal failed. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    const resetResult = () => {
        setResultImage(null);
        if (canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d');
            if (ctx) {
                ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            }
        }
        setMaskHistory([]);
    };

    return (
        <div className="h-screen flex bg-[#0a0a0b]">
            {/* Navigation Rail */}
            <NavigationRail isMobileOpen={mobileMenuOpen} onMobileClose={() => setMobileMenuOpen(false)} />
{/* Main Content */}
            <div className="flex-1 flex ml-0 lg:ml-16">
                {/* Left Sidebar - Controls */}
                <div className="w-[300px] flex-shrink-0 bg-[#111113] border-r border-white/5 flex flex-col">
                    {/* Header */}
                    <div className="p-4 border-b border-white/5">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => navigate('/studio/real-estate')}
                                className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                            >
                                <ArrowLeft size={18} className="text-zinc-400" />
                            </button>
                            <div>
                                <h1 className="text-base font-semibold text-white flex items-center gap-2">
                                    <Eraser size={18} className="text-rose-400" />
                                    Item Removal
                                </h1>
                            </div>
                        </div>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-5">
                        {/* Upload Area */}
                        <div>
                            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-2 block">
                                Photo
                            </label>
                            {!imagePreview ? (
                                <div
                                    onDragEnter={handleDrag}
                                    onDragLeave={handleDrag}
                                    onDragOver={handleDrag}
                                    onDrop={handleDrop}
                                    className={`
                                        relative border border-dashed rounded-xl p-6 text-center transition-all cursor-pointer
                                        ${isDragging
                                            ? 'border-rose-500 bg-rose-500/10'
                                            : 'border-white/10 hover:border-white/20 bg-white/[0.02]'
                                        }
                                    `}
                                >
                                    <input
                                        type="file"
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        onChange={handleFileChange}
                                        accept="image/*"
                                    />
                                    <UploadCloud size={28} className="mx-auto mb-2 text-zinc-500" />
                                    <p className="text-sm text-zinc-400">Drop image here</p>
                                    <p className="text-xs text-zinc-600 mt-1">or click to browse</p>
                                </div>
                            ) : (
                                <div className="relative rounded-xl overflow-hidden group">
                                    <img
                                        src={imagePreview}
                                        alt="Photo"
                                        className="w-full h-32 object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                        <button
                                            onClick={removeImage}
                                            className="p-2 bg-red-500/80 hover:bg-red-500 rounded-lg text-white transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Brush Tool */}
                        {imagePreview && !resultImage && (
                            <div>
                                <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-3 block">
                                    Brush Tool
                                </label>

                                {/* Brush Size */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-zinc-500">Size</span>
                                        <span className="text-xs text-zinc-400 font-mono">{brushSize}px</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="5"
                                        max="100"
                                        value={brushSize}
                                        onChange={(e) => setBrushSize(Number(e.target.value))}
                                        className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-rose-500 [&::-webkit-slider-thumb]:cursor-pointer"
                                    />

                                    {/* Brush Preview */}
                                    <div className="flex items-center justify-center py-4 bg-white/[0.02] rounded-xl">
                                        <div
                                            className="rounded-full bg-rose-500/50 border-2 border-rose-500"
                                            style={{ width: brushSize, height: brushSize }}
                                        />
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2 mt-4">
                                    <button
                                        onClick={handleUndo}
                                        disabled={maskHistory.length === 0}
                                        className="flex-1 py-2 px-3 text-xs font-medium bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-zinc-300 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                                    >
                                        <Undo2 size={14} />
                                        Undo
                                    </button>
                                    <button
                                        onClick={clearMask}
                                        className="flex-1 py-2 px-3 text-xs font-medium bg-white/5 hover:bg-white/10 text-zinc-300 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                                    >
                                        <RotateCcw size={14} />
                                        Clear
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Instructions */}
                        <div className="p-3 rounded-xl bg-rose-500/5 border border-rose-500/10">
                            <p className="text-xs text-rose-300/80 leading-relaxed">
                                <strong className="text-rose-300">How to use:</strong> Paint over the objects you want to remove. The AI will intelligently fill in the area.
                            </p>
                        </div>
                    </div>

                    {/* Generate Button */}
                    <div className="p-4 border-t border-white/5">
                        {resultImage ? (
                            <button
                                onClick={resetResult}
                                className="w-full py-3 rounded-xl font-semibold text-sm bg-white/5 hover:bg-white/10 text-zinc-300 transition-all flex items-center justify-center gap-2"
                            >
                                <RotateCcw size={18} />
                                Remove More
                            </button>
                        ) : (
                            <button
                                onClick={handleGenerate}
                                disabled={!uploadedImage || !hasMask() || isGenerating}
                                className={`w-full py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                                    uploadedImage && hasMask() && !isGenerating
                                        ? 'bg-rose-600 hover:bg-rose-500 text-white'
                                        : 'bg-white/5 text-zinc-600 cursor-not-allowed'
                                }`}
                            >
                                {isGenerating ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin" />
                                        Removing {generationProgress}%
                                    </>
                                ) : (
                                    <>
                                        <Sparkles size={18} />
                                        Remove Objects
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>

                {/* Right - Canvas Area */}
                <div className="flex-1 flex flex-col bg-[#0a0a0b]">
                    {/* Canvas Header */}
                    <div className="h-14 flex items-center justify-between px-6 border-b border-white/5">
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-zinc-500">
                                {resultImage ? 'Result' : imagePreview ? 'Paint over objects to remove' : 'Canvas'}
                            </span>
                            {imagePreview && !resultImage && (
                                <div className="flex items-center gap-2 px-3 py-1 bg-rose-500/10 rounded-full">
                                    <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                                    <span className="text-xs text-rose-400">Brush active</span>
                                </div>
                            )}
                        </div>
                        {resultImage && (
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={resetResult}
                                    className="px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors flex items-center gap-1.5"
                                >
                                    <RefreshCw size={14} />
                                    Try Again
                                </button>
                                {savedToLibrary ? (
                                    <span className="px-3 py-1.5 text-xs font-medium text-emerald-400 bg-emerald-500/10 rounded-lg flex items-center gap-1.5"><BookmarkPlus size={14} />Saved to Library</span>
                                ) : (
                                    <button onClick={async () => { if (resultImage) { try { await addAsset(resultImage, 'image', 'Item Removal Result'); setSavedToLibrary(true); } catch {} } }} className="px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors flex items-center gap-1.5"><BookmarkPlus size={14} />Save to Library</button>
                                )}
                                <button onClick={() => resultImage && downloadFile(resultImage, `item-removed-${Date.now()}.jpg`)} className="px-3 py-1.5 text-xs font-medium text-white bg-rose-600 hover:bg-rose-500 rounded-lg transition-colors flex items-center gap-1.5">
                                    <Download size={14} />
                                    Download
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Canvas Content */}
                    <div
                        ref={containerRef}
                        className="flex-1 flex items-center justify-center p-8 overflow-hidden"
                    >
                        {error ? (
                            /* Error State */
                            <div className="text-center">
                                <div className="w-20 h-20 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                                    <AlertCircle size={32} className="text-red-500" />
                                </div>
                                <p className="text-red-400 text-sm font-medium mb-2">Item Removal Failed</p>
                                <p className="text-zinc-500 text-xs max-w-xs">{error}</p>
                                <button
                                    onClick={() => setError(null)}
                                    className="mt-4 px-4 py-2 text-xs font-medium text-white bg-rose-600 hover:bg-rose-500 rounded-lg transition-colors"
                                >
                                    Try Again
                                </button>
                            </div>
                        ) : !imagePreview ? (
                            /* Empty State */
                            <div className="text-center">
                                <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
                                    <ImageIcon size={32} className="text-zinc-700" />
                                </div>
                                <p className="text-zinc-500 text-sm">Upload a photo to get started</p>
                            </div>
                        ) : resultImage && imagePreview ? (
                            /* Result with Before/After */
                            <div className="w-full max-w-4xl">
                                <BeforeAfterSlider
                                    beforeImage={imagePreview}
                                    afterImage={resultImage}
                                    beforeLabel="Original"
                                    afterLabel="Objects Removed"
                                    className="shadow-2xl"
                                />
                            </div>
                        ) : isGenerating ? (
                            /* Generating State */
                            <div className="text-center">
                                <div className="relative w-24 h-24 mx-auto mb-6">
                                    <svg className="w-full h-full -rotate-90">
                                        <circle
                                            cx="48"
                                            cy="48"
                                            r="44"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                            fill="none"
                                            className="text-white/10"
                                        />
                                        <circle
                                            cx="48"
                                            cy="48"
                                            r="44"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                            fill="none"
                                            strokeDasharray={276.46}
                                            strokeDashoffset={276.46 - (276.46 * generationProgress) / 100}
                                            className="text-rose-500 transition-all duration-300"
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                    <span className="absolute inset-0 flex items-center justify-center text-xl font-semibold text-white">
                                        {generationProgress}%
                                    </span>
                                </div>
                                <p className="text-zinc-400 font-medium">Removing objects...</p>
                                <p className="text-zinc-600 text-sm mt-1">AI is filling in the gaps</p>
                            </div>
                        ) : imageLoaded ? (
                            /* Canvas with Image */
                            <div
                                className="relative rounded-2xl overflow-hidden shadow-2xl"
                                style={{ width: canvasSize.width, height: canvasSize.height }}
                            >
                                {/* Background Image */}
                                <img
                                    src={imagePreview}
                                    alt="Original"
                                    className="absolute inset-0 w-full h-full object-cover"
                                    draggable={false}
                                />

                                {/* Drawing Canvas */}
                                <canvas
                                    ref={canvasRef}
                                    width={canvasSize.width}
                                    height={canvasSize.height}
                                    onMouseDown={startDrawing}
                                    onMouseMove={draw}
                                    onMouseUp={stopDrawing}
                                    onMouseLeave={stopDrawing}
                                    onTouchStart={startDrawing}
                                    onTouchMove={draw}
                                    onTouchEnd={stopDrawing}
                                    className="absolute inset-0 cursor-crosshair"
                                    style={{ touchAction: 'none' }}
                                />

                                {/* Cursor Preview - follows mouse */}
                                <div
                                    className="pointer-events-none absolute rounded-full border-2 border-rose-500 bg-rose-500/20 -translate-x-1/2 -translate-y-1/2 opacity-0 hover:opacity-100"
                                    style={{
                                        width: brushSize,
                                        height: brushSize,
                                    }}
                                />
                            </div>
                        ) : (
                            /* Loading Image */
                            <div className="text-center">
                                <Loader2 size={32} className="animate-spin text-zinc-600 mx-auto mb-4" />
                                <p className="text-zinc-500 text-sm">Loading image...</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export const ItemRemovalTool: React.FC = () => (
    <AssetProvider>
        <ItemRemovalToolInner />
    </AssetProvider>
);
