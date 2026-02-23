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
