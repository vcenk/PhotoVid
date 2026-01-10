import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus,
    Sparkles,
    Settings2,
    Image as ImageIcon,
    Wand2,
    Grid,
    LayoutGrid,
    Square,
    RectangleHorizontal,
    RectangleVertical,
    X,
    Heart,
    Download,
    RefreshCw,
    Zap,
    Lock,
    Check
} from 'lucide-react';

// Rich gallery data with diverse AI-generated image styles and prompts
interface GalleryImage {
    id: string;
    src: string;
    prompt: string;
    model: string;
    likes: number;
    style: string;
}

const GALLERY_IMAGES: GalleryImage[] = [
    // Fantasy & Sci-Fi
    { id: '1', src: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&h=700&fit=crop', prompt: 'A mystical floating castle in the clouds at sunset, magical atmosphere, ethereal lighting, fantasy art style', model: 'ImagineArt 1.5', likes: 2847, style: 'Fantasy' },
    { id: '2', src: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500&h=500&fit=crop', prompt: 'Futuristic cyberpunk city at night, neon lights reflecting on wet streets, flying cars, holographic advertisements', model: 'Flux 2 Max', likes: 3921, style: 'Sci-Fi' },
    { id: '3', src: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500&h=600&fit=crop', prompt: 'Ancient dragon perched on a mountain peak, scales glistening, dramatic storm clouds, epic fantasy illustration', model: 'Midjourney V6', likes: 5234, style: 'Fantasy' },

    // Portraits & Characters
    { id: '4', src: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=700&fit=crop', prompt: 'Portrait of a wise elderly wizard with a long silver beard, glowing blue eyes, mystical robes, detailed fantasy art', model: 'DALL-E 3', likes: 1893, style: 'Portrait' },
    { id: '5', src: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&h=800&fit=crop', prompt: 'Elegant elven princess with flowing silver hair, pointed ears, wearing crystal crown, ethereal forest background', model: 'ImagineArt 1.5', likes: 4102, style: 'Portrait' },
    { id: '6', src: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=500&h=650&fit=crop', prompt: 'Cyberpunk street samurai woman, neon tattoos, futuristic armor, rain-soaked alley backdrop, cinematic lighting', model: 'Stable Diffusion XL', likes: 2756, style: 'Portrait' },

    // Nature & Landscapes
    { id: '7', src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=500&fit=crop', prompt: 'Breathtaking aurora borealis over snowy mountains, crystal clear lake reflection, starry night sky, long exposure style', model: 'Flux 2 Max', likes: 6823, style: 'Landscape' },
    { id: '8', src: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=500&h=600&fit=crop', prompt: 'Enchanted forest with bioluminescent plants, soft mist, magical creatures hiding, fantasy nature scene', model: 'ImagineArt 1.5', likes: 3456, style: 'Landscape' },
    { id: '9', src: 'https://images.unsplash.com/photo-1507400492013-162706c8c05e?w=500&h=750&fit=crop', prompt: 'Tropical paradise island with crystal clear water, white sand beach, palm trees, perfect sunset, photorealistic', model: 'DALL-E 3', likes: 2198, style: 'Landscape' },

    // Abstract & Artistic
    { id: '10', src: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=500&h=500&fit=crop', prompt: 'Abstract fluid art explosion of colors, vibrant gradients, flowing organic shapes, digital art style', model: 'Stable Diffusion XL', likes: 1567, style: 'Abstract' },
    { id: '11', src: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&h=600&fit=crop', prompt: 'Geometric patterns forming a cosmic mandala, sacred geometry, gold and deep purple palette, spiritual artwork', model: 'ImagineArt 1.5', likes: 2890, style: 'Abstract' },
    { id: '12', src: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=500&h=700&fit=crop', prompt: 'Surrealist dreamscape with melting clocks and floating islands, Salvador Dali inspired, oil painting texture', model: 'Midjourney V6', likes: 4521, style: 'Abstract' },

    // Architecture & Interior
    { id: '13', src: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=500&h=500&fit=crop', prompt: 'Modern minimalist mansion with floor-to-ceiling windows, infinity pool, mountain view, architectural photography', model: 'Flux 2 Max', likes: 3789, style: 'Architecture' },
    { id: '14', src: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=500&h=650&fit=crop', prompt: 'Luxurious penthouse interior, marble floors, designer furniture, panoramic city skyline view at dusk', model: 'DALL-E 3', likes: 2134, style: 'Interior' },
    { id: '15', src: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=500&h=500&fit=crop', prompt: 'Cozy Scandinavian living room, warm minimalism, natural light, house plants, hygge atmosphere', model: 'ImagineArt 1.5', likes: 5678, style: 'Interior' },

    // Animals & Wildlife
    { id: '16', src: 'https://images.unsplash.com/photo-1474511320723-9a56873571b7?w=500&h=700&fit=crop', prompt: 'Majestic white wolf in a snowy forest, piercing blue eyes, moonlight filtering through trees, wildlife photography', model: 'Stable Diffusion XL', likes: 7234, style: 'Wildlife' },
    { id: '17', src: 'https://images.unsplash.com/photo-1437622368342-7a3d73a34c8f?w=500&h=500&fit=crop', prompt: 'Colorful exotic parrot with iridescent feathers, tropical jungle backdrop, macro photography, vibrant colors', model: 'Flux 2 Max', likes: 1923, style: 'Wildlife' },
    { id: '18', src: 'https://images.unsplash.com/photo-1557008075-7f2c5cea5c1c?w=500&h=600&fit=crop', prompt: 'Underwater scene with a sea turtle swimming among coral reefs, tropical fish, crystal clear ocean water', model: 'DALL-E 3', likes: 4567, style: 'Wildlife' },

    // Food & Products
    { id: '19', src: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=500&h=500&fit=crop', prompt: 'Gourmet chocolate dessert with gold leaf decoration, dark moody lighting, food photography, michelin star presentation', model: 'ImagineArt 1.5', likes: 2345, style: 'Food' },
    { id: '20', src: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=500&h=650&fit=crop', prompt: 'Artisan coffee latte art, steaming cup, rustic wooden table, morning light, cozy café atmosphere', model: 'Stable Diffusion XL', likes: 3890, style: 'Food' },
];

// AI Models
const AI_MODELS = [
    { id: 'imagineArt', name: 'ImagineArt 1.5', icon: Sparkles, isPremium: false },
    { id: 'flux2', name: 'Flux 2 Max', icon: Zap, isPremium: true },
    { id: 'dalle3', name: 'DALL-E 3', icon: Wand2, isPremium: true },
    { id: 'midjourney', name: 'Midjourney V6', icon: ImageIcon, isPremium: true },
    { id: 'sdxl', name: 'Stable Diffusion XL', icon: Grid, isPremium: false },
];

// Aspect Ratios
const ASPECT_RATIOS = [
    { id: 'portrait', label: 'Portrait', icon: RectangleVertical, ratio: '3:4' },
    { id: 'square', label: 'Square', icon: Square, ratio: '1:1' },
    { id: 'landscape', label: 'Landscape', icon: RectangleHorizontal, ratio: '16:9' },
];

export const ImageStudio: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [selectedModel, setSelectedModel] = useState(AI_MODELS[0]);
    const [selectedRatio, setSelectedRatio] = useState(ASPECT_RATIOS[1]);
    const [variations, setVariations] = useState(1);
    const [showSettings, setShowSettings] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [hoveredImage, setHoveredImage] = useState<number | null>(null);
    const promptInputRef = useRef<HTMLTextAreaElement>(null);

    const handleGenerate = () => {
        if (!prompt.trim()) return;
        setIsGenerating(true);
        // Simulate generation
        setTimeout(() => {
            setIsGenerating(false);
        }, 3000);
    };

    // Handle Recreate - populate prompt with image's original prompt
    const handleRecreate = (image: GalleryImage) => {
        setPrompt(image.prompt);
        // Find and set the model that was used
        const model = AI_MODELS.find(m => m.name === image.model);
        if (model && !model.isPremium) {
            setSelectedModel(model);
        }
        // Focus the prompt input and scroll to bottom
        promptInputRef.current?.focus();
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    };

    return (
        <div className="h-full flex flex-col bg-white dark:bg-[#09090b] relative">
            {/* Header */}
            <div className="flex-shrink-0 p-6 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                            <Sparkles className="text-violet-500" size={24} />
                            AI Image Studio
                        </h1>
                        <p className="text-sm text-zinc-500 mt-1">Transform your imagination into stunning visuals</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-xl text-sm font-medium hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors flex items-center gap-2">
                            <LayoutGrid size={16} />
                            My Creations
                        </button>
                    </div>
                </div>
            </div>

            {/* Gallery - Masonry Layout */}
            <div className="flex-1 overflow-y-auto p-6 pb-32">
                <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4 max-w-7xl mx-auto">
                    {GALLERY_IMAGES.map((image, idx) => (
                        <motion.div
                            key={image.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.03 }}
                            className="break-inside-avoid mb-4 relative group cursor-pointer"
                            onMouseEnter={() => setHoveredImage(idx)}
                            onMouseLeave={() => setHoveredImage(null)}
                        >
                            <div className="rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                                <img
                                    src={image.src}
                                    alt={image.prompt.slice(0, 50)}
                                    className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
                                />

                                {/* Style Badge */}
                                <div className="absolute top-3 left-3">
                                    <span className="px-2 py-1 bg-black/40 backdrop-blur-sm text-white text-xs font-medium rounded-full">
                                        {image.style}
                                    </span>
                                </div>

                                {/* Hover Overlay */}
                                <AnimatePresence>
                                    {hoveredImage === idx && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4"
                                        >
                                            {/* Prompt Preview */}
                                            <p className="text-white/80 text-xs mb-3 line-clamp-2">
                                                {image.prompt}
                                            </p>

                                            {/* Action Buttons */}
                                            <div className="flex items-center gap-2">
                                                <button className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors flex items-center gap-1">
                                                    <Heart size={14} className="text-white" />
                                                    <span className="text-white text-xs">{(image.likes / 1000).toFixed(1)}k</span>
                                                </button>
                                                <button className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors">
                                                    <Download size={14} className="text-white" />
                                                </button>
                                                <button
                                                    onClick={() => handleRecreate(image)}
                                                    className="flex-1 py-2 px-4 bg-violet-500/80 backdrop-blur-sm rounded-full text-white text-sm font-medium hover:bg-violet-500 transition-colors flex items-center justify-center gap-2"
                                                >
                                                    <RefreshCw size={14} />
                                                    Recreate
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Floating Prompt Bar - Bottom */}
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white dark:from-[#09090b] via-white/95 dark:via-[#09090b]/95 to-transparent pointer-events-none">
                <div className="max-w-4xl mx-auto pointer-events-auto">
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-700 p-4">
                        {/* Main Input Row */}
                        <div className="flex items-center gap-3">
                            {/* Add Image Button */}
                            <button className="flex-shrink-0 w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors flex items-center justify-center group">
                                <Plus size={20} className="text-zinc-500 group-hover:text-violet-500 transition-colors" />
                            </button>

                            {/* Prompt Input */}
                            <div className="flex-1 relative">
                                <textarea
                                    ref={promptInputRef}
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    placeholder="Describe the image you imagine..."
                                    rows={2}
                                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 text-zinc-900 dark:text-white placeholder:text-zinc-400"
                                    style={{ minHeight: '64px', maxHeight: '150px' }}
                                />
                            </div>

                            {/* Model + Ratio Selector */}
                            <button
                                onClick={() => setShowSettings(!showSettings)}
                                className="flex-shrink-0 px-4 py-3 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-xl transition-colors flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300"
                            >
                                <selectedModel.icon size={16} className="text-violet-500" />
                                <span className="hidden sm:inline">{selectedModel.name}</span>
                                <span className="text-zinc-400">/</span>
                                <span>{selectedRatio.ratio}</span>
                                <Settings2 size={14} className="text-zinc-400" />
                            </button>

                            {/* Generate Button */}
                            <button
                                onClick={handleGenerate}
                                disabled={!prompt.trim() || isGenerating}
                                className={`flex-shrink-0 px-6 py-3 rounded-xl font-bold text-white text-sm transition-all flex items-center gap-2 ${prompt.trim() && !isGenerating
                                    ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 active:scale-95 shadow-lg shadow-violet-200 dark:shadow-violet-900/30'
                                    : 'bg-zinc-300 dark:bg-zinc-700 cursor-not-allowed'
                                    }`}
                            >
                                {isGenerating ? (
                                    <>
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                        >
                                            <RefreshCw size={16} />
                                        </motion.div>
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles size={16} />
                                        Create
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Settings Modal */}
            <AnimatePresence>
                {showSettings && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 z-40"
                            onClick={() => setShowSettings(false)}
                        />

                        {/* Modal */}
                        <motion.div
                            initial={{ opacity: 0, y: 50, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 50, scale: 0.95 }}
                            className="fixed bottom-24 left-1/2 -translate-x-1/2 w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-700 z-50 overflow-hidden"
                        >
                            <div className="p-6">
                                {/* Header */}
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Generation Settings</h3>
                                    <button
                                        onClick={() => setShowSettings(false)}
                                        className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                                    >
                                        <X size={20} className="text-zinc-500" />
                                    </button>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    {/* Model Selection */}
                                    <div>
                                        <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3">
                                            Select Model
                                        </label>
                                        <div className="space-y-2">
                                            {AI_MODELS.map((model) => (
                                                <button
                                                    key={model.id}
                                                    onClick={() => !model.isPremium && setSelectedModel(model)}
                                                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${selectedModel.id === model.id
                                                        ? 'bg-violet-50 dark:bg-violet-950/30 border-2 border-violet-500'
                                                        : 'bg-zinc-50 dark:bg-zinc-800 border-2 border-transparent hover:border-zinc-200 dark:hover:border-zinc-700'
                                                        } ${model.isPremium ? 'opacity-70' : ''}`}
                                                >
                                                    <model.icon size={18} className={selectedModel.id === model.id ? 'text-violet-500' : 'text-zinc-500'} />
                                                    <span className={`font-medium ${selectedModel.id === model.id ? 'text-violet-700 dark:text-violet-300' : 'text-zinc-700 dark:text-zinc-300'}`}>
                                                        {model.name}
                                                    </span>
                                                    {model.isPremium && (
                                                        <Lock size={14} className="ml-auto text-amber-500" />
                                                    )}
                                                    {selectedModel.id === model.id && (
                                                        <Check size={16} className="ml-auto text-violet-500" />
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Image Size & Options */}
                                    <div className="space-y-6">
                                        {/* Aspect Ratio */}
                                        <div>
                                            <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3">
                                                Image Size
                                            </label>
                                            <div className="flex gap-2">
                                                {ASPECT_RATIOS.map((ratio) => (
                                                    <button
                                                        key={ratio.id}
                                                        onClick={() => setSelectedRatio(ratio)}
                                                        className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-xl transition-colors ${selectedRatio.id === ratio.id
                                                            ? 'bg-violet-50 dark:bg-violet-950/30 border-2 border-violet-500'
                                                            : 'bg-zinc-50 dark:bg-zinc-800 border-2 border-transparent hover:border-zinc-200 dark:hover:border-zinc-700'
                                                            }`}
                                                    >
                                                        <ratio.icon size={24} className={selectedRatio.id === ratio.id ? 'text-violet-500' : 'text-zinc-400'} />
                                                        <span className={`text-xs font-medium ${selectedRatio.id === ratio.id ? 'text-violet-700 dark:text-violet-300' : 'text-zinc-600 dark:text-zinc-400'}`}>
                                                            {ratio.label}
                                                        </span>
                                                        <span className={`text-[10px] ${selectedRatio.id === ratio.id ? 'text-violet-500' : 'text-zinc-400'}`}>
                                                            {ratio.ratio}
                                                        </span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Variations */}
                                        <div>
                                            <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3">
                                                Variations
                                            </label>
                                            <div className="flex gap-2">
                                                {[1, 2, 3, 4].map((num) => (
                                                    <button
                                                        key={num}
                                                        onClick={() => setVariations(num)}
                                                        className={`flex-1 py-2 rounded-lg font-medium text-sm transition-colors ${variations === num
                                                            ? 'bg-violet-500 text-white'
                                                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                                                            }`}
                                                    >
                                                        {num}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Apply Button */}
                                <div className="mt-6 pt-6 border-t border-zinc-100 dark:border-zinc-800">
                                    <button
                                        onClick={() => setShowSettings(false)}
                                        className="w-full py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold rounded-xl hover:from-violet-700 hover:to-fuchsia-700 transition-colors"
                                    >
                                        Apply Settings
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};
