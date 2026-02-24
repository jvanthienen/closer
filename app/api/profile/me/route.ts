import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export async function GET(request: Request) {
  try {
    // Get the session from cookies
    const cookieStore = await cookies();
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
      },
    });

    // Get user from request
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Get or create public profile
    let { data: profile } = await supabase
      .from('public_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!profile) {
      // Get user's name from profiles table
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('name, timezone')
        .eq('id', user.id)
        .single();

      console.log('Creating new public profile for user:', user.id);

      // Create new public profile
      const { data: newProfile, error: insertError } = await supabase
        .from('public_profiles')
        .insert([{
          id: user.id,
          name: userProfile?.name || null,
          timezone: userProfile?.timezone || null,
        }])
        .select()
        .single();

      if (insertError) {
        console.error('Error creating public profile:', insertError);
        throw new Error(`Failed to create public profile: ${insertError.message}`);
      }

      profile = newProfile;
    }

    if (!profile) {
      throw new Error('Profile is null after creation attempt');
    }

    return NextResponse.json(profile);
  } catch (error: any) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}
