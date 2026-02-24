-- Migration: Add Availability Sharing Feature
-- Run this in your Supabase SQL Editor

-- Public Profiles table (for shared availability)
CREATE TABLE IF NOT EXISTS public_profiles (
  id uuid REFERENCES profiles(id) ON DELETE CASCADE PRIMARY KEY,
  share_token text UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'),
  name text,
  timezone text,
  weekday_start time,
  weekday_end time,
  weekend_start time,
  weekend_end time,
  google_calendar_connected boolean DEFAULT false,
  availability_updated_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Friend Connections table (bidirectional friend relationships)
CREATE TABLE IF NOT EXISTS friend_connections (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  connected_user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, connected_user_id)
);

-- RLS for public_profiles
ALTER TABLE public_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles are viewable by share token" ON public_profiles;
CREATE POLICY "Public profiles are viewable by share token"
  ON public_profiles FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can manage own public profile" ON public_profiles;
CREATE POLICY "Users can manage own public profile"
  ON public_profiles FOR ALL
  USING (auth.uid() = id);

-- RLS for friend_connections
ALTER TABLE friend_connections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view connections where they're involved" ON friend_connections;
CREATE POLICY "Users can view connections where they're involved"
  ON friend_connections FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = connected_user_id);

DROP POLICY IF EXISTS "Users can create own connections" ON friend_connections;
CREATE POLICY "Users can create own connections"
  ON friend_connections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Trigger for public_profiles updated_at
DROP TRIGGER IF EXISTS handle_public_profiles_updated_at ON public_profiles;
CREATE TRIGGER handle_public_profiles_updated_at
  BEFORE UPDATE ON public_profiles
  FOR EACH ROW
  EXECUTE PROCEDURE handle_updated_at();
