import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { createClient } from '../../database/client';
import {
  SocialIntegration,
  SocialPost,
  PostToSocialOptions,
  PostToSocialResult,
  transformIntegration,
  transformPost,
  SocialIntegrationRow,
  SocialPostRow,
} from '../../types/social';

interface SocialIntegrationsContextType {
  integrations: SocialIntegration[];
  scheduledPosts: SocialPost[];
  loading: boolean;
  error: string | null;

  // Actions
  fetchIntegrations: () => Promise<void>;
  fetchScheduledPosts: () => Promise<void>;
  initiateOAuth: () => Promise<string | null>;
  completeOAuth: (code: string, state: string) => Promise<boolean>;
  disconnectIntegration: (id: string, revokeToken?: boolean) => Promise<boolean>;
  postToSocial: (options: PostToSocialOptions) => Promise<PostToSocialResult>;
  cancelScheduledPost: (postId: string) => Promise<boolean>;

  // Helpers
  hasActiveIntegration: (platform?: 'facebook' | 'instagram') => boolean;
  getIntegrationById: (id: string) => SocialIntegration | undefined;
  getIntegrationsForPlatform: (platform: 'facebook' | 'instagram') => SocialIntegration[];
}

const SocialIntegrationsContext = createContext<SocialIntegrationsContextType | undefined>(undefined);

