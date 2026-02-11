import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PropertyProvider, useProperties, Property } from '../../lib/store/contexts/PropertyContext';
import { NavigationRail } from '../dashboard/navigation/NavigationRail';
import { DashboardTopbar } from '../dashboard/navigation/DashboardTopbar';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  Filter,
  Home,
  Building2,
  MapPin,
  Bed,
  Bath,
  Square,
  DollarSign,
  MoreVertical,
  Edit,
  Trash2,
  Image as ImageIcon,
  Eye,
  Archive,
  CheckCircle,
  Clock,
  Tag,
  X,
  Upload,
  Star,
  GripVertical,
} from 'lucide-react';
import { uploadToR2 } from '@/lib/api/r2';

type StatusFilter = 'all' | 'draft' | 'active' | 'pending' | 'sold' | 'archived';

const statusColors: Record<string, string> = {
  draft: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400',
  active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  sold: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  archived: 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-500',
};

const propertyTypeIcons: Record<string, any> = {
  house: Home,
  condo: Building2,
  apartment: Building2,
  townhouse: Home,
  land: Square,
  commercial: Building2,
};

interface AddPropertyModalProps {
  onClose: () => void;
  onAdd: (property: Omit<Property, 'id' | 'assets' | 'createdAt' | 'updatedAt'>) => void;
}

const AddPropertyModal: React.FC<AddPropertyModalProps> = ({ onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    propertyType: 'house' as Property['propertyType'],
    status: 'draft' as Property['status'],
    price: '',
    bedrooms: '',
    bathrooms: '',
    squareFeet: '',
    mlsNumber: '',
    description: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      name: formData.name || `${formData.address || 'New Property'}`,
      address: formData.address,
      city: formData.city,
      state: formData.state,
      zipCode: formData.zipCode,
      propertyType: formData.propertyType,
      status: formData.status,
      price: formData.price ? parseInt(formData.price) : undefined,
      bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : undefined,
      bathrooms: formData.bathrooms ? parseFloat(formData.bathrooms) : undefined,
      squareFeet: formData.squareFeet ? parseInt(formData.squareFeet) : undefined,
      mlsNumber: formData.mlsNumber || undefined,
      description: formData.description || undefined,
      features: [],
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-zinc-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between p-6 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Add New Property</h2>
          <button onClick={onClose} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg">
            <X size={20} className="text-zinc-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Property Name */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Property Name / Title
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Modern Downtown Condo"
              className="w-full px-4 py-3 bg-zinc-100 dark:bg-zinc-800 rounded-xl outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Address */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Street Address
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="123 Main Street"
                className="w-full px-4 py-3 bg-zinc-100 dark:bg-zinc-800 rounded-xl outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">City</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="San Francisco"
                className="w-full px-4 py-3 bg-zinc-100 dark:bg-zinc-800 rounded-xl outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">State</label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  placeholder="CA"
                  className="w-full px-4 py-3 bg-zinc-100 dark:bg-zinc-800 rounded-xl outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">ZIP</label>
                <input
                  type="text"
                  value={formData.zipCode}
                  onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                  placeholder="94102"
                  className="w-full px-4 py-3 bg-zinc-100 dark:bg-zinc-800 rounded-xl outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>
          </div>

          {/* Property Details */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Type</label>
              <select
                value={formData.propertyType}
                onChange={(e) => setFormData({ ...formData, propertyType: e.target.value as Property['propertyType'] })}
                className="w-full px-4 py-3 bg-zinc-100 dark:bg-zinc-800 rounded-xl outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="house">House</option>
                <option value="condo">Condo</option>
                <option value="apartment">Apartment</option>
                <option value="townhouse">Townhouse</option>
                <option value="land">Land</option>
                <option value="commercial">Commercial</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as Property['status'] })}
                className="w-full px-4 py-3 bg-zinc-100 dark:bg-zinc-800 rounded-xl outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="sold">Sold</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Beds</label>
              <input
                type="number"
                value={formData.bedrooms}
                onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                placeholder="3"
                className="w-full px-4 py-3 bg-zinc-100 dark:bg-zinc-800 rounded-xl outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Baths</label>
              <input
                type="number"
                step="0.5"
                value={formData.bathrooms}
                onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                placeholder="2"
                className="w-full px-4 py-3 bg-zinc-100 dark:bg-zinc-800 rounded-xl outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Price ($)</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="500000"
                className="w-full px-4 py-3 bg-zinc-100 dark:bg-zinc-800 rounded-xl outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Sq Ft</label>
              <input
                type="number"
                value={formData.squareFeet}
                onChange={(e) => setFormData({ ...formData, squareFeet: e.target.value })}
                placeholder="1500"
                className="w-full px-4 py-3 bg-zinc-100 dark:bg-zinc-800 rounded-xl outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          {/* MLS */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              MLS Number (Optional)
            </label>
            <input
              type="text"
              value={formData.mlsNumber}
              onChange={(e) => setFormData({ ...formData, mlsNumber: e.target.value })}
              placeholder="MLS123456"
              className="w-full px-4 py-3 bg-zinc-100 dark:bg-zinc-800 rounded-xl outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the property..."
              rows={3}
              className="w-full px-4 py-3 bg-zinc-100 dark:bg-zinc-800 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-sm font-medium bg-teal-600 hover:bg-teal-700 text-white rounded-xl transition-colors"
            >
              Add Property
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// Edit Property Modal
interface EditPropertyModalProps {
  property: Property;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<Property>) => Promise<void>;
  onAddAsset: (propertyId: string, asset: any) => Promise<void>;
  onRemoveAsset: (propertyId: string, assetId: string) => Promise<void>;
}

