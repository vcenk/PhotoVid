import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { NavigationRail, FlyoutType } from '../dashboard/navigation/NavigationRail';
import { FlyoutPanels } from '../dashboard/navigation/FlyoutPanels';
import {
    Video, ArrowRight, Car, Loader2, FileText, Wand2, ArrowLeft,
    UploadCloud, Trash2, Play, Pause, Plus, GripVertical, Sparkles,
    Download, Settings, Music, Film, Clock, ChevronDown
} from 'lucide-react';

// Vehicle data types
interface VehicleData {
    make: string;
    model: string;
    year: number;
    trim?: string;
    vin?: string;
    price?: number;
    mileage?: number;
    color: string;
    features: string[];
    description: string;
}

interface VehicleScene {
    id: string;
    order: number;
    type: 'exterior-front' | 'exterior-rear' | 'exterior-side' | 'interior' | 'dashboard' | 'engine' | 'wheels' | 'detail' | 'feature';
    label: string;
    imageUrl: string | null;
    videoUrl: string | null;
    duration: number;
    motionStyle: 'pan-left' | 'pan-right' | 'zoom-in' | 'zoom-out' | 'orbit' | 'dolly-forward';
    status: 'pending' | 'uploading' | 'ready' | 'generating' | 'completed' | 'failed';
}

type CreationMode = 'select' | 'quick' | 'detailed';

const SCENE_TEMPLATES: Omit<VehicleScene, 'id' | 'imageUrl' | 'videoUrl'>[] = [
    { order: 1, type: 'exterior-front', label: '3/4 Front View', duration: 4, motionStyle: 'orbit', status: 'pending' },
    { order: 2, type: 'exterior-rear', label: '3/4 Rear View', duration: 3, motionStyle: 'orbit', status: 'pending' },
    { order: 3, type: 'exterior-side', label: 'Driver Side', duration: 3, motionStyle: 'pan-left', status: 'pending' },
    { order: 4, type: 'interior', label: 'Full Interior', duration: 4, motionStyle: 'pan-right', status: 'pending' },
    { order: 5, type: 'dashboard', label: 'Dashboard & Console', duration: 3, motionStyle: 'zoom-in', status: 'pending' },
    { order: 6, type: 'wheels', label: 'Wheels & Tires', duration: 2, motionStyle: 'zoom-in', status: 'pending' },
    { order: 7, type: 'engine', label: 'Engine Bay', duration: 3, motionStyle: 'dolly-forward', status: 'pending' },
];

const MOTION_STYLES = [
    { id: 'pan-left', name: 'Pan Left' },
    { id: 'pan-right', name: 'Pan Right' },
    { id: 'zoom-in', name: 'Zoom In' },
    { id: 'zoom-out', name: 'Zoom Out' },
    { id: 'orbit', name: 'Orbit' },
    { id: 'dolly-forward', name: 'Dolly Forward' },
];

const POPULAR_FEATURES = [
    'Leather Seats', 'Sunroof/Moonroof', 'Navigation System', 'Backup Camera',
    'Bluetooth', 'Apple CarPlay', 'Android Auto', 'Heated Seats',
    'Remote Start', 'Keyless Entry', 'Premium Sound', 'Third Row Seating',
    'All-Wheel Drive', 'Towing Package', 'Sport Package', 'Luxury Package'
];

