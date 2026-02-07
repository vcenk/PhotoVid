import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Building2,
  MapPin,
  BedDouble,
  Bath,
  Square,
  Sparkles,
  ChevronDown,
  Plus,
  X,
  Wand2,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { PropertyData } from '@/lib/types/storyboard';
import { PROPERTY_TYPE_CONFIGS, PROPERTY_STYLES } from '@/lib/data/promptTemplates';

interface PropertyInputFormProps {
  onSubmit: (data: PropertyData) => void;
  onAutoGenerate: (data: PropertyData) => void;
  initialData?: Partial<PropertyData>;
  isGenerating?: boolean;
}

const FEATURE_OPTIONS = [
  'Pool', 'Spa/Hot Tub', 'Home Gym', 'Home Theater', 'Wine Cellar',
  'Home Office', 'Finished Basement', 'Fireplace', 'Hardwood Floors',
  'Granite Counters', 'Stainless Appliances', 'Open Concept', 'Vaulted Ceilings',
  'Skylights', 'Balcony', 'Deck', 'Patio', 'Mountain View', 'Ocean View',
  'Waterfront', 'Golf Course', 'Gated Community', 'Smart Home', 'Solar Panels',
  'EV Charger', 'Guest House', 'Workshop', 'RV Parking', '3-Car Garage',
];