const EditPropertyModal: React.FC<EditPropertyModalProps> = ({
  property,
  onClose,
  onUpdate,
  onAddAsset,
  onRemoveAsset,
}) => {
  const [formData, setFormData] = useState({
    name: property.name || '',
    address: property.address || '',
    city: property.city || '',
    state: property.state || '',
    zipCode: property.zipCode || '',
    propertyType: property.propertyType || 'house',
    status: property.status || 'draft',
    price: property.price?.toString() || '',
    bedrooms: property.bedrooms?.toString() || '',
    bathrooms: property.bathrooms?.toString() || '',
    squareFeet: property.squareFeet?.toString() || '',
    mlsNumber: property.mlsNumber || '',
    description: property.description || '',
  });
  const [assets, setAssets] = useState(property.assets || []);
  const [thumbnailUrl, setThumbnailUrl] = useState(property.thumbnailUrl || '');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [activeTab, setActiveTab] = useState<'details' | 'photos'>('details');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onUpdate(property.id, {
      name: formData.name || `${formData.address || 'Property'}`,
      address: formData.address,
      city: formData.city,
      state: formData.state,
      zipCode: formData.zipCode,
      propertyType: formData.propertyType as Property['propertyType'],
      status: formData.status as Property['status'],
      price: formData.price ? parseInt(formData.price) : undefined,
      bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : undefined,
      bathrooms: formData.bathrooms ? parseFloat(formData.bathrooms) : undefined,
      squareFeet: formData.squareFeet ? parseInt(formData.squareFeet) : undefined,
      mlsNumber: formData.mlsNumber || undefined,
      description: formData.description || undefined,
      thumbnailUrl,
      assets,
    });
    onClose();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith('image/')) continue;

        setUploadProgress(Math.round(((i + 0.5) / files.length) * 100));

        // Upload to R2
        let url: string;
        try {
          url = await uploadToR2(file, `properties/${property.id}`);
        } catch {
          // Fallback to local blob URL if R2 fails
          url = URL.createObjectURL(file);
        }

        const newAsset = {
          id: `asset_${Date.now()}_${i}`,
          assetId: `asset_${Date.now()}_${i}`,
          url,
          type: 'image' as const,
          category: 'interior' as const,
          isPrimary: assets.length === 0 && i === 0,
          order: assets.length + i,
          createdAt: new Date().toISOString(),
        };

        setAssets(prev => [...prev, newAsset]);

        // Set first image as thumbnail if none exists
        if (!thumbnailUrl && i === 0) {
          setThumbnailUrl(url);
        }

        setUploadProgress(Math.round(((i + 1) / files.length) * 100));
      }
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleRemoveAsset = (assetId: string) => {
    const assetToRemove = assets.find(a => a.id === assetId);
    setAssets(prev => prev.filter(a => a.id !== assetId));

    // Update thumbnail if removed asset was the thumbnail
    if (assetToRemove && assetToRemove.url === thumbnailUrl) {
      const remaining = assets.filter(a => a.id !== assetId);
      setThumbnailUrl(remaining.length > 0 ? remaining[0].url : '');
    }
  };

  const handleSetAsThumbnail = (url: string) => {
    setThumbnailUrl(url);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-zinc-900 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col"
      >
        <div className="flex items-center justify-between p-6 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Edit Property</h2>
          <button onClick={onClose} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg">
            <X size={20} className="text-zinc-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-zinc-200 dark:border-zinc-800">
          <button
            onClick={() => setActiveTab('details')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === 'details'
                ? 'text-teal-600 border-b-2 border-teal-600'
                : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
          >
            Property Details
          </button>
          <button
            onClick={() => setActiveTab('photos')}
            className={`flex-1 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'photos'
                ? 'text-teal-600 border-b-2 border-teal-600'
                : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
          >
            Photos
            <span className="px-2 py-0.5 text-xs bg-zinc-200 dark:bg-zinc-700 rounded-full">
              {assets.length}
            </span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {activeTab === 'details' ? (
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Property Name */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Property Name / Title
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Modern Downtown Condo"
                  className="w-full px-4 py-3 bg-zinc-100 dark:bg-zinc-800 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 text-zinc-900 dark:text-white"
                />
              </div>

              {/* Address */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Street Address
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="123 Main Street"
                    className="w-full px-4 py-3 bg-zinc-100 dark:bg-zinc-800 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 text-zinc-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="San Francisco"
                    className="w-full px-4 py-3 bg-zinc-100 dark:bg-zinc-800 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 text-zinc-900 dark:text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">State</label>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      placeholder="CA"
                      className="w-full px-4 py-3 bg-zinc-100 dark:bg-zinc-800 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 text-zinc-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">ZIP</label>
                    <input
                      type="text"
                      value={formData.zipCode}
                      onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                      placeholder="94102"
                      className="w-full px-4 py-3 bg-zinc-100 dark:bg-zinc-800 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 text-zinc-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Property Details */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Type</label>
                  <select
                    value={formData.propertyType}
                    onChange={(e) => setFormData({ ...formData, propertyType: e.target.value as Property['propertyType'] })}
                    className="w-full px-4 py-3 bg-zinc-100 dark:bg-zinc-800 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 text-zinc-900 dark:text-white"
                  >
                    <option value="house">House</option>
                    <option value="condo">Condo</option>
                    <option value="apartment">Apartment</option>
                    <option value="townhouse">Townhouse</option>
                    <option value="land">Land</option>
                    <option value="commercial">Commercial</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as Property['status'] })}
                    className="w-full px-4 py-3 bg-zinc-100 dark:bg-zinc-800 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 text-zinc-900 dark:text-white"
                  >
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="sold">Sold</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Beds</label>
                  <input
                    type="number"
                    value={formData.bedrooms}
                    onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                    placeholder="3"
                    className="w-full px-4 py-3 bg-zinc-100 dark:bg-zinc-800 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 text-zinc-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Baths</label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.bathrooms}
                    onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                    placeholder="2"
                    className="w-full px-4 py-3 bg-zinc-100 dark:bg-zinc-800 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 text-zinc-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Price ($)</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="500000"
                    className="w-full px-4 py-3 bg-zinc-100 dark:bg-zinc-800 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 text-zinc-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Sq Ft</label>
                  <input
                    type="number"
                    value={formData.squareFeet}
                    onChange={(e) => setFormData({ ...formData, squareFeet: e.target.value })}
                    placeholder="1500"
                    className="w-full px-4 py-3 bg-zinc-100 dark:bg-zinc-800 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 text-zinc-900 dark:text-white"
                  />
                </div>
              </div>

              {/* MLS */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  MLS Number (Optional)
                </label>
                <input
                  type="text"
                  value={formData.mlsNumber}
                  onChange={(e) => setFormData({ ...formData, mlsNumber: e.target.value })}
                  placeholder="MLS123456"
                  className="w-full px-4 py-3 bg-zinc-100 dark:bg-zinc-800 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 text-zinc-900 dark:text-white"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the property..."
                  rows={3}
                  className="w-full px-4 py-3 bg-zinc-100 dark:bg-zinc-800 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 resize-none text-zinc-900 dark:text-white"
                />
              </div>
            </form>
          ) : (
            <div className="p-6 space-y-6">
              {/* Upload Area */}
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  disabled={isUploading}
                />
                <div className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors ${
                  isUploading ? 'border-teal-500 bg-teal-500/10' : 'border-zinc-300 dark:border-zinc-700 hover:border-teal-500'
                }`}>
                  {isUploading ? (
                    <div className="space-y-3">
                      <div className="w-12 h-12 rounded-full border-4 border-teal-500 border-t-transparent animate-spin mx-auto" />
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">Uploading... {uploadProgress}%</p>
                    </div>
                  ) : (
                    <>
                      <Upload size={40} className="mx-auto mb-3 text-zinc-400" />
                      <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Drop photos here or click to upload
                      </p>
                      <p className="text-xs text-zinc-500 mt-1">Supports JPG, PNG, WebP</p>
                    </>
                  )}
                </div>
              </div>

              {/* Photo Grid */}
              {assets.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
                    Photos ({assets.length})
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {assets.map((asset) => (
                      <div
                        key={asset.id}
                        className={`relative aspect-[4/3] rounded-xl overflow-hidden group border-2 transition-colors ${
                          asset.url === thumbnailUrl
                            ? 'border-teal-500'
                            : 'border-transparent hover:border-zinc-300 dark:hover:border-zinc-600'
                        }`}
                      >
                        <img
                          src={asset.url}
                          alt=""
                          className="w-full h-full object-cover"
                        />

                        {/* Thumbnail badge */}
                        {asset.url === thumbnailUrl && (
                          <div className="absolute top-2 left-2 px-2 py-1 bg-teal-600 text-white text-xs font-medium rounded-lg flex items-center gap-1">
                            <Star size={10} className="fill-current" />
                            Cover
                          </div>
                        )}

                        {/* Action overlay */}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          {asset.url !== thumbnailUrl && (
                            <button
                              onClick={() => handleSetAsThumbnail(asset.url)}
                              className="p-2 bg-white/90 hover:bg-white rounded-lg text-zinc-700 transition-colors"
                              title="Set as cover"
                            >
                              <Star size={16} />
                            </button>
                          )}
                          <button
                            onClick={() => handleRemoveAsset(asset.id)}
                            className="p-2 bg-red-500/90 hover:bg-red-500 rounded-lg text-white transition-colors"
                            title="Remove"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {assets.length === 0 && (
                <div className="text-center py-8 text-zinc-500">
                  <ImageIcon size={40} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No photos uploaded yet</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 p-6 border-t border-zinc-200 dark:border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2.5 text-sm font-medium bg-teal-600 hover:bg-teal-700 text-white rounded-xl transition-colors"
          >
            Save Changes
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const PropertiesContent: React.FC = () => {
  const navigate = useNavigate();
  const { properties, loading, addProperty, updateProperty, deleteProperty, addAssetToProperty, removeAssetFromProperty } = useProperties();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editProperty, setEditProperty] = useState<Property | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  const filteredProperties = properties.filter((p) => {
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        p.name.toLowerCase().includes(query) ||
        p.address.toLowerCase().includes(query) ||
        p.city.toLowerCase().includes(query) ||
        p.mlsNumber?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const handleAddProperty = async (property: Omit<Property, 'id' | 'assets' | 'createdAt' | 'updatedAt'>) => {
    await addProperty(property);
  };

  const formatPrice = (price?: number) => {
    if (!price) return 'Price TBD';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(price);
  };

  return (
    <div className="flex h-screen bg-white dark:bg-[#09090b] text-zinc-900 dark:text-white font-[Space_Grotesk] overflow-hidden">
      <NavigationRail isMobileOpen={mobileMenuOpen} onMobileClose={() => setMobileMenuOpen(false)} />
<div className="flex-1 flex flex-col min-w-0 overflow-hidden ml-0 lg:ml-16">
        <DashboardTopbar onMenuClick={() => {}} />

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-6 py-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">My Properties</h1>
                <p className="text-zinc-500 dark:text-zinc-400 mt-1">
                  {properties.length} {properties.length === 1 ? 'listing' : 'listings'}
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-xl transition-colors"
              >
                <Plus size={18} />
                Add Property
              </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search properties..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {/* Status Filter */}
              <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 rounded-xl p-1">
                {(['all', 'active', 'draft', 'pending', 'sold'] as StatusFilter[]).map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all capitalize ${
                      statusFilter === status
                        ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {/* Properties Grid */}
            {loading && properties.length === 0 ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
              </div>
            ) : filteredProperties.length === 0 ? (
              <div className="text-center py-20 bg-zinc-50 dark:bg-zinc-900/50 rounded-3xl border-2 border-dashed border-zinc-200 dark:border-zinc-800">
                <div className="bg-zinc-100 dark:bg-zinc-800 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Home size={36} className="text-zinc-400" />
                </div>
                <h3 className="text-xl font-semibold text-zinc-900 dark:text-white mb-2">
                  {searchQuery || statusFilter !== 'all' ? 'No matching properties' : 'No properties yet'}
                </h3>
                <p className="text-zinc-500 dark:text-zinc-400 mb-6 max-w-md mx-auto">
                  {searchQuery || statusFilter !== 'all'
                    ? 'Try adjusting your filters or search query'
                    : 'Add your first property to start organizing your real estate assets.'}
                </p>
                {!searchQuery && statusFilter === 'all' && (
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-xl transition-colors"
                  >
                    <Plus size={18} />
                    Add Your First Property
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                  {filteredProperties.map((property, index) => {
                    const TypeIcon = propertyTypeIcons[property.propertyType] || Home;
                    return (
                      <motion.div
                        key={property.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => setEditProperty(property)}
                        className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden hover:border-teal-500 dark:hover:border-teal-500 transition-all duration-200 hover:shadow-lg group cursor-pointer"
                      >
                        {/* Thumbnail */}
                        <div className="aspect-[4/3] bg-zinc-100 dark:bg-zinc-800 relative overflow-hidden">
                          {property.thumbnailUrl ? (
                            <img
                              src={property.thumbnailUrl}
                              alt={property.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImageIcon size={48} className="text-zinc-300 dark:text-zinc-600" />
                            </div>
                          )}

                          {/* Status Badge */}
                          <div className="absolute top-3 left-3">
                            <span className={`px-2.5 py-1 text-xs font-semibold rounded-lg capitalize ${statusColors[property.status]}`}>
                              {property.status}
                            </span>
                          </div>

                          {/* Asset Count */}
                          <div className="absolute bottom-3 left-3">
                            <span className="px-2.5 py-1 text-xs font-medium bg-black/60 text-white rounded-lg flex items-center gap-1">
                              <ImageIcon size={12} />
                              {property.assets.length}
                            </span>
                          </div>

                          {/* Menu */}
                          <div className="absolute top-3 right-3">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setMenuOpen(menuOpen === property.id ? null : property.id);
                              }}
                              className="p-2 bg-white/90 dark:bg-zinc-800/90 rounded-lg hover:bg-white dark:hover:bg-zinc-700 transition-colors"
                            >
                              <MoreVertical size={16} className="text-zinc-600 dark:text-zinc-400" />
                            </button>

                            {menuOpen === property.id && (
                              <>
                                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(null)} />
                                <div className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-zinc-800 rounded-xl shadow-xl border border-zinc-200 dark:border-zinc-700 py-1 z-20">
                                  <button
                                    onClick={() => {
                                      setMenuOpen(null);
                                      setEditProperty(property);
                                    }}
                                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                                  >
                                    <Edit size={14} />
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => {
                                      setMenuOpen(null);
                                      setEditProperty(property);
                                    }}
                                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                                  >
                                    <ImageIcon size={14} />
                                    Add Photos
                                  </button>
                                  <button
                                    onClick={() => {
                                      setMenuOpen(null);
                                      deleteProperty(property.id);
                                    }}
                                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                  >
                                    <Trash2 size={14} />
                                    Delete
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Info */}
                        <div className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white truncate pr-2">
                              {property.name}
                            </h3>
                            <span className="text-lg font-bold text-teal-600 dark:text-teal-400 whitespace-nowrap">
                              {formatPrice(property.price)}
                            </span>
                          </div>

                          <p className="text-sm text-zinc-500 dark:text-zinc-400 flex items-center gap-1 mb-3">
                            <MapPin size={14} />
                            {property.address ? `${property.address}, ${property.city}` : 'No address'}
                          </p>

                          <div className="flex items-center gap-4 text-sm text-zinc-600 dark:text-zinc-400">
                            {property.bedrooms && (
                              <span className="flex items-center gap-1">
                                <Bed size={14} />
                                {property.bedrooms} bed
                              </span>
                            )}
                            {property.bathrooms && (
                              <span className="flex items-center gap-1">
                                <Bath size={14} />
                                {property.bathrooms} bath
                              </span>
                            )}
                            {property.squareFeet && (
                              <span className="flex items-center gap-1">
                                <Square size={14} />
                                {property.squareFeet.toLocaleString()} sqft
                              </span>
                            )}
                          </div>

                          {property.mlsNumber && (
                            <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-2 flex items-center gap-1">
                              <Tag size={12} />
                              MLS# {property.mlsNumber}
                            </p>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Add Property Modal */}
      {showAddModal && (
        <AddPropertyModal onClose={() => setShowAddModal(false)} onAdd={handleAddProperty} />
      )}

      {/* Edit Property Modal */}
      {editProperty && (
        <EditPropertyModal
          property={editProperty}
          onClose={() => setEditProperty(null)}
          onUpdate={updateProperty}
          onAddAsset={addAssetToProperty}
          onRemoveAsset={removeAssetFromProperty}
        />
      )}
    </div>
  );
};

export const PropertiesPage: React.FC = () => {
  return (
    <PropertyProvider>
      <PropertiesContent />
    </PropertyProvider>
  );
};
