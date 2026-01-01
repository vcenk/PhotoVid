import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createClient } from '../../lib/supabase/client';

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

export function AssetProvider({ children }: { children: ReactNode }) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const fetchAssets = async () => {
    if (!supabase) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('assets')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setAssets(data as Asset[]);
    }
    setLoading(false);
  };

  const addAsset = async (url: string, type: 'image' | 'video', name?: string) => {
    if (!supabase) return;
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    const { error } = await supabase
      .from('assets')
      .insert({
        url,
        type,
        name,
        user_id: userData.user.id
      });

    if (!error) {
      fetchAssets();
    }
  };

  const deleteAsset = async (id: string) => {
    if (supabase) {
      await supabase.from('assets').delete().eq('id', id);
    }
    setAssets(assets.filter(a => a.id !== id));
  };

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
