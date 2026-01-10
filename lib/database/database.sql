-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Create Projects Table
create table if not exists projects (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users not null,
  name text not null,
  mode text check (mode in ('wizard', 'canvas')) default 'wizard',
  workflow_data jsonb default '{}'::jsonb,
  thumbnail_url text
);

-- 2. Create Row Level Security (RLS) Policies
alter table projects enable row level security;

-- Policy: Users can only see their own projects
create policy "Users can view own projects"
  on projects for select
  using (auth.uid() = user_id);

-- Policy: Users can insert their own projects
create policy "Users can insert own projects"
  on projects for insert
  with check (auth.uid() = user_id);

-- Policy: Users can update their own projects
create policy "Users can update own projects"
  on projects for update
  using (auth.uid() = user_id);

-- Policy: Users can delete their own projects
create policy "Users can delete own projects"
  on projects for delete
  using (auth.uid() = user_id);

-- 3. Storage Bucket Setup (for Supabase Storage, separate from Cloudflare R2)
-- Note: You might need to create the bucket 'user-uploads' manually in the Supabase Dashboard > Storage
insert into storage.buckets (id, name, public) 
values ('user-uploads', 'user-uploads', true)
on conflict (id) do nothing;

create policy "Public Access to User Uploads"
  on storage.objects for select
  using ( bucket_id = 'user-uploads' );

create policy "Authenticated Users can Upload"
  on storage.objects for insert
  with check ( bucket_id = 'user-uploads' and auth.role() = 'authenticated' );
