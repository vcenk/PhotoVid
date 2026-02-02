import React, { useState, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AssetProvider, useAssets, Asset } from '../../lib/store/contexts/AssetContext';
import { NavigationRail } from '../dashboard/navigation/NavigationRail';
import { DashboardTopbar } from '../dashboard/navigation/DashboardTopbar';
import { uploadToR2 } from '../../lib/api/r2';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  Grid3X3,
  LayoutList,
  Image as ImageIcon,
  Video,
  Trash2,
  Download,
  ExternalLink,
  Play,
  Calendar,
  Clock,
  FolderOpen,
  Plus,
  MoreVertical,
  Check,
  X,
  SlidersHorizontal,
  ArrowUpDown,
  Upload,
  Wand2,
  Loader2,
  UploadCloud,
} from 'lucide-react';

type ViewMode = 'grid' | 'list';
type FilterType = 'all' | 'image' | 'video';
type SortType = 'newest' | 'oldest' | 'name';

// Tool options for "Use in Tool" menu
const TOOL_OPTIONS = [
  { id: 'virtual-staging', name: 'Virtual Staging', path: '/studio/real-estate/virtual-staging', icon: '🏠' },
  { id: 'photo-enhancement', name: 'Photo Enhancement', path: '/studio/real-estate/photo-enhancement', icon: '✨' },
  { id: 'sky-replacement', name: 'Sky Replacement', path: '/studio/real-estate/sky-replacement', icon: '☁️' },
  { id: 'twilight', name: 'Day to Twilight', path: '/studio/real-estate/twilight', icon: '🌅' },
  { id: 'item-removal', name: 'Item Removal', path: '/studio/real-estate/item-removal', icon: '🗑️' },
  { id: 'lawn-enhancement', name: 'Lawn Enhancement', path: '/studio/real-estate/lawn-enhancement', icon: '🌿' },
  { id: 'room-tour', name: 'Room Tour Video', path: '/studio/real-estate/room-tour', icon: '🎬' },
];