export const PropertyInputForm: React.FC<PropertyInputFormProps> = ({
  onSubmit,
  onAutoGenerate,
  initialData,
  isGenerating = false,
}) => {
  const [formData, setFormData] = useState<Partial<PropertyData>>({
    address: initialData?.address || '',
    propertyType: initialData?.propertyType || 'house',
    bedrooms: initialData?.bedrooms || 3,
    bathrooms: initialData?.bathrooms || 2,
    squareFeet: initialData?.squareFeet || 2000,
    style: initialData?.style || 'modern',
    features: initialData?.features || [],
    description: initialData?.description || '',
    price: initialData?.price,
    mlsNumber: initialData?.mlsNumber,
  });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [customFeature, setCustomFeature] = useState('');

  const handleChange = (field: keyof PropertyData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleFeature = (feature: string) => {
    const current = formData.features || [];
    if (current.includes(feature)) {
      handleChange('features', current.filter(f => f !== feature));
    } else {
      handleChange('features', [...current, feature]);
    }
  };

  const addCustomFeature = () => {
    if (customFeature.trim() && !formData.features?.includes(customFeature.trim())) {
      handleChange('features', [...(formData.features || []), customFeature.trim()]);
      setCustomFeature('');
    }
  };

  const handleSubmit = () => {
    onSubmit(formData as PropertyData);
  };

  const handleAutoGenerate = () => {
    onAutoGenerate(formData as PropertyData);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="space-y-6">
        {/* Basic Info Section */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Building2 size={16} className="text-emerald-400" />
            Property Information
          </h3>

          <div className="space-y-4">
            {/* Address */}
            <div>
              <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-2 block">
                Property Address
              </label>
              <div className="relative">
                <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  placeholder="123 Main Street, City, State 12345"
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Property Type and Style Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-2 block">
                  Property Type
                </label>
                <select
                  value={formData.propertyType}
                  onChange={(e) => handleChange('propertyType', e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {PROPERTY_TYPE_CONFIGS.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-2 block">
                  Style
                </label>
                <select
                  value={formData.style}
                  onChange={(e) => handleChange('style', e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {Object.entries(PROPERTY_STYLES).map(([id, label]) => (
                    <option key={id} value={id}>
                      {label.charAt(0).toUpperCase() + label.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Beds, Baths, SqFt Row */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-2 block flex items-center gap-1">
                  <BedDouble size={12} />
                  Bedrooms
                </label>
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={formData.bedrooms}
                  onChange={(e) => handleChange('bedrooms', parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-2 block flex items-center gap-1">
                  <Bath size={12} />
                  Bathrooms
                </label>
                <input
                  type="number"
                  min="0"
                  max="20"
                  step="0.5"
                  value={formData.bathrooms}
                  onChange={(e) => handleChange('bathrooms', parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-2 block flex items-center gap-1">
                  <Square size={12} />
                  Sq. Feet
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.squareFeet}
                  onChange={(e) => handleChange('squareFeet', parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Sparkles size={16} className="text-emerald-400" />
            Property Features
          </h3>

          <div className="flex flex-wrap gap-2 mb-4">
            {FEATURE_OPTIONS.slice(0, showAdvanced ? undefined : 15).map((feature) => (
              <button
                key={feature}
                onClick={() => toggleFeature(feature)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  formData.features?.includes(feature)
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white/5 text-zinc-400 hover:bg-white/10'
                }`}
              >
                {feature}
              </button>
            ))}
          </div>

          {!showAdvanced && (
            <button
              onClick={() => setShowAdvanced(true)}
              className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
            >
              Show more features
              <ChevronDown size={12} />
            </button>
          )}

          {/* Custom feature input */}
          <div className="mt-4 flex gap-2">
            <input
              type="text"
              value={customFeature}
              onChange={(e) => setCustomFeature(e.target.value)}
              placeholder="Add custom feature..."
              className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              onKeyPress={(e) => e.key === 'Enter' && addCustomFeature()}
            />
            <button
              onClick={addCustomFeature}
              disabled={!customFeature.trim()}
              className="px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
            >
              <Plus size={16} className="text-zinc-400" />
            </button>
          </div>

          {/* Selected features */}
          {formData.features && formData.features.length > 0 && (
            <div className="mt-4 pt-4 border-t border-white/5">
              <span className="text-xs text-zinc-500 mb-2 block">Selected ({formData.features.length}):</span>
              <div className="flex flex-wrap gap-2">
                {formData.features.map((feature) => (
                  <span
                    key={feature}
                    className="px-2 py-1 bg-emerald-600/20 text-emerald-300 rounded-md text-xs flex items-center gap-1"
                  >
                    {feature}
                    <button
                      onClick={() => toggleFeature(feature)}
                      className="hover:text-white"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Description Section */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-white mb-4">
            Property Description (Optional)
          </h3>
          <textarea
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Paste your MLS description or add custom details about the property. The AI will use this to create better scene prompts..."
            rows={4}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
          />
        </div>

        {/* Optional Fields */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full flex items-center justify-between text-sm font-medium text-zinc-400 hover:text-white"
          >
            Additional Details (Optional)
            <ChevronDown size={16} className={`transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
          </button>

          {showAdvanced && (
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-2 block">
                  Listing Price
                </label>
                <input
                  type="number"
                  value={formData.price || ''}
                  onChange={(e) => handleChange('price', parseInt(e.target.value) || undefined)}
                  placeholder="$0"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-2 block">
                  MLS Number
                </label>
                <input
                  type="text"
                  value={formData.mlsNumber || ''}
                  onChange={(e) => handleChange('mlsNumber', e.target.value || undefined)}
                  placeholder="MLS#12345678"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-2 block">
                  Year Built
                </label>
                <input
                  type="number"
                  value={formData.yearBuilt || ''}
                  onChange={(e) => handleChange('yearBuilt', parseInt(e.target.value) || undefined)}
                  placeholder="2020"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-2 block">
                  Lot Size (acres)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.lotSize || ''}
                  onChange={(e) => handleChange('lotSize', parseFloat(e.target.value) || undefined)}
                  placeholder="0.25"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAutoGenerate}
            disabled={isGenerating}
            className="flex-1 py-4 rounded-xl font-semibold text-sm bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Generating Scenes...
              </>
            ) : (
              <>
                <Wand2 size={18} />
                Auto-Generate Storyboard
              </>
            )}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSubmit}
            className="px-6 py-4 rounded-xl font-semibold text-sm bg-white/5 hover:bg-white/10 text-white transition-all flex items-center gap-2"
          >
            Manual Setup
            <ArrowRight size={18} />
          </motion.button>
        </div>

        {/* Info Text */}
        <p className="text-xs text-zinc-500 text-center">
          Auto-generate will create a storyboard with recommended scenes based on your property details.
          You can then customize scenes, upload photos, and generate videos.
        </p>
      </div>
    </div>
  );
};
