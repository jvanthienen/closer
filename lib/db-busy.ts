import { supabase } from './supabase';

export type BusyBlock = {
  id: string;
  user_id: string;
  day: string; // YYYY-MM-DD format
  start_time: string; // HH:MM format
  end_time: string; // HH:MM format
  created_at: string;
};

export async function getBusyBlocks(): Promise<BusyBlock[]> {
  const { data, error } = await supabase
    .from('busy_blocks')
    .select('*')
    .order('day', { ascending: true })
    .order('start_time', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function createBusyBlock(block: { day: string; start_time: string; end_time: string }) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('busy_blocks')
    .insert([{ ...block, user_id: user.id }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteBusyBlock(id: string) {
  const { error } = await supabase
    .from('busy_blocks')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// Helper to create weekday template
export async function createWeekdayTemplate(startTime: string, endTime: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const today = new Date();
  const blocks = [];

  // Get next 7 days of weekdays
  for (let i = 0; i < 14; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    const dayOfWeek = date.getDay();

    // Skip weekends (0 = Sunday, 6 = Saturday)
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      blocks.push({
        user_id: user.id,
        day: date.toISOString().split('T')[0],
        start_time: startTime,
        end_time: endTime,
      });
    }
  }

  const { error } = await supabase
    .from('busy_blocks')
    .insert(blocks);

  if (error) throw error;
}