const MyLibraryContent: React.FC = () => {
  const navigate = useNavigate();
  const { assets, loading, deleteAsset, addAsset } = useAssets();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // UI State
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [sortType, setSortType] = useState<SortType>('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAssets, setSelectedAssets] = useState<Set<string>>(new Set());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // Upload State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  // Use in Tool Menu State
  const [showToolMenu, setShowToolMenu] = useState<string | null>(null);

  // Handle file upload
  const handleFileUpload = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);

    const totalFiles = files.length;
    let completed = 0;

    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
        continue;
      }

      try {
        setUploadProgress(Math.round((completed / totalFiles) * 100));

        // Upload to R2
        const url = await uploadToR2(file, 'library-uploads');

        // Add to asset library
        const type = file.type.startsWith('image/') ? 'image' : 'video';
        await addAsset(url, type, file.name);

        completed++;
        setUploadProgress(Math.round((completed / totalFiles) * 100));
      } catch (error) {
        console.error('Upload failed:', error);
      }
    }

    setIsUploading(false);
    setShowUploadModal(false);
    setUploadProgress(0);
  }, [addAsset]);

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFileUpload(e.dataTransfer.files);
  }, [handleFileUpload]);

  // Use asset in tool
  const handleUseInTool = (assetUrl: string, toolPath: string) => {
    // Store the asset URL in sessionStorage for the tool to pick up
    sessionStorage.setItem('selectedAssetUrl', assetUrl);
    navigate(toolPath);
  };

  // Filter and sort assets
  const filteredAssets = useMemo(() => {
    let result = [...assets];

    // Filter by type
    if (filterType !== 'all') {
      result = result.filter(asset => asset.type === filterType);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(asset =>
        asset.name?.toLowerCase().includes(query) ||
        asset.type.toLowerCase().includes(query)
      );
    }

    // Sort
    result.sort((a, b) => {
      switch (sortType) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'name':
          return (a.name || '').localeCompare(b.name || '');
        default:
          return 0;
      }
    });

    return result;
  }, [assets, filterType, sortType, searchQuery]);

  // Stats
  const stats = useMemo(() => {
    const images = assets.filter(a => a.type === 'image').length;
    const videos = assets.filter(a => a.type === 'video').length;
    return { total: assets.length, images, videos };
  }, [assets]);

  const toggleAssetSelection = (id: string) => {
    setSelectedAssets(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleBulkDelete = async () => {
    for (const id of selectedAssets) {
      await deleteAsset(id);
    }
    setSelectedAssets(new Set());
  };

  const handleDelete = async (id: string) => {
    await deleteAsset(id);
    setShowDeleteConfirm(null);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="flex h-screen bg-white dark:bg-[#09090b] text-zinc-900 dark:text-white font-sans overflow-hidden">
      <NavigationRail isMobileOpen={mobileMenuOpen} onMobileClose={() => setMobileMenuOpen(false)} />
<div className="flex-1 flex flex-col min-w-0 overflow-hidden ml-0 lg:ml-16">
        <DashboardTopbar onMenuClick={() => {}} />

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-6 py-8">
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*"
              className="hidden"
              onChange={(e) => handleFileUpload(e.target.files)}
            />

            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">My Library</h1>
                <p className="text-zinc-500 dark:text-zinc-400 mt-1">
                  {stats.total} items • {stats.images} images • {stats.videos} videos
                </p>
              </div>

              <div className="flex items-center gap-3">
                {selectedAssets.size > 0 && (
                  <div className="flex items-center gap-3 bg-indigo-50 dark:bg-indigo-950/30 px-4 py-2 rounded-xl">
                    <span className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">
                      {selectedAssets.size} selected
                    </span>
                    <button
                      onClick={handleBulkDelete}
                      className="px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      Delete Selected
                    </button>
                    <button
                      onClick={() => setSelectedAssets(new Set())}
                      className="p-1.5 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}

                <button
                  onClick={() => setShowUploadModal(true)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors"
                >
                  <Upload size={18} />
                  Upload
                </button>
              </div>
            </div>

            {/* Filters & Controls */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search assets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-100 dark:bg-zinc-800 border border-transparent focus:border-indigo-500 rounded-xl text-sm outline-none transition-colors"
                />
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 rounded-xl p-1">
                {(['all', 'image', 'video'] as FilterType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                      filterType === type
                        ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                    }`}
                  >
                    {type === 'all' ? 'All' : type === 'image' ? 'Images' : 'Videos'}
                  </button>
                ))}
              </div>

              {/* Sort */}
              <div className="flex items-center gap-2">
                <select
                  value={sortType}
                  onChange={(e) => setSortType(e.target.value as SortType)}
                  className="px-3 py-2.5 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-sm outline-none cursor-pointer"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="name">Name A-Z</option>
                </select>

                {/* View Toggle */}
                <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 rounded-xl p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-colors ${
                      viewMode === 'grid'
                        ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm'
                        : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                    }`}
                  >
                    <Grid3X3 size={18} />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-colors ${
                      viewMode === 'list'
                        ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm'
                        : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                    }`}
                  >
                    <LayoutList size={18} />
                  </button>
                </div>
              </div>
            </div>

            {/* Content */}
            {loading && assets.length === 0 ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            ) : filteredAssets.length === 0 ? (
              <div className="text-center py-20 bg-zinc-50 dark:bg-zinc-900/50 rounded-3xl border-2 border-dashed border-zinc-200 dark:border-zinc-800">
                <div className="bg-zinc-100 dark:bg-zinc-800 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FolderOpen size={36} className="text-zinc-400" />
                </div>
                <h3 className="text-xl font-semibold text-zinc-900 dark:text-white mb-2">
                  {searchQuery || filterType !== 'all' ? 'No matching assets' : 'Your library is empty'}
                </h3>
                <p className="text-zinc-500 dark:text-zinc-400 mb-6 max-w-md mx-auto">
                  {searchQuery || filterType !== 'all'
                    ? 'Try adjusting your filters or search query'
                    : 'Start creating! Generated images and videos will appear here.'}
                </p>
                {!searchQuery && filterType === 'all' && (
                  <button
                    onClick={() => navigate('/studio/apps')}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors"
                  >
                    <Plus size={18} />
                    Start Creating
                  </button>
                )}
              </div>
            ) : viewMode === 'grid' ? (
              /* Grid View */
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                <AnimatePresence>
                  {filteredAssets.map((asset) => (
                    <motion.div
                      key={asset.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="group relative bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden hover:border-indigo-500 dark:hover:border-indigo-500 transition-all duration-200 hover:shadow-lg"
                    >
                      {/* Selection Checkbox */}
                      <div
                        onClick={() => toggleAssetSelection(asset.id)}
                        className={`absolute top-3 left-3 z-10 w-6 h-6 rounded-lg border-2 flex items-center justify-center cursor-pointer transition-all ${
                          selectedAssets.has(asset.id)
                            ? 'bg-indigo-600 border-indigo-600'
                            : 'bg-white/80 dark:bg-zinc-800/80 border-zinc-300 dark:border-zinc-600 opacity-0 group-hover:opacity-100'
                        }`}
                      >
                        {selectedAssets.has(asset.id) && <Check size={14} className="text-white" />}
                      </div>

                      {/* Thumbnail */}
                      <div className="aspect-square bg-zinc-100 dark:bg-zinc-800 relative overflow-hidden">
                        {asset.type === 'image' ? (
                          <img src={asset.url} alt={asset.name} className="w-full h-full object-cover" />
                        ) : (
                          <>
                            <video
                              src={asset.url}
                              className="w-full h-full object-cover"
                              muted
                              onMouseEnter={e => e.currentTarget.play()}
                              onMouseLeave={e => { e.currentTarget.pause(); e.currentTarget.currentTime = 0; }}
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                              <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                                <Play size={20} className="text-zinc-900 ml-0.5" />
                              </div>
                            </div>
                          </>
                        )}

                        {/* Actions Overlay */}
                        <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          {asset.type === 'image' && (
                            <div className="relative">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowToolMenu(showToolMenu === asset.id ? null : asset.id);
                                }}
                                className="p-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white shadow-sm transition-colors"
                                title="Use in Tool"
                              >
                                <Wand2 size={14} />
                              </button>
                              {showToolMenu === asset.id && (
                                <>
                                  <div className="fixed inset-0 z-10" onClick={() => setShowToolMenu(null)} />
                                  <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-zinc-800 rounded-xl shadow-xl border border-zinc-200 dark:border-zinc-700 py-1 z-20">
                                    <div className="px-3 py-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase">
                                      Use in Tool
                                    </div>
                                    {TOOL_OPTIONS.map((tool) => (
                                      <button
                                        key={tool.id}
                                        onClick={() => {
                                          handleUseInTool(asset.url, tool.path);
                                          setShowToolMenu(null);
                                        }}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                                      >
                                        <span>{tool.icon}</span>
                                        {tool.name}
                                      </button>
                                    ))}
                                  </div>
                                </>
                              )}
                            </div>
                          )}
                          <a
                            href={asset.url}
                            download
                            className="p-2 bg-white/90 dark:bg-zinc-800/90 backdrop-blur rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 shadow-sm transition-colors"
                          >
                            <Download size={14} />
                          </a>
                          <a
                            href={asset.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-white/90 dark:bg-zinc-800/90 backdrop-blur rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 shadow-sm transition-colors"
                          >
                            <ExternalLink size={14} />
                          </a>
                          <button
                            onClick={() => setShowDeleteConfirm(asset.id)}
                            className="p-2 bg-white/90 dark:bg-zinc-800/90 backdrop-blur rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-red-500 shadow-sm transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>

                        {/* Type Badge */}
                        <div className="absolute bottom-3 left-3">
                          <span className={`px-2 py-1 text-[10px] font-semibold rounded-md ${
                            asset.type === 'image'
                              ? 'bg-blue-500/90 text-white'
                              : 'bg-purple-500/90 text-white'
                          }`}>
                            {asset.type === 'image' ? 'IMAGE' : 'VIDEO'}
                          </span>
                        </div>
                      </div>

                      {/* Info */}
                      <div className="p-3">
                        <p className="text-sm font-medium text-zinc-900 dark:text-white truncate">
                          {asset.name || (asset.type === 'image' ? 'Untitled Image' : 'Untitled Video')}
                        </p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 flex items-center gap-1">
                          <Clock size={12} />
                          {formatDate(asset.created_at)}
                        </p>
                      </div>

                      {/* Delete Confirmation */}
                      {showDeleteConfirm === asset.id && (
                        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-4 z-20">
                          <p className="text-white text-sm font-medium mb-4 text-center">Delete this asset?</p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleDelete(asset.id)}
                              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
                            >
                              Delete
                            </button>
                            <button
                              onClick={() => setShowDeleteConfirm(null)}
                              className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white text-sm font-medium rounded-lg transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              /* List View */
              <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-zinc-50 dark:bg-zinc-800/50">
                    <tr>
                      <th className="w-12 px-4 py-3">
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded border-zinc-300 dark:border-zinc-600"
                          checked={selectedAssets.size === filteredAssets.length && filteredAssets.length > 0}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedAssets(new Set(filteredAssets.map(a => a.id)));
                            } else {
                              setSelectedAssets(new Set());
                            }
                          }}
                        />
                      </th>
                      <th className="w-16"></th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase">Name</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase">Type</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase">Created</th>
                      <th className="w-32 px-4 py-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {filteredAssets.map((asset) => (
                      <tr key={asset.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            className="w-4 h-4 rounded border-zinc-300 dark:border-zinc-600"
                            checked={selectedAssets.has(asset.id)}
                            onChange={() => toggleAssetSelection(asset.id)}
                          />
                        </td>
                        <td className="px-2 py-2">
                          <div className="w-12 h-12 rounded-lg bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                            {asset.type === 'image' ? (
                              <img src={asset.url} alt={asset.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-purple-100 dark:bg-purple-900/30">
                                <Video size={20} className="text-purple-600 dark:text-purple-400" />
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm font-medium text-zinc-900 dark:text-white">
                            {asset.name || (asset.type === 'image' ? 'Untitled Image' : 'Untitled Video')}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${
                            asset.type === 'image'
                              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                              : 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
                          }`}>
                            {asset.type === 'image' ? <ImageIcon size={12} /> : <Video size={12} />}
                            {asset.type === 'image' ? 'Image' : 'Video'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-zinc-500 dark:text-zinc-400">
                          {formatDate(asset.created_at)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            {asset.type === 'image' && (
                              <div className="relative">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setShowToolMenu(showToolMenu === `list-${asset.id}` ? null : `list-${asset.id}`);
                                  }}
                                  className="p-2 text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
                                  title="Use in Tool"
                                >
                                  <Wand2 size={16} />
                                </button>
                                {showToolMenu === `list-${asset.id}` && (
                                  <>
                                    <div className="fixed inset-0 z-10" onClick={() => setShowToolMenu(null)} />
                                    <div className="absolute right-0 bottom-full mb-1 w-48 bg-white dark:bg-zinc-800 rounded-xl shadow-xl border border-zinc-200 dark:border-zinc-700 py-1 z-20">
                                      <div className="px-3 py-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase">
                                        Use in Tool
                                      </div>
                                      {TOOL_OPTIONS.map((tool) => (
                                        <button
                                          key={tool.id}
                                          onClick={() => {
                                            handleUseInTool(asset.url, tool.path);
                                            setShowToolMenu(null);
                                          }}
                                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                                        >
                                          <span>{tool.icon}</span>
                                          {tool.name}
                                        </button>
                                      ))}
                                    </div>
                                  </>
                                )}
                              </div>
                            )}
                            <a
                              href={asset.url}
                              download
                              className="p-2 text-zinc-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                            >
                              <Download size={16} />
                            </a>
                            <a
                              href={asset.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 text-zinc-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                            >
                              <ExternalLink size={16} />
                            </a>
                            <button
                              onClick={() => handleDelete(asset.id)}
                              className="p-2 text-zinc-500 hover:text-red-500 transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isUploading && setShowUploadModal(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl z-50 overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                  Upload to Library
                </h2>
                {!isUploading && (
                  <button
                    onClick={() => setShowUploadModal(false)}
                    className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>

              {/* Content */}
              <div className="p-6">
                {isUploading ? (
                  /* Upload Progress */
                  <div className="text-center py-8">
                    <div className="relative w-20 h-20 mx-auto mb-4">
                      <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 80 80">
                        <circle
                          cx="40"
                          cy="40"
                          r="36"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="6"
                          className="text-zinc-200 dark:text-zinc-700"
                        />
                        <circle
                          cx="40"
                          cy="40"
                          r="36"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="6"
                          strokeLinecap="round"
                          strokeDasharray={`${uploadProgress * 2.26} 226`}
                          className="text-indigo-600 transition-all duration-300"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-lg font-bold text-zinc-900 dark:text-white">
                          {uploadProgress}%
                        </span>
                      </div>
                    </div>
                    <p className="text-zinc-600 dark:text-zinc-400">
                      Uploading files...
                    </p>
                  </div>
                ) : (
                  /* Drop Zone */
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
                      isDragging
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30'
                        : 'border-zinc-300 dark:border-zinc-700 hover:border-indigo-400 dark:hover:border-indigo-600'
                    }`}
                  >
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center transition-colors ${
                      isDragging
                        ? 'bg-indigo-100 dark:bg-indigo-900/50'
                        : 'bg-zinc-100 dark:bg-zinc-800'
                    }`}>
                      <UploadCloud
                        size={32}
                        className={`transition-colors ${
                          isDragging
                            ? 'text-indigo-600 dark:text-indigo-400'
                            : 'text-zinc-400'
                        }`}
                      />
                    </div>

                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">
                      {isDragging ? 'Drop files here' : 'Drag & drop files'}
                    </h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
                      or click to browse from your computer
                    </p>
                    <p className="text-xs text-zinc-400 dark:text-zinc-500">
                      Supports: JPG, PNG, GIF, WebP, MP4, WebM
                    </p>

                    {/* Clickable overlay */}
                    <input
                      type="file"
                      multiple
                      accept="image/*,video/*"
                      onChange={(e) => handleFileUpload(e.target.files)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                )}
              </div>

              {/* Footer */}
              {!isUploading && (
                <div className="px-6 py-4 bg-zinc-50 dark:bg-zinc-800/50 border-t border-zinc-200 dark:border-zinc-800">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors"
                    >
                      <Upload size={18} />
                      Choose Files
                    </button>
                    <button
                      onClick={() => setShowUploadModal(false)}
                      className="px-4 py-2.5 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 font-medium rounded-xl transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export const MyLibraryPage: React.FC = () => {
  return (
    <AssetProvider>
      <MyLibraryContent />
    </AssetProvider>
  );
};
