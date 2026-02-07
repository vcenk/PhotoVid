/**
 * PropertyDetailsStep - Step 2: Enter property information
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, DollarSign, Bed, Bath, Square, Plus, X, Calendar, Sparkles } from 'lucide-react';
import { useQuickVideo } from '../QuickVideoContext';

// Common property features
const SUGGESTED_FEATURES = [
  'Pool', 'Hot Tub', 'Garage', 'Fireplace', 'Smart Home',
  'Updated Kitchen', 'Hardwood Floors', 'Ocean View', 'Mountain View',
  'Garden', 'Patio', 'Balcony', 'Walk-in Closet', 'Home Office',
];

export function PropertyDetailsStep() {
  const { propertyData, updatePropertyData, addFeature, removeFeature } = useQuickVideo();
  const [customFeature, setCustomFeature] = useState('');
  const [activeField, setActiveField] = useState<string | null>(null);

  const handleAddCustomFeature = () => {
    if (customFeature.trim() && !propertyData.features.includes(customFeature.trim())) {
      addFeature(customFeature.trim());
      setCustomFeature('');
    }
  };

  const formatPrice = (value: string) => {
    const num = value.replace(/\D/g, '');
    if (!num) return '';
    return new Intl.NumberFormat('en-US').format(parseInt(num));
  };

  const inputClasses = (name: string) => `
    w-full px-4 py-3.5 bg-white/5 border rounded-xl text-white placeholder-zinc-500 transition-all duration-300
    ${activeField === name 
      ? 'border-emerald-500/50 ring-4 ring-emerald-500/10 bg-white/10' 
      : 'border-white/5 hover:border-white/10 hover:bg-white/10'
    }
    focus:outline-none
  `;

  return (
    <div className="max-w-3xl mx-auto space-y-10">
      <div>
        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70 mb-2">Property Details</h2>
        <p className="text-zinc-400">
          Enter the property information that will appear in your video
        </p>
      </div>

      {/* Address - Required */}
      <div className="space-y-4">
        <label className="flex items-center gap-2 text-sm font-medium text-zinc-300">
          <MapPin size={16} className="text-emerald-400" />
          Property Address <span className="text-red-400">*</span>
        </label>
        <div className="space-y-4">
            <div className="relative group">
                <input
                type="text"
                name="address"
                value={propertyData.address}
                onFocus={() => setActiveField('address')}
                onBlur={() => setActiveField(null)}
                onChange={(e) => updatePropertyData({ address: e.target.value })}
                placeholder="123 Main Street"
                className={inputClasses('address')}
                />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <input
                    type="text"
                    name="city"
                    value={propertyData.city || ''}
                    onFocus={() => setActiveField('city')}
                    onBlur={() => setActiveField(null)}
                    onChange={(e) => updatePropertyData({ city: e.target.value })}
                    placeholder="City"
                    className={inputClasses('city')}
                />
                <input
                    type="text"
                    name="state"
                    value={propertyData.state || ''}
                    onFocus={() => setActiveField('state')}
                    onBlur={() => setActiveField(null)}
                    onChange={(e) => updatePropertyData({ state: e.target.value })}
                    placeholder="State"
                    className={inputClasses('state')}
                />
                <input
                    type="text"
                    name="zipCode"
                    value={propertyData.zipCode || ''}
                    onFocus={() => setActiveField('zipCode')}
                    onBlur={() => setActiveField(null)}
                    onChange={(e) => updatePropertyData({ zipCode: e.target.value })}
                    placeholder="ZIP Code"
                    className={inputClasses('zipCode')}
                />
            </div>
        </div>
      </div>

      {/* Price */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-zinc-300">
          <DollarSign size={16} className="text-emerald-400" />
          Listing Price
        </label>
        <div className="relative group">
          <span className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${activeField === 'price' ? 'text-white' : 'text-zinc-500'}`}>$</span>
          <input
            type="text"
            name="price"
            value={propertyData.price ? formatPrice(propertyData.price.toString()) : ''}
            onFocus={() => setActiveField('price')}
            onBlur={() => setActiveField(null)}
            onChange={(e) => {
              const num = e.target.value.replace(/\D/g, '');
              updatePropertyData({ price: num ? parseInt(num) : undefined });
            }}
            placeholder="499,000"
            className={`${inputClasses('price')} pl-8`}
          />
        </div>
      </div>

      {/* Specs Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-zinc-300">
            <Bed size={16} className="text-blue-400" />
            Bedrooms
          </label>
          <input
            type="number"
            min="0"
            max="20"
            name="bedrooms"
            value={propertyData.bedrooms || ''}
            onFocus={() => setActiveField('bedrooms')}
            onBlur={() => setActiveField(null)}
            onChange={(e) => updatePropertyData({ bedrooms: parseInt(e.target.value) || undefined })}
            placeholder="4"
            className={inputClasses('bedrooms')}
          />
        </div>
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-zinc-300">
            <Bath size={16} className="text-cyan-400" />
            Bathrooms
          </label>
          <input
            type="number"
            min="0"
            max="20"
            step="0.5"
            name="bathrooms"
            value={propertyData.bathrooms || ''}
            onFocus={() => setActiveField('bathrooms')}
            onBlur={() => setActiveField(null)}
            onChange={(e) => updatePropertyData({ bathrooms: parseFloat(e.target.value) || undefined })}
            placeholder="3"
            className={inputClasses('bathrooms')}
          />
        </div>
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-zinc-300">
            <Square size={16} className="text-amber-400" />
            Square Feet
          </label>
          <input
            type="text"
            name="squareFeet"
            value={propertyData.squareFeet ? formatPrice(propertyData.squareFeet.toString()) : ''}
            onFocus={() => setActiveField('squareFeet')}
            onBlur={() => setActiveField(null)}
            onChange={(e) => {
              const num = e.target.value.replace(/\D/g, '');
              updatePropertyData({ squareFeet: num ? parseInt(num) : undefined });
            }}
            placeholder="2,500"
            className={inputClasses('squareFeet')}
          />
        </div>
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-zinc-300">
            <Calendar size={16} className="text-teal-400" />
            Year Built
          </label>
          <input
            type="number"
            min="1800"
            max={new Date().getFullYear()}
            name="yearBuilt"
            value={propertyData.yearBuilt || ''}
            onFocus={() => setActiveField('yearBuilt')}
            onBlur={() => setActiveField(null)}
            onChange={(e) => updatePropertyData({ yearBuilt: parseInt(e.target.value) || undefined })}
            placeholder="2020"
            className={inputClasses('yearBuilt')}
          />
        </div>
      </div>

      {/* Features */}
      <div className="space-y-4 pt-4 border-t border-white/5">
        <label className="flex items-center gap-2 text-sm font-medium text-zinc-300">
          <Sparkles size={16} className="text-emerald-400" />
          Property Features
        </label>

        <div className="bg-white/5 rounded-2xl p-6 border border-white/5">
            {/* Selected Features */}
            {propertyData.features.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
                {propertyData.features.map((feature) => (
                <motion.span
                    key={feature}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-600/20 border border-emerald-500/20 text-emerald-200 rounded-lg text-sm group"
                >
                    {feature}
                    <button
                    onClick={() => removeFeature(feature)}
                    className="hover:text-white transition-colors p-0.5 rounded-full hover:bg-emerald-600/50"
                    >
                    <X size={12} />
                    </button>
                </motion.span>
                ))}
            </div>
            )}

            {/* Custom Feature Input */}
            <div className="flex gap-2 mb-6">
            <input
                type="text"
                name="customFeature"
                value={customFeature}
                onFocus={() => setActiveField('customFeature')}
                onBlur={() => setActiveField(null)}
                onChange={(e) => setCustomFeature(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddCustomFeature()}
                placeholder="Add custom feature..."
                className={`flex-1 ${inputClasses('customFeature')}`}
            />
            <button
                onClick={handleAddCustomFeature}
                disabled={!customFeature.trim()}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all duration-300 shadow-lg shadow-emerald-900/20 hover:shadow-emerald-600/30 text-white"
            >
                <Plus size={20} />
            </button>
            </div>

            {/* Suggested Features */}
            <div>
            <p className="text-xs text-zinc-500 mb-3 uppercase tracking-wider font-medium">Suggested features</p>
            <div className="flex flex-wrap gap-2">
                {SUGGESTED_FEATURES
                .filter((f) => !propertyData.features.includes(f))
                .slice(0, 10)
                .map((feature) => (
                    <button
                    key={feature}
                    onClick={() => addFeature(feature)}
                    className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/5 text-zinc-400 hover:text-zinc-200 rounded-lg text-sm transition-all duration-200"
                    >
                    + {feature}
                    </button>
                ))}
            </div>
            </div>
        </div>
      </div>
    </div>
  );
}

export default PropertyDetailsStep;
