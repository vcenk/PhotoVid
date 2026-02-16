// Social Media Integration Types

export type SocialPlatform = 'facebook' | 'instagram';

export type IntegrationStatus = 'active' | 'expired' | 'revoked' | 'error';

export type PostStatus = 'pending' | 'scheduled' | 'publishing' | 'published' | 'failed';

export type PostType = 'image' | 'video' | 'carousel' | 'text';

// Database row type
export interface SocialIntegrationRow {
  id: string;
  user_id: string;
  platform: SocialPlatform;
  platform_user_id: string;
  access_token: string;
  token_expires_at: string | null;
  page_id: string | null;
  page_name: string | null;
  page_access_token: string | null;
  page_picture_url: string | null;
  instagram_account_id: string | null;
  instagram_username: string | null;
  instagram_profile_picture_url: string | null;
  status: IntegrationStatus;
  scopes: string[] | null;
  last_used_at: string | null;
  last_refreshed_at: string | null;
  error_message: string | null;
  connected_at: string;
  updated_at: string;
}

// Frontend-safe integration (no raw tokens)
export interface SocialIntegration {
  id: string;
  platform: SocialPlatform;
  pageId: string | null;
  pageName: string | null;
  pagePictureUrl: string | null;
  instagramAccountId: string | null;
  instagramUsername: string | null;
  instagramProfilePictureUrl: string | null;
  status: IntegrationStatus;
  scopes: string[];
  tokenExpiresAt: Date | null;
  lastUsedAt: Date | null;
  connectedAt: Date;
  errorMessage: string | null;
}

// Social post database row
export interface SocialPostRow {
  id: string;
  user_id: string;
  integration_id: string | null;
  platform: SocialPlatform;
  post_type: PostType;
  platform_post_id: string | null;
  media_url: string | null;
  caption: string | null;
  status: PostStatus;
  error_message: string | null;
  scheduled_for: string | null;
  published_at: string | null;
  created_at: string;
}

// Frontend social post
export interface SocialPost {
  id: string;
  integrationId: string | null;
  platform: SocialPlatform;
  postType: PostType;
  platformPostId: string | null;
  mediaUrl: string | null;
  caption: string | null;
  status: PostStatus;
  errorMessage: string | null;
  scheduledFor: Date | null;
  publishedAt: Date | null;
  createdAt: Date;
}

// OAuth initiation response
export interface OAuthInitResponse {
  oauthUrl: string;
  state: string;
}

// OAuth callback response
export interface OAuthCallbackResponse {
  success: boolean;
  integrations: SocialIntegration[];
  error?: string;
}

// Post to social options
export interface PostToSocialOptions {
  integrationIds: string[]; // Which accounts to post to
  mediaUrl: string;
  mediaType: PostType;
  caption: string;
  scheduledFor?: Date; // Null = post immediately
}

// Post result
export interface PostToSocialResult {
  success: boolean;
  posts: Array<{
    integrationId: string;
    postId?: string;
    status: PostStatus;
    error?: string;
  }>;
}

// Transform database row to frontend type
export function transformIntegration(row: SocialIntegrationRow): SocialIntegration {
  return {
    id: row.id,
    platform: row.platform,
    pageId: row.page_id,
    pageName: row.page_name,
    pagePictureUrl: row.page_picture_url,
    instagramAccountId: row.instagram_account_id,
    instagramUsername: row.instagram_username,
    instagramProfilePictureUrl: row.instagram_profile_picture_url,
    status: row.status,
    scopes: row.scopes || [],
    tokenExpiresAt: row.token_expires_at ? new Date(row.token_expires_at) : null,
    lastUsedAt: row.last_used_at ? new Date(row.last_used_at) : null,
    connectedAt: new Date(row.connected_at),
    errorMessage: row.error_message,
  };
}

// Transform database row to frontend post
export function transformPost(row: SocialPostRow): SocialPost {
  return {
    id: row.id,
    integrationId: row.integration_id,
    platform: row.platform,
    postType: row.post_type,
    platformPostId: row.platform_post_id,
    mediaUrl: row.media_url,
    caption: row.caption,
    status: row.status,
    errorMessage: row.error_message,
    scheduledFor: row.scheduled_for ? new Date(row.scheduled_for) : null,
    publishedAt: row.published_at ? new Date(row.published_at) : null,
    createdAt: new Date(row.created_at),
  };
}

// Facebook Graph API response types
export interface FacebookPage {
  id: string;
  name: string;
  access_token: string;
  picture?: {
    data: {
      url: string;
    };
  };
  instagram_business_account?: {
    id: string;
    username: string;
    profile_picture_url: string;
  };
}

export interface FacebookPagesResponse {
  data: FacebookPage[];
  paging?: {
    cursors: {
      before: string;
      after: string;
    };
    next?: string;
  };
}