// Vehicle Input Form Component
const VehicleInputForm: React.FC<{
    onSubmit: (data: VehicleData) => void;
    onAutoGenerate: (data: VehicleData) => void;
    isGenerating: boolean;
}> = ({ onSubmit, onAutoGenerate, isGenerating }) => {
    const [formData, setFormData] = useState<VehicleData>({
        make: '',
        model: '',
        year: new Date().getFullYear(),
        trim: '',
        vin: '',
        price: undefined,
        mileage: undefined,
        color: '',
        features: [],
        description: '',
    });

    const updateField = (field: keyof VehicleData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const toggleFeature = (feature: string) => {
        setFormData(prev => ({
            ...prev,
            features: prev.features.includes(feature)
                ? prev.features.filter(f => f !== feature)
                : [...prev.features, feature]
        }));
    };

    const isValid = formData.make.trim() && formData.model.trim() && formData.color.trim();

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
                <div>
                    <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-2 block">Year</label>
                    <input
                        type="number"
                        value={formData.year}
                        onChange={(e) => updateField('year', parseInt(e.target.value))}
                        min={1980}
                        max={new Date().getFullYear() + 1}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                </div>
                <div>
                    <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-2 block">Make *</label>
                    <input
                        type="text"
                        value={formData.make}
                        onChange={(e) => updateField('make', e.target.value)}
                        placeholder="e.g., Toyota"
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                </div>
                <div>
                    <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-2 block">Model *</label>
                    <input
                        type="text"
                        value={formData.model}
                        onChange={(e) => updateField('model', e.target.value)}
                        placeholder="e.g., Camry"
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-2 block">Trim (optional)</label>
                    <input
                        type="text"
                        value={formData.trim}
                        onChange={(e) => updateField('trim', e.target.value)}
                        placeholder="e.g., XLE, Sport, Limited"
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                </div>
                <div>
                    <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-2 block">Color *</label>
                    <input
                        type="text"
                        value={formData.color}
                        onChange={(e) => updateField('color', e.target.value)}
                        placeholder="e.g., Midnight Black"
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-2 block">Price (optional)</label>
                    <input
                        type="number"
                        value={formData.price || ''}
                        onChange={(e) => updateField('price', e.target.value ? parseInt(e.target.value) : undefined)}
                        placeholder="e.g., 35000"
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                </div>
                <div>
                    <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-2 block">Mileage (optional)</label>
                    <input
                        type="number"
                        value={formData.mileage || ''}
                        onChange={(e) => updateField('mileage', e.target.value ? parseInt(e.target.value) : undefined)}
                        placeholder="e.g., 25000"
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                </div>
            </div>

            <div>
                <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-3 block">Key Features</label>
                <div className="flex flex-wrap gap-2">
                    {POPULAR_FEATURES.map((feature) => (
                        <button
                            key={feature}
                            onClick={() => toggleFeature(feature)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                formData.features.includes(feature)
                                    ? 'bg-red-500/20 text-red-300 border border-red-500/50'
                                    : 'bg-white/5 text-zinc-400 border border-white/10 hover:border-white/20'
                            }`}
                        >
                            {feature}
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-2 block">Description (optional)</label>
                <textarea
                    value={formData.description}
                    onChange={(e) => updateField('description', e.target.value)}
                    placeholder="Add any additional details about the vehicle..."
                    rows={3}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                />
            </div>

            <div className="flex gap-3 pt-4">
                <button
                    onClick={() => onSubmit(formData)}
                    disabled={!isValid}
                    className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                        isValid ? 'bg-white/10 hover:bg-white/15 text-white border border-white/20' : 'bg-white/5 text-zinc-600 cursor-not-allowed'
                    }`}
                >
                    <FileText size={18} />
                    Create Blank Storyboard
                </button>
                <button
                    onClick={() => onAutoGenerate(formData)}
                    disabled={!isValid || isGenerating}
                    className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                        isValid && !isGenerating ? 'bg-red-600 hover:bg-red-500 text-white' : 'bg-white/5 text-zinc-600 cursor-not-allowed'
                    }`}
                >
                    {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <Wand2 size={18} />}
                    {isGenerating ? 'Generating...' : 'Auto-Generate Scenes'}
                </button>
            </div>
        </div>
    );
};

// Scene Card Component
const SceneCard: React.FC<{
    scene: VehicleScene;
    onUpload: (file: File) => void;
    onRemove: () => void;
    onUpdateDuration: (duration: number) => void;
    onUpdateMotion: (motion: VehicleScene['motionStyle']) => void;
    onGenerate: () => void;
}> = ({ scene, onUpload, onRemove, onUpdateDuration, onUpdateMotion, onGenerate }) => {
    const [isDragging, setIsDragging] = useState(false);

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
            onUpload(e.dataTransfer.files[0]);
        }
    }, [onUpload]);

    return (
        <div className="flex-shrink-0 w-[200px] bg-white/5 border border-white/10 rounded-xl overflow-hidden group">
            {/* Thumbnail Area */}
            <div className="relative h-[120px]">
                {scene.imageUrl ? (
                    <>
                        <img src={scene.imageUrl} alt={scene.label} className="w-full h-full object-cover" />
                        {scene.status === 'generating' && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                <Loader2 size={24} className="text-red-400 animate-spin" />
                            </div>
                        )}
                        {scene.videoUrl && (
                            <div className="absolute bottom-2 right-2 px-2 py-1 bg-green-500/80 rounded text-[10px] text-white font-medium">
                                Video Ready
                            </div>
                        )}
                        <button
                            onClick={onRemove}
                            className="absolute top-2 right-2 p-1 bg-red-500/80 hover:bg-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <Trash2 size={12} className="text-white" />
                        </button>
                    </>
                ) : (
                    <div
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        className={`relative h-full flex flex-col items-center justify-center cursor-pointer transition-colors ${
                            isDragging ? 'bg-red-500/10' : 'hover:bg-white/5'
                        }`}
                    >
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                        <UploadCloud size={24} className="text-zinc-600 mb-1" />
                        <span className="text-[10px] text-zinc-500">Upload</span>
                    </div>
                )}
            </div>

            {/* Scene Info */}
            <div className="p-3">
                <div className="flex items-center gap-2 mb-2">
                    <GripVertical size={12} className="text-zinc-600 cursor-grab" />
                    <span className="text-xs font-medium text-white truncate">{scene.label}</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-zinc-500">
                    <Clock size={10} />
                    <select
                        value={scene.duration}
                        onChange={(e) => onUpdateDuration(parseInt(e.target.value))}
                        className="bg-transparent text-zinc-400 focus:outline-none cursor-pointer"
                    >
                        {[2, 3, 4, 5, 6, 8, 10].map((d) => (
                            <option key={d} value={d} className="bg-zinc-900">{d}s</option>
                        ))}
                    </select>
                    <select
                        value={scene.motionStyle}
                        onChange={(e) => onUpdateMotion(e.target.value as VehicleScene['motionStyle'])}
                        className="bg-transparent text-zinc-400 focus:outline-none cursor-pointer ml-auto"
                    >
                        {MOTION_STYLES.map((m) => (
                            <option key={m.id} value={m.id} className="bg-zinc-900">{m.name}</option>
                        ))}
                    </select>
                </div>
                {scene.imageUrl && !scene.videoUrl && (
                    <button
                        onClick={onGenerate}
                        disabled={scene.status === 'generating'}
                        className="w-full mt-2 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg text-[10px] font-medium flex items-center justify-center gap-1 transition-colors"
                    >
                        <Sparkles size={10} />
                        Generate Video
                    </button>
                )}
            </div>
        </div>
    );
};

// Storyboard Editor Component
const StoryboardEditorView: React.FC<{
    vehicleData: VehicleData;
    scenes: VehicleScene[];
    onScenesChange: (scenes: VehicleScene[]) => void;
    onBack: () => void;
}> = ({ vehicleData, scenes, onScenesChange, onBack }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentSceneIndex, setCurrentSceneIndex] = useState(0);

    const totalDuration = scenes.reduce((acc, s) => acc + s.duration, 0);
    const vehicleTitle = `${vehicleData.year} ${vehicleData.make} ${vehicleData.model}${vehicleData.trim ? ` ${vehicleData.trim}` : ''}`;

    const handleUpload = (index: number, file: File) => {
        const newScenes = [...scenes];
        newScenes[index] = {
            ...newScenes[index],
            imageUrl: URL.createObjectURL(file),
            status: 'ready',
        };
        onScenesChange(newScenes);
    };

    const handleRemove = (index: number) => {
        const newScenes = [...scenes];
        newScenes[index] = {
            ...newScenes[index],
            imageUrl: null,
            videoUrl: null,
            status: 'pending',
        };
        onScenesChange(newScenes);
    };

    const handleUpdateDuration = (index: number, duration: number) => {
        const newScenes = [...scenes];
        newScenes[index] = { ...newScenes[index], duration };
        onScenesChange(newScenes);
    };

    const handleUpdateMotion = (index: number, motionStyle: VehicleScene['motionStyle']) => {
        const newScenes = [...scenes];
        newScenes[index] = { ...newScenes[index], motionStyle };
        onScenesChange(newScenes);
    };

    const handleGenerate = (index: number) => {
        const newScenes = [...scenes];
        newScenes[index] = { ...newScenes[index], status: 'generating' };
        onScenesChange(newScenes);

        // Simulate generation
        setTimeout(() => {
            const updatedScenes = [...scenes];
            updatedScenes[index] = {
                ...updatedScenes[index],
                videoUrl: 'https://videos.pexels.com/video-files/3945113/3945113-uhd_2560_1440_24fps.mp4',
                status: 'completed',
            };
            onScenesChange(updatedScenes);
        }, 3000);
    };

    const addScene = () => {
        const newScene: VehicleScene = {
            id: `scene-${Date.now()}`,
            order: scenes.length + 1,
            type: 'detail',
            label: `Custom Shot ${scenes.length + 1}`,
            imageUrl: null,
            videoUrl: null,
            duration: 3,
            motionStyle: 'zoom-in',
            status: 'pending',
        };
        onScenesChange([...scenes, newScene]);
    };

    const currentScene = scenes[currentSceneIndex];
    const previewUrl = currentScene?.videoUrl || currentScene?.imageUrl;

    return (
        <div className="flex-1 flex flex-col">
            {/* Header */}
            <div className="h-14 flex items-center justify-between px-6 border-b border-white/5">
                <div className="flex items-center gap-3">
                    <button
                        onClick={onBack}
                        className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                    >
                        <ArrowLeft size={18} className="text-zinc-400" />
                    </button>
                    <div>
                        <h1 className="text-sm font-semibold text-white">{vehicleTitle}</h1>
                        <p className="text-xs text-zinc-500">{vehicleData.color} • {scenes.length} scenes • {totalDuration}s total</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button className="px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors flex items-center gap-1.5">
                        <Music size={14} />
                        Add Music
                    </button>
                    <button className="px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors flex items-center gap-1.5">
                        <Settings size={14} />
                        Settings
                    </button>
                    <button className="px-4 py-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-500 rounded-lg transition-colors flex items-center gap-1.5">
                        <Download size={14} />
                        Export
                    </button>
                </div>
            </div>

            {/* Preview Area */}
            <div className="flex-1 flex items-center justify-center p-8 bg-black/50">
                <div className="relative max-w-4xl w-full aspect-video bg-zinc-900 rounded-2xl overflow-hidden shadow-2xl">
                    {previewUrl ? (
                        <>
                            {currentScene.videoUrl ? (
                                <video
                                    src={currentScene.videoUrl}
                                    className="w-full h-full object-cover"
                                    autoPlay={isPlaying}
                                    loop
                                    muted
                                />
                            ) : (
                                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                            )}
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
                                <button
                                    onClick={() => setIsPlaying(!isPlaying)}
                                    className="p-3 bg-white/20 backdrop-blur rounded-full hover:bg-white/30 transition-colors"
                                >
                                    {isPlaying ? <Pause size={20} className="text-white" /> : <Play size={20} className="text-white" />}
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <div className="text-center">
                                <Film size={48} className="text-zinc-700 mx-auto mb-3" />
                                <p className="text-zinc-500 text-sm">Upload photos to preview</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Scene Strip */}
            <div className="border-t border-white/5 p-4">
                <div className="flex gap-3 overflow-x-auto pb-2">
                    {scenes.map((scene, index) => (
                        <div
                            key={scene.id}
                            onClick={() => setCurrentSceneIndex(index)}
                            className={`cursor-pointer transition-all ${currentSceneIndex === index ? 'ring-2 ring-red-500 rounded-xl' : ''}`}
                        >
                            <SceneCard
                                scene={scene}
                                onUpload={(file) => handleUpload(index, file)}
                                onRemove={() => handleRemove(index)}
                                onUpdateDuration={(d) => handleUpdateDuration(index, d)}
                                onUpdateMotion={(m) => handleUpdateMotion(index, m)}
                                onGenerate={() => handleGenerate(index)}
                            />
                        </div>
                    ))}
                    <button
                        onClick={addScene}
                        className="flex-shrink-0 w-[200px] h-[190px] border border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-red-500/50 hover:bg-red-500/5 transition-colors"
                    >
                        <Plus size={24} className="text-zinc-600" />
                        <span className="text-xs text-zinc-500">Add Scene</span>
                    </button>
                </div>
            </div>

            {/* Timeline */}
            <div className="h-12 border-t border-white/5 px-6 flex items-center gap-4">
                <span className="text-xs text-zinc-500">Timeline</span>
                <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden flex">
                    {scenes.map((scene, index) => (
                        <div
                            key={scene.id}
                            style={{ width: `${(scene.duration / totalDuration) * 100}%` }}
                            onClick={() => setCurrentSceneIndex(index)}
                            className={`h-full cursor-pointer transition-colors ${
                                currentSceneIndex === index ? 'bg-red-500' : scene.videoUrl ? 'bg-red-500/50' : scene.imageUrl ? 'bg-zinc-600' : 'bg-zinc-800'
                            } ${index > 0 ? 'border-l border-black/30' : ''}`}
                        />
                    ))}
                </div>
                <span className="text-xs text-zinc-400">{totalDuration}s</span>
            </div>
        </div>
    );
};

// New Storyboard Form
const NewStoryboardForm: React.FC<{
    onCreateStoryboard: (vehicleData: VehicleData, scenes: VehicleScene[]) => void;
}> = ({ onCreateStoryboard }) => {
    const navigate = useNavigate();
    const [mode, setMode] = useState<CreationMode>('select');
    const [creating, setCreating] = useState(false);

    const generateScenes = (vehicleData: VehicleData): VehicleScene[] => {
        return SCENE_TEMPLATES.map((template, index) => ({
            ...template,
            id: `scene-${index}-${Date.now()}`,
            imageUrl: null,
            videoUrl: null,
        }));
    };

    const handleQuickCreate = (name: string) => {
        setCreating(true);
        const vehicleData: VehicleData = {
            make: '',
            model: name,
            year: new Date().getFullYear(),
            color: '',
            features: [],
            description: '',
        };
        const scenes = generateScenes(vehicleData);
        onCreateStoryboard(vehicleData, scenes);
    };

    const handleDetailedSubmit = (vehicleData: VehicleData) => {
        const scenes = generateScenes(vehicleData);
        onCreateStoryboard(vehicleData, scenes);
    };

    const handleAutoGenerate = (vehicleData: VehicleData) => {
        setCreating(true);
        // Auto-generate optimized scenes based on vehicle type
        const scenes = generateScenes(vehicleData);
        setTimeout(() => {
            onCreateStoryboard(vehicleData, scenes);
        }, 1500);
    };

    if (mode === 'select') {
        return (
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="max-w-2xl w-full">
                    <div className="text-center mb-10">
                        <div className="w-16 h-16 rounded-2xl bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                            <Video size={32} className="text-red-400" />
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-2">Create Vehicle Storyboard</h1>
                        <p className="text-zinc-400 text-sm">
                            Build scroll-stopping showcase videos for your inventory listings
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <button
                            onClick={() => setMode('quick')}
                            className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-red-500/50 hover:bg-red-500/5 transition-all text-left group"
                        >
                            <div className="w-12 h-12 rounded-xl bg-zinc-700/50 flex items-center justify-center mb-4 group-hover:bg-zinc-700 transition-colors">
                                <FileText size={24} className="text-zinc-300" />
                            </div>
                            <h3 className="text-sm font-semibold text-white mb-2">Quick Start</h3>
                            <p className="text-xs text-zinc-400">
                                Start with a blank storyboard and add vehicle shots manually.
                            </p>
                        </button>

                        <button
                            onClick={() => setMode('detailed')}
                            className="p-6 rounded-2xl bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/30 hover:border-red-500/50 transition-all text-left group"
                        >
                            <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center mb-4 group-hover:bg-red-500/30 transition-colors">
                                <Wand2 size={24} className="text-red-400" />
                            </div>
                            <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                                AI Auto-Generate
                                <span className="px-1.5 py-0.5 bg-red-500/30 text-red-300 rounded text-[10px] uppercase">Recommended</span>
                            </h3>
                            <p className="text-xs text-zinc-400">
                                Enter vehicle details and get optimized scene suggestions.
                            </p>
                        </button>
                    </div>

                    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                        <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                            <Car size={16} className="text-red-400" />
                            How it works
                        </h3>
                        <ol className="space-y-2 text-xs text-zinc-400">
                            <li className="flex gap-2">
                                <span className="w-5 h-5 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center flex-shrink-0">1</span>
                                Enter vehicle details or start with a blank storyboard
                            </li>
                            <li className="flex gap-2">
                                <span className="w-5 h-5 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center flex-shrink-0">2</span>
                                Upload photos for each angle (exterior, interior, details)
                            </li>
                            <li className="flex gap-2">
                                <span className="w-5 h-5 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center flex-shrink-0">3</span>
                                Generate AI-powered motion clips for each scene
                            </li>
                            <li className="flex gap-2">
                                <span className="w-5 h-5 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center flex-shrink-0">4</span>
                                Preview, add music, and export your showcase video
                            </li>
                        </ol>
                    </div>
                </div>
            </div>
        );
    }

    if (mode === 'quick') {
        const [name, setName] = useState('');
        return (
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="max-w-md w-full">
                    <button
                        onClick={() => setMode('select')}
                        className="mb-6 text-xs text-zinc-400 hover:text-white flex items-center gap-1"
                    >
                        <ArrowRight size={12} className="rotate-180" />
                        Back
                    </button>

                    <div className="text-center mb-8">
                        <div className="w-16 h-16 rounded-2xl bg-zinc-700/50 flex items-center justify-center mx-auto mb-4">
                            <FileText size={32} className="text-zinc-300" />
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-2">Quick Start</h1>
                        <p className="text-zinc-400 text-sm">
                            Create a blank storyboard and add shots as you go
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-2 block">
                                Storyboard Name
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g., 2024 BMW M4 Competition"
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                            />
                        </div>

                        <button
                            onClick={() => handleQuickCreate(name)}
                            disabled={!name.trim() || creating}
                            className={`w-full py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                                name.trim() && !creating
                                    ? 'bg-red-600 hover:bg-red-500 text-white'
                                    : 'bg-white/5 text-zinc-600 cursor-not-allowed'
                            }`}
                        >
                            {creating ? (
                                <Loader2 size={18} className="animate-spin" />
                            ) : (
                                <>
                                    Create Storyboard
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto p-8">
            <div className="max-w-2xl mx-auto">
                <button
                    onClick={() => setMode('select')}
                    className="mb-6 text-xs text-zinc-400 hover:text-white flex items-center gap-1"
                >
                    <ArrowRight size={12} className="rotate-180" />
                    Back
                </button>

                <div className="text-center mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                        <Wand2 size={32} className="text-red-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">AI Auto-Generate Storyboard</h1>
                    <p className="text-zinc-400 text-sm">
                        Enter your vehicle details for optimized scene suggestions
                    </p>
                </div>

                <VehicleInputForm
                    onSubmit={handleDetailedSubmit}
                    onAutoGenerate={handleAutoGenerate}
                    isGenerating={creating}
                />
            </div>
        </div>
    );
};

// Main Page Component
export const AutoStoryboardPage: React.FC = () => {
    const navigate = useNavigate();
    const [activeFlyout, setActiveFlyout] = useState<FlyoutType>(null);
    const [storyboard, setStoryboard] = useState<{ vehicleData: VehicleData; scenes: VehicleScene[] } | null>(null);

    const handleCreateStoryboard = (vehicleData: VehicleData, scenes: VehicleScene[]) => {
        setStoryboard({ vehicleData, scenes });
    };

    const handleScenesChange = (scenes: VehicleScene[]) => {
        if (storyboard) {
            setStoryboard({ ...storyboard, scenes });
        }
    };

    const handleBack = () => {
        setStoryboard(null);
    };

    return (
        <div className="h-screen flex bg-[#0a0a0b]">
            <NavigationRail activeFlyout={activeFlyout} onFlyoutChange={setActiveFlyout} />
            <FlyoutPanels activeFlyout={activeFlyout} onClose={() => setActiveFlyout(null)} />

            <div className="flex-1 flex flex-col ml-56">
                {storyboard ? (
                    <StoryboardEditorView
                        vehicleData={storyboard.vehicleData}
                        scenes={storyboard.scenes}
                        onScenesChange={handleScenesChange}
                        onBack={handleBack}
                    />
                ) : (
                    <NewStoryboardForm onCreateStoryboard={handleCreateStoryboard} />
                )}
            </div>
        </div>
    );
};
