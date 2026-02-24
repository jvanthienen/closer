import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { timezone, weekday_start, weekday_end, weekend_start, weekend_end, google_calendar_connected } = body;

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false },
    });

    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Upsert public profile (create if doesn't exist, update if it does)
    const { data: profile, error } = await supabase
      .from('public_profiles')
      .upsert({
        id: user.id,
        timezone,
        weekday_start,
        weekday_end,
        weekend_start,
        weekend_end,
        google_calendar_connected,
        availability_updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, profile });
  } catch (error: any) {
    console.error('Error updating availability:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update availability' },
      { status: 500 }
    );
  }
}
