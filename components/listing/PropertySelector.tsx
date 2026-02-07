import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProperties, Property } from '@/lib/store/contexts/PropertyContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  Search,
  Plus,
  MapPin,
  Bed,
  Bath,
  Square,
  DollarSign,
  ExternalLink,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PropertySelectorProps {
  selectedProperty: Property | null;
  onSelect: (property: Property) => void;
}

export function PropertySelector({ selectedProperty, onSelect }: PropertySelectorProps) {
  const { properties, addProperty } = useProperties();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quickForm, setQuickForm] = useState({
    address: '',
    city: '',
    state: '',
    zipCode: '',
    bedrooms: '',
    bathrooms: '',
    price: '',
    squareFeet: '',
    propertyType: 'house' as Property['propertyType'],
  });

  const filtered = properties.filter(
    (p) =>
      p.address.toLowerCase().includes(search.toLowerCase()) ||
      p.city.toLowerCase().includes(search.toLowerCase()) ||
      p.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleQuickAdd = async () => {
    if (!quickForm.address) return;
    const propertyData = {
      name: quickForm.address,
      address: quickForm.address,
      city: quickForm.city,
      state: quickForm.state,
      zipCode: quickForm.zipCode,
      propertyType: quickForm.propertyType,
      status: 'draft' as const,
      price: quickForm.price ? Number(quickForm.price) : undefined,
      bedrooms: quickForm.bedrooms ? Number(quickForm.bedrooms) : undefined,
      bathrooms: quickForm.bathrooms ? Number(quickForm.bathrooms) : undefined,
      squareFeet: quickForm.squareFeet ? Number(quickForm.squareFeet) : undefined,
    };
    const id = await addProperty(propertyData);
    // Build the property object directly since state hasn't updated yet
    const newProp: Property = {
      ...propertyData,
      id,
      assets: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    onSelect(newProp);
    setShowQuickAdd(false);
    setQuickForm({ address: '', city: '', state: '', zipCode: '', bedrooms: '', bathrooms: '', price: '', squareFeet: '', propertyType: 'house' });
  };

  return (
    <div className="rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900/50 p-4">
      <div className="flex items-center gap-3 flex-wrap">
        {/* Dropdown trigger */}
        <div className="relative flex-1 min-w-[240px]">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={cn(
              'w-full flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl border transition-colors text-sm',
              selectedProperty
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-white'
                : 'border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/5 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:border-zinc-300 dark:hover:border-white/20'
            )}
          >
            <span className="truncate">
              {selectedProperty
                ? `${selectedProperty.address}, ${selectedProperty.city}`
                : 'Select a property...'}
            </span>
            <ChevronDown
              size={16}
              className={cn('shrink-0 transition-transform', isOpen && 'rotate-180')}
            />
          </button>

          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full left-0 right-0 mt-2 rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900 shadow-2xl z-30 overflow-hidden"
              >
                <div className="p-2 border-b border-zinc-200 dark:border-white/5">
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <input
                      type="text"
                      placeholder="Search properties..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 rounded-lg bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500/30"
                      autoFocus
                    />
                  </div>
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {filtered.length === 0 ? (
                    <div className="p-4 text-center text-sm text-zinc-500">
                      No properties found
                    </div>
                  ) : (
                    filtered.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => {
                          onSelect(p);
                          setIsOpen(false);
                          setSearch('');
                        }}
                        className={cn(
                          'w-full flex items-start gap-3 px-3 py-2.5 text-left hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors',
                          selectedProperty?.id === p.id && 'bg-emerald-500/10'
                        )}
                      >
                        {p.thumbnailUrl ? (
                          <img src={p.thumbnailUrl} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                            <MapPin size={16} className="text-zinc-600" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="text-sm text-zinc-900 dark:text-white truncate">{p.address || p.name}</div>
                          <div className="text-xs text-zinc-500">
                            {p.city}, {p.state}
                            {p.price ? ` · $${p.price.toLocaleString()}` : ''}
                            {p.bedrooms ? ` · ${p.bedrooms}bd` : ''}
                            {p.bathrooms ? `/${p.bathrooms}ba` : ''}
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button
          onClick={() => setShowQuickAdd(true)}
          className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-white/10 text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors"
        >
          <Plus size={14} />
          Quick Add
        </button>

        <button
          onClick={() => navigate('/studio/properties')}
          className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm text-zinc-500 hover:text-emerald-400 transition-colors"
        >
          Manage Properties
          <ExternalLink size={12} />
        </button>
      </div>

      {/* Selected property summary */}
      {selectedProperty && (
        <div className="mt-3 flex items-center gap-4 text-sm text-zinc-400 flex-wrap">
          {selectedProperty.thumbnailUrl && (
            <img src={selectedProperty.thumbnailUrl} alt="" className="w-12 h-12 rounded-lg object-cover" />
          )}
          <div className="flex items-center gap-3 flex-wrap">
            <span className="flex items-center gap-1">
              <MapPin size={13} className="text-zinc-500" />
              {selectedProperty.address}, {selectedProperty.city}
            </span>
            {selectedProperty.price && (
              <span className="flex items-center gap-1">
                <DollarSign size={13} className="text-zinc-500" />
                {selectedProperty.price.toLocaleString()}
              </span>
            )}
            {selectedProperty.bedrooms && (
              <span className="flex items-center gap-1">
                <Bed size={13} className="text-zinc-500" />
                {selectedProperty.bedrooms} bd
              </span>
            )}
            {selectedProperty.bathrooms && (
              <span className="flex items-center gap-1">
                <Bath size={13} className="text-zinc-500" />
                {selectedProperty.bathrooms} ba
              </span>
            )}
            {selectedProperty.squareFeet && (
              <span className="flex items-center gap-1">
                <Square size={13} className="text-zinc-500" />
                {selectedProperty.squareFeet.toLocaleString()} sqft
              </span>
            )}
          </div>
        </div>
      )}

      {/* Quick Add Modal */}
      <AnimatePresence>
        {showQuickAdd && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-white/5">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-zinc-900 dark:text-white">Quick Add Property</h4>
                <button onClick={() => setShowQuickAdd(false)} className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white">
                  <X size={16} />
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <input
                  placeholder="Address *"
                  value={quickForm.address}
                  onChange={(e) => setQuickForm((p) => ({ ...p, address: e.target.value }))}
                  className="col-span-2 px-3 py-2 rounded-lg bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/30"
                />
                <input
                  placeholder="City"
                  value={quickForm.city}
                  onChange={(e) => setQuickForm((p) => ({ ...p, city: e.target.value }))}
                  className="px-3 py-2 rounded-lg bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/30"
                />
                <input
                  placeholder="State"
                  value={quickForm.state}
                  onChange={(e) => setQuickForm((p) => ({ ...p, state: e.target.value }))}
                  className="px-3 py-2 rounded-lg bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/30"
                />
                <input
                  placeholder="Beds"
                  type="number"
                  value={quickForm.bedrooms}
                  onChange={(e) => setQuickForm((p) => ({ ...p, bedrooms: e.target.value }))}
                  className="px-3 py-2 rounded-lg bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/30"
                />
                <input
                  placeholder="Baths"
                  type="number"
                  value={quickForm.bathrooms}
                  onChange={(e) => setQuickForm((p) => ({ ...p, bathrooms: e.target.value }))}
                  className="px-3 py-2 rounded-lg bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/30"
                />
                <input
                  placeholder="Price"
                  type="number"
                  value={quickForm.price}
                  onChange={(e) => setQuickForm((p) => ({ ...p, price: e.target.value }))}
                  className="px-3 py-2 rounded-lg bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/30"
                />
                <input
                  placeholder="Sqft"
                  type="number"
                  value={quickForm.squareFeet}
                  onChange={(e) => setQuickForm((p) => ({ ...p, squareFeet: e.target.value }))}
                  className="px-3 py-2 rounded-lg bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/30"
                />
              </div>
              <div className="mt-3 flex justify-end">
                <button
                  onClick={handleQuickAdd}
                  disabled={!quickForm.address}
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Add & Select
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
