import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { createClient } from '../../database/client';

export interface PropertyAsset {
  id: string;
  assetId: string;
  url: string;
  type: 'image' | 'video';
  category: 'exterior' | 'interior' | 'aerial' | 'floor-plan' | 'virtual-tour' | 'other';
  isPrimary: boolean;
  order: number;
  toolUsed?: string;
  createdAt: string;
}

export interface Property {
  id: string;
  // Basic Info
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  // Property Details
  propertyType: 'house' | 'condo' | 'apartment' | 'townhouse' | 'land' | 'commercial';
  status: 'draft' | 'active' | 'pending' | 'sold' | 'archived';
  price?: number;
  bedrooms?: number;
  bathrooms?: number;
  squareFeet?: number;
  yearBuilt?: number;
  lotSize?: number;
  // Additional Info
  mlsNumber?: string;
  description?: string;
  features?: string[];
  // Assets
  assets: PropertyAsset[];
  thumbnailUrl?: string;
  // Metadata
  createdAt: string;
  updatedAt: string;
}

interface PropertyContextType {
  properties: Property[];
  loading: boolean;
  addProperty: (property: Omit<Property, 'id' | 'assets' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateProperty: (id: string, updates: Partial<Property>) => Promise<void>;
  deleteProperty: (id: string) => Promise<void>;
  addAssetToProperty: (propertyId: string, asset: Omit<PropertyAsset, 'id' | 'createdAt'>) => Promise<void>;
  removeAssetFromProperty: (propertyId: string, assetId: string) => Promise<void>;
  setPropertyThumbnail: (propertyId: string, url: string) => Promise<void>;
  fetchProperties: () => Promise<void>;
  getPropertyById: (id: string) => Property | undefined;
}

const PropertyContext = createContext<PropertyContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'photovid_properties';

function getLocalProperties(): Property[] {
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveLocalProperties(properties: Property[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(properties));
  } catch (e) {
    console.warn('Failed to save local properties:', e);
  }
}

export function PropertyProvider({ children }: { children: ReactNode }) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const fetchProperties = useCallback(async () => {
    setLoading(true);

    if (!supabase) {
      setProperties(getLocalProperties());
      setLoading(false);
      return;
    }

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        setProperties(getLocalProperties());
        setLoading(false);
        return;
      }

      // Try to fetch from database
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .order('updated_at', { ascending: false });

      if (!error && data) {
        const mapped = data.map((p: any) => ({
          id: p.id,
          name: p.name,
          address: p.address || '',
          city: p.city || '',
          state: p.state || '',
          zipCode: p.zip_code || '',
          propertyType: p.property_type || 'house',
          status: p.status || 'draft',
          price: p.price,
          bedrooms: p.bedrooms,
          bathrooms: p.bathrooms,
          squareFeet: p.square_feet,
          yearBuilt: p.year_built,
          lotSize: p.lot_size,
          mlsNumber: p.mls_number,
          description: p.description,
          features: p.features || [],
          assets: p.assets || [],
          thumbnailUrl: p.thumbnail_url,
          createdAt: p.created_at,
          updatedAt: p.updated_at,
        }));
        setProperties(mapped);
      } else {
        setProperties(getLocalProperties());
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
      setProperties(getLocalProperties());
    }

    setLoading(false);
  }, [supabase]);

  const addProperty = useCallback(async (property: Omit<Property, 'id' | 'assets' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    const id = `prop_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();
    const newProperty: Property = {
      ...property,
      id,
      assets: [],
      createdAt: now,
      updatedAt: now,
    };

    setProperties(prev => [newProperty, ...prev]);
    saveLocalProperties([newProperty, ...getLocalProperties()]);

    if (supabase) {
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (userData.user) {
          await supabase.from('properties').insert({
            id,
            user_id: userData.user.id,
            name: property.name,
            address: property.address,
            city: property.city,
            state: property.state,
            zip_code: property.zipCode,
            property_type: property.propertyType,
            status: property.status,
            price: property.price,
            bedrooms: property.bedrooms,
            bathrooms: property.bathrooms,
            square_feet: property.squareFeet,
            year_built: property.yearBuilt,
            lot_size: property.lotSize,
            mls_number: property.mlsNumber,
            description: property.description,
            features: property.features,
            thumbnail_url: property.thumbnailUrl,
            assets: [],
            created_at: now,
            updated_at: now,
          });
        }
      } catch (error) {
        console.error('Error saving property to database:', error);
      }
    }

    return id;
  }, [supabase]);

  const updateProperty = useCallback(async (id: string, updates: Partial<Property>) => {
    const now = new Date().toISOString();
    setProperties(prev =>
      prev.map(p => (p.id === id ? { ...p, ...updates, updatedAt: now } : p))
    );

    const localProps = getLocalProperties().map(p =>
      p.id === id ? { ...p, ...updates, updatedAt: now } : p
    );
    saveLocalProperties(localProps);

    if (supabase) {
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (userData.user) {
          const dbUpdates: Record<string, any> = { updated_at: now };
          if (updates.name !== undefined) dbUpdates.name = updates.name;
          if (updates.address !== undefined) dbUpdates.address = updates.address;
          if (updates.city !== undefined) dbUpdates.city = updates.city;
          if (updates.state !== undefined) dbUpdates.state = updates.state;
          if (updates.zipCode !== undefined) dbUpdates.zip_code = updates.zipCode;
          if (updates.propertyType !== undefined) dbUpdates.property_type = updates.propertyType;
          if (updates.status !== undefined) dbUpdates.status = updates.status;
          if (updates.price !== undefined) dbUpdates.price = updates.price;
          if (updates.bedrooms !== undefined) dbUpdates.bedrooms = updates.bedrooms;
          if (updates.bathrooms !== undefined) dbUpdates.bathrooms = updates.bathrooms;
          if (updates.squareFeet !== undefined) dbUpdates.square_feet = updates.squareFeet;
          if (updates.yearBuilt !== undefined) dbUpdates.year_built = updates.yearBuilt;
          if (updates.lotSize !== undefined) dbUpdates.lot_size = updates.lotSize;
          if (updates.mlsNumber !== undefined) dbUpdates.mls_number = updates.mlsNumber;
          if (updates.description !== undefined) dbUpdates.description = updates.description;
          if (updates.features !== undefined) dbUpdates.features = updates.features;
          if (updates.thumbnailUrl !== undefined) dbUpdates.thumbnail_url = updates.thumbnailUrl;
          if (updates.assets !== undefined) dbUpdates.assets = updates.assets;

          await supabase.from('properties').update(dbUpdates).eq('id', id);
        }
      } catch (error) {
        console.error('Error updating property in database:', error);
      }
    }
  }, [supabase]);

  const deleteProperty = useCallback(async (id: string) => {
    setProperties(prev => prev.filter(p => p.id !== id));
    saveLocalProperties(getLocalProperties().filter(p => p.id !== id));

    if (supabase) {
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (userData.user) {
          await supabase.from('properties').delete().eq('id', id);
        }
      } catch (error) {
        console.error('Error deleting property from database:', error);
      }
    }
  }, [supabase]);

  const addAssetToProperty = useCallback(async (propertyId: string, asset: Omit<PropertyAsset, 'id' | 'createdAt'>) => {
    const newAsset: PropertyAsset = {
      ...asset,
      id: `asset_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    setProperties(prev =>
      prev.map(p => {
        if (p.id === propertyId) {
          const assets = [...p.assets, newAsset];
          // Set as thumbnail if it's the first image or marked as primary
          const thumbnailUrl = asset.isPrimary || !p.thumbnailUrl ? asset.url : p.thumbnailUrl;
          return { ...p, assets, thumbnailUrl, updatedAt: new Date().toISOString() };
        }
        return p;
      })
    );

    const localProps = getLocalProperties().map(p => {
      if (p.id === propertyId) {
        const assets = [...p.assets, newAsset];
        const thumbnailUrl = asset.isPrimary || !p.thumbnailUrl ? asset.url : p.thumbnailUrl;
        return { ...p, assets, thumbnailUrl, updatedAt: new Date().toISOString() };
      }
      return p;
    });
    saveLocalProperties(localProps);
  }, []);

  const removeAssetFromProperty = useCallback(async (propertyId: string, assetId: string) => {
    setProperties(prev =>
      prev.map(p => {
        if (p.id === propertyId) {
          const assets = p.assets.filter(a => a.id !== assetId);
          return { ...p, assets, updatedAt: new Date().toISOString() };
        }
        return p;
      })
    );

    const localProps = getLocalProperties().map(p => {
      if (p.id === propertyId) {
        const assets = p.assets.filter(a => a.id !== assetId);
        return { ...p, assets, updatedAt: new Date().toISOString() };
      }
      return p;
    });
    saveLocalProperties(localProps);
  }, []);

  const setPropertyThumbnail = useCallback(async (propertyId: string, url: string) => {
    await updateProperty(propertyId, { thumbnailUrl: url });
  }, [updateProperty]);

  const getPropertyById = useCallback((id: string): Property | undefined => {
    return properties.find(p => p.id === id);
  }, [properties]);

  useEffect(() => {
    fetchProperties();
  }, []);

  return (
    <PropertyContext.Provider
      value={{
        properties,
        loading,
        addProperty,
        updateProperty,
        deleteProperty,
        addAssetToProperty,
        removeAssetFromProperty,
        setPropertyThumbnail,
        fetchProperties,
        getPropertyById,
      }}
    >
      {children}
    </PropertyContext.Provider>
  );
}

export function useProperties() {
  const context = useContext(PropertyContext);
  if (context === undefined) {
    throw new Error('useProperties must be used within a PropertyProvider');
  }
  return context;
}
