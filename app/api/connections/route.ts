import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export async function GET(request: Request) {
  try {
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
        };
      })
    );

    return NextResponse.json(connectionsWithProfiles);
  } catch (error: any) {
    console.error('Error fetching connections:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch connections' },
      { status: 500 }
    );
  }
}
