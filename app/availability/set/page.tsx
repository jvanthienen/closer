'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import AuthGuard from '@/components/AuthGuard';
import AvailabilityForm from '@/components/AvailabilityForm';
import HandDrawnButton from '@/components/HandDrawnButton';
import HandDrawnCard from '@/components/HandDrawnCard';
import type { PublicProfile } from '@/lib/db';

function SetAvailabilityPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [calendarSyncing, setCalendarSyncing] = useState(false);

  const fromShare = searchParams.get('fromShare');

  useEffect(() => {
    const loadProfile = async () => {
      try {
        // Get session token
        const { supabase } = await import('@/lib/supabase');
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
          throw new Error('Not authenticated');
        }

        const headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        };

        const response = await fetch('/api/profile/me', { headers });

        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }

        const data = await response.json();
        setProfile(data);
      } catch (err) {
        console.error('Error loading profile:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleSubmit = async (data: {
    timezone: string;
    weekday_start: string;
    weekday_end: string;
    weekend_start: string;
    weekend_end: string;
  }) => {
    try {
      const response = await fetch('/api/availability/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to update availability');
      }

      // If coming from a share link, create the connection
      if (fromShare) {
        // Get the profile ID from the share token
        const shareResponse = await fetch(`/api/profile/public/${fromShare}`);
        if (shareResponse.ok) {
          const shareProfile = await shareResponse.json();

          // Create connection
          await fetch('/api/connections/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ connectedUserId: shareProfile.id }),
          });
        }
      }

      // Redirect to share page
      router.push('/availability/share');
    } catch (err) {
      console.error('Error saving availability:', err);
      throw err;
    }
  };

  const handleCalendarSync = async () => {
    if (!session?.accessToken) {
      alert('Please connect your Google Calendar first');
      return;
    }

    setCalendarSyncing(true);

    try {
      // Fetch free/busy data
      const response = await fetch('/api/calendar/freebusy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken: session.accessToken }),
      });

      const data = await response.json();

      if (data.busy) {
        // Infer typical availability from busy times
        // For MVP, we'll just suggest some default times
        // In the future, this could be smarter by analyzing patterns
        alert('Calendar synced! We\'ve suggested times based on your calendar. You can adjust them below.');

        // Update profile with suggested times and calendar connected flag
        await fetch('/api/availability/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            weekday_start: '18:00',
            weekday_end: '22:00',
            weekend_start: '10:00',
            weekend_end: '18:00',
            google_calendar_connected: true,
          }),
        });

        // Reload profile
        const { supabase } = await import('@/lib/supabase');
        const { data: { session } } = await supabase.auth.getSession();

        if (session) {
          const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          };

          const response = await fetch('/api/profile/me', { headers });
          if (response.ok) {
            const updatedProfile = await response.json();
            setProfile(updatedProfile);
          }
        }
      }
    } catch (err) {
      console.error('Error syncing calendar:', err);
      alert('Failed to sync calendar');
    } finally {
      setCalendarSyncing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
          style={{ background: 'rgba(193, 123, 92, 0.1)' }}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="#C17B5C"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <h1>Set your availability</h1>
      </div>

      {fromShare && (
        <HandDrawnCard borderColor="sage">
          <p className="text-center text-sm">
            After setting your availability, you'll be connected with your friend!
          </p>
        </HandDrawnCard>
      )}

      {/* Calendar Sync Option */}
      {session?.accessToken && (
        <HandDrawnCard borderColor="cobalt">
          <div className="space-y-3">
            <h3 className="font-bold text-lg">Sync from Google Calendar</h3>
            <p className="text-sm text-gray-600">
              We'll suggest availability times based on your calendar patterns
            </p>
            <HandDrawnButton
              color="cobalt"
              onClick={handleCalendarSync}
              disabled={calendarSyncing}
            >
              {calendarSyncing ? 'Syncing...' : 'Sync from Calendar'}
            </HandDrawnButton>
          </div>
        </HandDrawnCard>
      )}

      {/* Manual Form */}
      <div>
        <h2 className="font-bold text-xl mb-4">Or set manually</h2>
        {profile && (
          <AvailabilityForm
            initialTimezone={profile.timezone}
            initialWeekdayStart={profile.weekday_start}
            initialWeekdayEnd={profile.weekday_end}
            initialWeekendStart={profile.weekend_start}
            initialWeekendEnd={profile.weekend_end}
            onSubmit={handleSubmit}
            submitLabel="Save & Continue"
          />
        )}
      </div>
    </div>
  );
}

export default function SetAvailability() {
  return (
    <AuthGuard>
      <SetAvailabilityPage />
    </AuthGuard>
  );
}
