import { supabase } from './supabase';

export type Friend = {
  id: string;
  user_id: string;
  name: string;
  phone: string | null;
  timezone: string;
  city: string | null;
  cadence: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  priority: 'high' | 'medium' | 'low';
  last_called_at: string | null;
  weekday_start: string | null;
  weekday_end: string | null;
  weekend_start: string | null;
  weekend_end: string | null;
  created_at: string;
  updated_at: string;
};

export type ImportantDate = {
  id: string;
  friend_id: string;
  label: string;
  month: number;
  day: number;
  created_at: string;
};

// Friends
export async function getFriends(): Promise<Friend[]> {
  const { data, error } = await supabase
    .from('friends')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getFriend(id: string): Promise<Friend | null> {
  const { data, error } = await supabase
    .from('friends')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function createFriend(friend: Omit<Friend, 'id' | 'user_id' | 'created_at' | 'updated_at'>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('friends')
    .insert([{ ...friend, user_id: user.id }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateFriend(id: string, updates: Partial<Friend>) {
  const { data, error } = await supabase
    .from('friends')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteFriend(id: string) {
  const { error } = await supabase
    .from('friends')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// Important Dates
export async function getImportantDates(friendId: string): Promise<ImportantDate[]> {
  const { data, error } = await supabase
    .from('important_dates')
    .select('*')
    .eq('friend_id', friendId)
    .order('month', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function createImportantDate(date: Omit<ImportantDate, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('important_dates')
    .insert([date])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteImportantDate(id: string) {
  const { error } = await supabase
    .from('important_dates')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// Public Profiles
export type PublicProfile = {
  id: string;
  share_token: string;
  name: string | null;
  timezone: string | null;
  weekday_start: string | null;
  weekday_end: string | null;
  weekend_start: string | null;
  weekend_end: string | null;
  google_calendar_connected: boolean;
  availability_updated_at: string | null;
  created_at: string;
  updated_at: string;
};

export type FriendConnection = {
  id: string;
  user_id: string;
  connected_user_id: string;
  created_at: string;
};

// Get public profile by share token (no auth required - used on public page)
export async function getPublicProfileByToken(shareToken: string): Promise<PublicProfile | null> {
  const { data, error } = await supabase
    .from('public_profiles')
    .select('*')
    .eq('share_token', shareToken)
    .single();
  if (error) return null;
  return data;
}

// Get or create current user's public profile
export async function getOrCreatePublicProfile(): Promise<PublicProfile> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Get user's name from profiles table
  const { data: profile } = await supabase
    .from('profiles')
    .select('name, timezone')
    .eq('id', user.id)
    .single();

  let { data } = await supabase
    .from('public_profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!data) {
    // Create new public profile with user's name and timezone
    const { data: newProfile } = await supabase
      .from('public_profiles')
      .insert([{
        id: user.id,
        name: profile?.name || null,
        timezone: profile?.timezone || null
      }])
      .select()
      .single();
    data = newProfile;
  }

  return data;
}

// Update public profile availability
export async function updatePublicProfile(updates: Partial<PublicProfile>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('public_profiles')
    .update({ ...updates, availability_updated_at: new Date().toISOString() })
    .eq('id', user.id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Create bidirectional connection
export async function createConnection(connectedUserId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Insert both directions (ignore duplicates)
  const { error } = await supabase.from('friend_connections').insert([
    { user_id: user.id, connected_user_id: connectedUserId },
    { user_id: connectedUserId, connected_user_id: user.id }
  ]);

  if (error && !error.message.includes('duplicate')) throw error;
}

// Get user's connections with profile info
export async function getConnections(): Promise<Array<FriendConnection & { connected_profile: PublicProfile }>> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // First get the connections
  const { data: connections, error } = await supabase
    .from('friend_connections')
    .select('*')
    .eq('user_id', user.id);

  if (error) throw error;

  // Then fetch the public profiles for each connected user
  const connectionsWithProfiles = await Promise.all(
    (connections || []).map(async (conn) => {
      const { data: profile } = await supabase
        .from('public_profiles')
        .select('*')
        .eq('id', conn.connected_user_id)
        .single();

      return {
        ...conn,
        connected_profile: profile,
      } as FriendConnection & { connected_profile: PublicProfile };
    })
  );

  return connectionsWithProfiles;
}
