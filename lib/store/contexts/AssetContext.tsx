import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { createClient } from '../../database/client';

export interface Asset {
  id: string;
  url: string;
  type: 'image' | 'video';
  name?: string;
  created_at: string;
}

interface AssetContextType {
  assets: Asset[];
  loading: boolean;
  addAsset: (url: string, type: 'image' | 'video', name?: string) => Promise<void>;
  deleteAsset: (id: string) => Promise<void>;
  fetchAssets: () => Promise<void>;
}

const AssetContext = createContext<AssetContextType | undefined>(undefined);

// Local storage key for offline/demo mode
const LOCAL_STORAGE_KEY = 'photovid_assets';

function getLocalAssets(): Asset[] {
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveLocalAssets(assets: Asset[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(assets));
  } catch (e) {
    console.warn('Failed to save local assets:', e);
  }
}

export function AssetProvider({ children }: { children: ReactNode }) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  // ============================================
  // Fetch assets (read-only, allowed via RLS)
  // ============================================
  const fetchAssets = useCallback(async () => {
    setLoading(true);

    if (!supabase) {
      setAssets(getLocalAssets());
      setLoading(false);
      return;
    }

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        setAssets(getLocalAssets());
        setLoading(false);
        return;
      }

      // SELECT is allowed via RLS
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setAssets(data as Asset[]);
      }
    } catch (error) {
      console.error('Error fetching assets:', error);
      setAssets(getLocalAssets());
    }

    setLoading(false);
  }, [supabase]);

  // ============================================
  // SECURE: Add asset via Edge Function
  // ============================================
  const addAsset = useCallback(async (url: string, type: 'image' | 'video', name?: string) => {
    if (!supabase) {
      // Fallback for demo without Supabase
      const newAsset: Asset = {
        id: `asset_${Date.now()}`,
        url,
        type,
        name,
        created_at: new Date().toISOString(),
      };
      const localAssets = getLocalAssets();
      localAssets.unshift(newAsset);
      saveLocalAssets(localAssets);
      setAssets(localAssets);
      return;
    }

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        // Not logged in, use local
        const newAsset: Asset = {
          id: `asset_${Date.now()}`,
          url,
          type,
          name,
          created_at: new Date().toISOString(),
        };
        const localAssets = getLocalAssets();
        localAssets.unshift(newAsset);
        saveLocalAssets(localAssets);
        setAssets(localAssets);
        return;
      }

      // SECURE: Call Edge Function instead of direct database write
      const { data: response, error } = await supabase.functions.invoke('save-asset', {
        body: {
          url,
          type,
          name,
        },
      });

      if (error) {
        console.error('Error saving asset via Edge Function:', error);
        return;
      }

      if (response?.error) {
        console.error('Edge Function error:', response.error);
        return;
      }

      if (response?.success) {
        // Refresh assets list
        fetchAssets();
      }
    } catch (error) {
      console.error('Error adding asset:', error);
    }
  }, [supabase, fetchAssets]);

  // ============================================
  // SECURE: Delete asset via Edge Function
  // ============================================
  const deleteAsset = useCallback(async (id: string) => {
    if (!supabase) {
      const localAssets = getLocalAssets().filter(a => a.id !== id);
      saveLocalAssets(localAssets);
      setAssets(localAssets);
      return;
    }

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        const localAssets = getLocalAssets().filter(a => a.id !== id);
        saveLocalAssets(localAssets);
        setAssets(localAssets);
        return;
      }

      // SECURE: Call Edge Function instead of direct database delete
      const { data: response, error } = await supabase.functions.invoke('delete-asset', {
        body: { id },
      });

      if (error) {
        console.error('Error deleting asset via Edge Function:', error);
        return;
      }

      if (response?.success) {
        // Update local state
        setAssets(prev => prev.filter(a => a.id !== id));
      }
    } catch (error) {
      console.error('Error deleting asset:', error);
    }
  }, [supabase]);

  useEffect(() => {
    fetchAssets();
  }, []);

  return (
    <AssetContext.Provider value={{
      assets,
      loading,
      addAsset,
      deleteAsset,
      fetchAssets
    }}>
      {children}
    </AssetContext.Provider>
  );
}

export function useAssets() {
  const context = useContext(AssetContext);
  if (context === undefined) {
    throw new Error('useAssets must be used within an AssetProvider');
  }
  return context;
}
