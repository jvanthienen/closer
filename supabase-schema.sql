-- Supabase Schema for Closer MVP
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users table (handled by Supabase Auth automatically)
-- We'll just extend it with a profiles table

-- Profiles table
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  name text,
  timezone text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Friends/Connections table
create table friends (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  name text not null,
  phone text,
  timezone text not null,
  city text,
  cadence text not null default 'monthly', -- weekly, monthly, quarterly, yearly
  priority text not null default 'medium', -- high, medium, low
  last_called_at timestamp with time zone,

  -- Preferred call hours
  weekday_start time,
  weekday_end time,
  weekend_start time,
  weekend_end time,

  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Important dates table (birthdays)
create table important_dates (
  id uuid default uuid_generate_v4() primary key,
  friend_id uuid references friends(id) on delete cascade not null,
  label text not null, -- "Birthday", "Kid: Emma", etc.
  month int not null check (month >= 1 and month <= 12),
  day int not null check (day >= 1 and day <= 31),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Busy blocks table
create table busy_blocks (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  day date not null,
  start_time time not null,
  end_time time not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Call logs table
create table call_logs (
  id uuid default uuid_generate_v4() primary key,
  friend_id uuid references friends(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  called_at timestamp with time zone default timezone('utc'::text, now()) not null,
  note text
);

-- Row Level Security (RLS) Policies
-- Enable RLS on all tables
alter table profiles enable row level security;
alter table friends enable row level security;
alter table important_dates enable row level security;
alter table busy_blocks enable row level security;
alter table call_logs enable row level security;

-- Profiles policies
create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on profiles for insert
  with check (auth.uid() = id);

-- Friends policies
create policy "Users can view own friends"
  on friends for select
  using (auth.uid() = user_id);

create policy "Users can insert own friends"
  on friends for insert
  with check (auth.uid() = user_id);

create policy "Users can update own friends"
  on friends for update
  using (auth.uid() = user_id);

create policy "Users can delete own friends"
  on friends for delete
  using (auth.uid() = user_id);

-- Important dates policies (through friends)
create policy "Users can view dates for their friends"
  on important_dates for select
  using (
    exists (
      select 1 from friends
      where friends.id = important_dates.friend_id
      and friends.user_id = auth.uid()
    )
  );

create policy "Users can insert dates for their friends"
  on important_dates for insert
  with check (
    exists (
      select 1 from friends
      where friends.id = important_dates.friend_id
      and friends.user_id = auth.uid()
    )
  );

create policy "Users can update dates for their friends"
  on important_dates for update
  using (
    exists (
      select 1 from friends
      where friends.id = important_dates.friend_id
      and friends.user_id = auth.uid()
    )
  );

create policy "Users can delete dates for their friends"
  on important_dates for delete
  using (
    exists (
      select 1 from friends
      where friends.id = important_dates.friend_id
      and friends.user_id = auth.uid()
    )
  );

-- Busy blocks policies
create policy "Users can view own busy blocks"
  on busy_blocks for select
  using (auth.uid() = user_id);

create policy "Users can insert own busy blocks"
  on busy_blocks for insert
  with check (auth.uid() = user_id);

create policy "Users can update own busy blocks"
  on busy_blocks for update
  using (auth.uid() = user_id);

create policy "Users can delete own busy blocks"
  on busy_blocks for delete
  using (auth.uid() = user_id);

-- Call logs policies
create policy "Users can view own call logs"
  on call_logs for select
  using (auth.uid() = user_id);

create policy "Users can insert own call logs"
  on call_logs for insert
  with check (auth.uid() = user_id);

-- Functions for updated_at timestamps
create or replace function handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Triggers for updated_at
create trigger handle_profiles_updated_at
  before update on profiles
  for each row
  execute procedure handle_updated_at();

create trigger handle_friends_updated_at
  before update on friends
  for each row
  execute procedure handle_updated_at();

-- Create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name)
  values (new.id, new.email, new.raw_user_meta_data->>'name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Public Profiles table (for shared availability)
create table public_profiles (
  id uuid references profiles(id) on delete cascade primary key,
  share_token text unique not null default encode(gen_random_bytes(16), 'hex'),
  name text,
  timezone text,
  weekday_start time,
  weekday_end time,
  weekend_start time,
  weekend_end time,
  google_calendar_connected boolean default false,
  availability_updated_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Friend Connections table (bidirectional friend relationships)
create table friend_connections (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  connected_user_id uuid references profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, connected_user_id)
);

-- RLS for public_profiles
alter table public_profiles enable row level security;

create policy "Public profiles are viewable by share token"
  on public_profiles for select
  using (true);

create policy "Users can manage own public profile"
  on public_profiles for all
  using (auth.uid() = id);

-- RLS for friend_connections
alter table friend_connections enable row level security;

create policy "Users can view connections where they're involved"
  on friend_connections for select
  using (auth.uid() = user_id or auth.uid() = connected_user_id);

create policy "Users can create own connections"
  on friend_connections for insert
  with check (auth.uid() = user_id);

-- Trigger for public_profiles updated_at
create trigger handle_public_profiles_updated_at
  before update on public_profiles
  for each row
  execute procedure handle_updated_at();
