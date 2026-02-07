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
  deleteAsset: (id: string) => Promise<boolean>;
  renameAsset: (id: string, name: string) => Promise<void>;
  fetchAssets: () => Promise<void>;
}

// Check if a blob URL is still valid
function isBlobUrlValid(url: string): boolean {
  if (!url.startsWith('blob:')) return true;
  // Blob URLs are never valid after page refresh
  return false;
}

// Filter out stale blob URLs from assets
function filterStaleAssets(assets: Asset[]): Asset[] {
  return assets.filter(asset => isBlobUrlValid(asset.url));
}

const AssetContext = createContext<AssetContextType | undefined>(undefined);

// Local storage key for offline/demo mode
const LOCAL_STORAGE_KEY = 'photovid_assets';

function getLocalAssets(): Asset[] {
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    const assets = stored ? JSON.parse(stored) : [];
    // Filter out stale blob URLs
    const validAssets = filterStaleAssets(assets);
    // Save back if we filtered any
    if (validAssets.length !== assets.length) {
      saveLocalAssets(validAssets);
    }
    return validAssets;
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
  // SECURE: Rename asset
  // ============================================
  const renameAsset = useCallback(async (id: string, name: string) => {
    if (!supabase) {
      // Fallback for demo without Supabase
      const localAssets = getLocalAssets().map(a =>
        a.id === id ? { ...a, name } : a
      );
      saveLocalAssets(localAssets);
      setAssets(localAssets);
      return;
    }

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        // Not logged in, use local
        const localAssets = getLocalAssets().map(a =>
          a.id === id ? { ...a, name } : a
        );
        saveLocalAssets(localAssets);
        setAssets(localAssets);
        return;
      }

      // Update in database (RLS will verify ownership)
      const { error } = await supabase
        .from('assets')
        .update({ name })
        .eq('id', id)
        .eq('user_id', userData.user.id);

      if (error) {
        console.error('Error renaming asset:', error);
        return;
      }

      // Update local state
      setAssets(prev => prev.map(a => a.id === id ? { ...a, name } : a));
    } catch (error) {
      console.error('Error renaming asset:', error);
    }
  }, [supabase]);

  // ============================================
  // SECURE: Delete asset via Edge Function
  // ============================================
  const deleteAsset = useCallback(async (id: string): Promise<boolean> => {
    if (!supabase) {
      const localAssets = getLocalAssets().filter(a => a.id !== id);
      saveLocalAssets(localAssets);
      setAssets(localAssets);
      return true;
    }

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        const localAssets = getLocalAssets().filter(a => a.id !== id);
        saveLocalAssets(localAssets);
        setAssets(localAssets);
        return true;
      }

      // Optimistically remove from UI first
      const previousAssets = assets;
      setAssets(prev => prev.filter(a => a.id !== id));

      try {
        // SECURE: Call Edge Function instead of direct database delete
        console.log('Attempting to delete asset via Edge Function:', id);
        const { data: response, error } = await supabase.functions.invoke('delete-asset', {
          body: { id },
        });

        console.log('Delete asset response:', response, 'error:', error);

        if (error) {
          console.error('Error deleting asset via Edge Function:', error);
          // Restore on failure
          setAssets(previousAssets);

          // If edge function fails, try direct delete with RLS
          console.log('Trying direct delete with RLS...');
          const { data: deletedRows, error: directError } = await supabase
            .from('assets')
            .delete()
            .eq('id', id)
            .eq('user_id', userData.user.id)
            .select();

          if (directError) {
            console.error('Direct delete also failed:', directError);
            return false;
          }

          if (!deletedRows || deletedRows.length === 0) {
            console.error('Direct delete returned no rows - asset may not exist or ID mismatch');
            return false;
          }

          // Direct delete succeeded
          console.log('Direct delete succeeded:', deletedRows);
          setAssets(prev => prev.filter(a => a.id !== id));
          return true;
        }

        if (response?.success) {
          console.log('Asset deleted successfully via Edge Function');
          return true;
        }

        // Check for specific error from edge function
        if (response?.error) {
          console.error('Edge function returned error:', response.error);
        }

        // Restore if not successful
        console.error('Delete was not successful, restoring UI');
        setAssets(previousAssets);
        return false;
      } catch (funcError) {
        console.error('Edge function call failed:', funcError);
        // Try direct delete as fallback
        console.log('Trying direct delete as fallback...');
        const { data: deletedRows, error: directError } = await supabase
          .from('assets')
          .delete()
          .eq('id', id)
          .eq('user_id', userData.user.id)
          .select();

        if (!directError && deletedRows && deletedRows.length > 0) {
          console.log('Fallback direct delete succeeded');
          return true;
        }
        console.error('Fallback delete failed:', directError);
        setAssets(previousAssets);
        return false;
      }
    } catch (error) {
      console.error('Error deleting asset:', error);
      return false;
    }
  }, [supabase, assets]);

  useEffect(() => {
    fetchAssets();
  }, []);

  return (
    <AssetContext.Provider value={{
      assets,
      loading,
      addAsset,
      deleteAsset,
      renameAsset,
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