export function SocialIntegrationsProvider({ children }: { children: ReactNode }) {
  const [integrations, setIntegrations] = useState<SocialIntegration[]>([]);
  const [scheduledPosts, setScheduledPosts] = useState<SocialPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  // Fetch all integrations for current user
  const fetchIntegrations = useCallback(async () => {
    if (!supabase) {
      setIntegrations([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setIntegrations([]);
        setLoading(false);
        return;
      }

      // Direct query via RLS (users can SELECT their own)
      const { data, error: queryError } = await supabase
        .from('social_integrations')
        .select('*')
        .order('connected_at', { ascending: false });

      if (queryError) {
        console.error('Failed to fetch integrations:', queryError);
        setError('Failed to load integrations');
      } else {
        setIntegrations((data as SocialIntegrationRow[]).map(transformIntegration));
      }
    } catch (err) {
      console.error('Fetch integrations error:', err);
      setError('Failed to load integrations');
    }

    setLoading(false);
  }, [supabase]);

  // Fetch scheduled posts
  const fetchScheduledPosts = useCallback(async () => {
    if (!supabase) {
      setScheduledPosts([]);
      return;
    }

    try {
      const { data, error: queryError } = await supabase
        .from('social_posts')
        .select('*')
        .eq('status', 'scheduled')
        .order('scheduled_for', { ascending: true });

      if (!queryError && data) {
        setScheduledPosts((data as SocialPostRow[]).map(transformPost));
      }
    } catch (err) {
      console.error('Fetch scheduled posts error:', err);
    }
  }, [supabase]);

  // Initiate OAuth flow
  const initiateOAuth = useCallback(async (): Promise<string | null> => {
    if (!supabase) {
      setError('Authentication not configured');
      return null;
    }

    try {
      const { data, error: invokeError } = await supabase.functions.invoke('social-auth-init');

      if (invokeError) {
        console.error('OAuth init error:', invokeError);
        setError('Failed to start connection');
        return null;
      }

      if (data?.oauthUrl) {
        return data.oauthUrl;
      }

      setError(data?.error || 'Failed to start connection');
      return null;
    } catch (err) {
      console.error('OAuth init error:', err);
      setError('Failed to start connection');
      return null;
    }
  }, [supabase]);

  // Complete OAuth flow (called from callback page)
  const completeOAuth = useCallback(async (code: string, state: string): Promise<boolean> => {
    if (!supabase) {
      setError('Authentication not configured');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: invokeError } = await supabase.functions.invoke('social-auth-callback', {
        body: { code, state },
      });

      if (invokeError) {
        console.error('OAuth callback error:', invokeError);
        setError('Failed to complete connection');
        setLoading(false);
        return false;
      }

      if (data?.success) {
        // Refresh integrations list
        await fetchIntegrations();
        setLoading(false);
        return true;
      }

      setError(data?.error || 'Failed to complete connection');
      setLoading(false);
      return false;
    } catch (err) {
      console.error('OAuth callback error:', err);
      setError('Failed to complete connection');
      setLoading(false);
      return false;
    }
  }, [supabase, fetchIntegrations]);

  // Disconnect an integration
  const disconnectIntegration = useCallback(async (id: string, revokeToken = false): Promise<boolean> => {
    if (!supabase) {
      setError('Authentication not configured');
      return false;
    }

    try {
      const { data, error: invokeError } = await supabase.functions.invoke('social-disconnect', {
        body: { integrationId: id, revokeToken },
      });

      if (invokeError) {
        console.error('Disconnect error:', invokeError);
        setError('Failed to disconnect');
        return false;
      }

      if (data?.success) {
        // Remove from local state
        setIntegrations(prev => prev.filter(i => i.id !== id));
        return true;
      }

      setError(data?.error || 'Failed to disconnect');
      return false;
    } catch (err) {
      console.error('Disconnect error:', err);
      setError('Failed to disconnect');
      return false;
    }
  }, [supabase]);

  // Post to social media
  const postToSocial = useCallback(async (options: PostToSocialOptions): Promise<PostToSocialResult> => {
    if (!supabase) {
      return { success: false, posts: [] };
    }

    const results: PostToSocialResult['posts'] = [];

    for (const integrationId of options.integrationIds) {
      try {
        const { data, error: invokeError } = await supabase.functions.invoke('social-post', {
          body: {
            integrationId,
            mediaUrl: options.mediaUrl,
            mediaType: options.mediaType,
            caption: options.caption,
            scheduledFor: options.scheduledFor?.toISOString(),
          },
        });

        if (invokeError) {
          results.push({
            integrationId,
            status: 'failed',
            error: 'Failed to post',
          });
        } else if (data?.success) {
          results.push({
            integrationId,
            postId: data.postId,
            status: data.status,
          });
        } else {
          results.push({
            integrationId,
            status: 'failed',
            error: data?.error || 'Failed to post',
          });
        }
      } catch (err) {
        results.push({
          integrationId,
          status: 'failed',
          error: 'Failed to post',
        });
      }
    }

    // Refresh scheduled posts if any were scheduled
    if (options.scheduledFor) {
      await fetchScheduledPosts();
    }

    const allSuccess = results.every(r => r.status === 'published' || r.status === 'scheduled');
    return { success: allSuccess, posts: results };
  }, [supabase, fetchScheduledPosts]);

  // Cancel a scheduled post
  const cancelScheduledPost = useCallback(async (postId: string): Promise<boolean> => {
    if (!supabase) return false;

    try {
      // Direct delete via service (we need an edge function for this)
      // For now, update status to prevent publishing
      const { error: updateError } = await supabase
        .from('social_posts')
        .delete()
        .eq('id', postId)
        .eq('status', 'scheduled');

      if (updateError) {
        console.error('Cancel post error:', updateError);
        return false;
      }

      setScheduledPosts(prev => prev.filter(p => p.id !== postId));
      return true;
    } catch (err) {
      console.error('Cancel post error:', err);
      return false;
    }
  }, [supabase]);

  // Helper: Check if user has active integrations
  const hasActiveIntegration = useCallback((platform?: 'facebook' | 'instagram'): boolean => {
    if (platform) {
      return integrations.some(i => i.platform === platform && i.status === 'active');
    }
    return integrations.some(i => i.status === 'active');
  }, [integrations]);

  // Helper: Get integration by ID
  const getIntegrationById = useCallback((id: string): SocialIntegration | undefined => {
    return integrations.find(i => i.id === id);
  }, [integrations]);

  // Helper: Get integrations for platform
  const getIntegrationsForPlatform = useCallback((platform: 'facebook' | 'instagram'): SocialIntegration[] => {
    return integrations.filter(i => i.platform === platform && i.status === 'active');
  }, [integrations]);

  // Load integrations on mount
  useEffect(() => {
    fetchIntegrations();
    fetchScheduledPosts();
  }, [fetchIntegrations, fetchScheduledPosts]);

  return (
    <SocialIntegrationsContext.Provider
      value={{
        integrations,
        scheduledPosts,
        loading,
        error,
        fetchIntegrations,
        fetchScheduledPosts,
        initiateOAuth,
        completeOAuth,
        disconnectIntegration,
        postToSocial,
        cancelScheduledPost,
        hasActiveIntegration,
        getIntegrationById,
        getIntegrationsForPlatform,
      }}
    >
      {children}
    </SocialIntegrationsContext.Provider>
  );
}

export function useSocialIntegrations() {
  const context = useContext(SocialIntegrationsContext);
  if (context === undefined) {
    throw new Error('useSocialIntegrations must be used within a SocialIntegrationsProvider');
  }
  return context;
}
