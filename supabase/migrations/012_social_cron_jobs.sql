-- ============================================
-- CRON JOBS FOR SOCIAL MEDIA FEATURES
-- Requires pg_cron extension (enabled by default in Supabase)
-- ============================================

-- Enable pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Grant usage to postgres user
GRANT USAGE ON SCHEMA cron TO postgres;

-- Safely unschedule existing jobs
DO $do$
DECLARE
  job_id bigint;
BEGIN
  SELECT jobid INTO job_id FROM cron.job WHERE jobname = 'publish-scheduled-social-posts';
  IF job_id IS NOT NULL THEN
    PERFORM cron.unschedule(job_id);
  END IF;

  SELECT jobid INTO job_id FROM cron.job WHERE jobname = 'refresh-social-tokens';
  IF job_id IS NOT NULL THEN
    PERFORM cron.unschedule(job_id);
  END IF;

  SELECT jobid INTO job_id FROM cron.job WHERE jobname = 'cleanup-old-social-posts';
  IF job_id IS NOT NULL THEN
    PERFORM cron.unschedule(job_id);
  END IF;
END $do$;

-- Schedule Job 1: Publish Scheduled Posts (every 5 minutes)
SELECT cron.schedule(
  'publish-scheduled-social-posts',
  '*/5 * * * *',
  $cron1$SELECT net.http_post(url := 'https://duodcbkalvevcacnvpag.supabase.co/functions/v1/social-publish-scheduled', headers := '{"Content-Type": "application/json"}'::jsonb, body := '{}'::jsonb) AS request_id;$cron1$
);

-- Schedule Job 2: Refresh Expiring Tokens (daily at 3:00 AM UTC)
SELECT cron.schedule(
  'refresh-social-tokens',
  '0 3 * * *',
  $cron2$SELECT net.http_post(url := 'https://duodcbkalvevcacnvpag.supabase.co/functions/v1/social-refresh-token', headers := '{"Content-Type": "application/json"}'::jsonb, body := '{}'::jsonb) AS request_id;$cron2$
);

-- Schedule Job 3: Cleanup old posts (weekly on Sunday at 4:00 AM UTC)
SELECT cron.schedule(
  'cleanup-old-social-posts',
  '0 4 * * 0',
  $cron3$DELETE FROM social_posts WHERE status = 'published' AND published_at < NOW() - INTERVAL '90 days';$cron3$
);

