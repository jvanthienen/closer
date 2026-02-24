'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import AuthGuard from '@/components/AuthGuard';
import ShareLinkCard from '@/components/ShareLinkCard';
import AvailabilityDisplay from '@/components/AvailabilityDisplay';
import ConnectionsList from '@/components/ConnectionsList';
import HandDrawnButton from '@/components/HandDrawnButton';
import WeeklyAvailability from '@/components/WeeklyAvailability';
import type { PublicProfile, FriendConnection } from '@/lib/db';

interface FreeSlot {
  start: Date;
  end: Date;
  duration: number;
}

function ShareAvailabilityPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [connections, setConnections] = useState<Array<FriendConnection & { connected_profile: PublicProfile }>>([]);
  const [freeSlots, setFreeSlots] = useState<FreeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingCalendar, setLoadingCalendar] = useState(false);

  const hasCalendar = session?.accessToken;

  useEffect(() => {
    const loadData = async () => {
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

        // Fetch profile and connections from API
        const [profileRes, connectionsRes] = await Promise.all([
          fetch('/api/profile/me', { headers }),
          fetch('/api/connections', { headers }),
        ]);

        if (!profileRes.ok || !connectionsRes.ok) {
          throw new Error('Failed to fetch data');
        }

        const [profileData, connectionsData] = await Promise.all([
          profileRes.json(),
          connectionsRes.json(),
        ]);

        setProfile(profileData);
        setConnections(connectionsData);
      } catch (err) {
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Fetch calendar free slots
  useEffect(() => {
    const fetchFreeSlots = async () => {
      if (!session?.accessToken) {
        console.log('No access token available');
        return;
      }

      console.log('Fetching calendar with session:', { hasToken: !!session.accessToken });
      setLoadingCalendar(true);
      try {
        const response = await fetch('/api/calendar/freebusy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accessToken: session.accessToken }),
        });

        const data = await response.json();
        console.log('Calendar API response:', { ok: response.ok, hasBusy: !!data.busy, error: data.error });

        if (data.busy) {
          const slots = calculateFreeSlots(data.busy);
          console.log('Calculated free slots:', slots.length);
          setFreeSlots(slots);

          // Auto-save to public profile if not already saved
          if (profile && !profile.weekday_start) {
            await autoSaveAvailability(slots);
          }
        } else if (data.error) {
          console.error('Calendar API error:', data.error);
        }
      } catch (err) {
        console.error('Failed to fetch free slots:', err);
      } finally {
        setLoadingCalendar(false);
      }
    };

    fetchFreeSlots();
  }, [session?.accessToken]);

  const calculateFreeSlots = (busyTimes: { start: string; end: string }[]): FreeSlot[] => {
    const now = new Date();
    const endOfWeek = new Date(now);
    endOfWeek.setDate(now.getDate() + 7);

    const workStart = 9;
    const workEnd = 21;
    const slots: FreeSlot[] = [];

    for (let d = 0; d < 7; d++) {
      const day = new Date(now);
      day.setDate(now.getDate() + d);
      day.setHours(workStart, 0, 0, 0);

      const dayEnd = new Date(day);
      dayEnd.setHours(workEnd, 0, 0, 0);

      let currentTime = new Date(day);

      if (dayEnd < now) continue;

      if (d === 0 && currentTime < now) {
        currentTime = new Date(now);
        currentTime.setMinutes(Math.ceil(currentTime.getMinutes() / 30) * 30);
      }

      while (currentTime < dayEnd) {
        const slotEnd = new Date(currentTime);
        slotEnd.setMinutes(slotEnd.getMinutes() + 30);

        const isBusy = busyTimes.some(busy => {
          const busyStart = new Date(busy.start);
          const busyEnd = new Date(busy.end);
          return (currentTime < busyEnd && slotEnd > busyStart);
        });

        if (!isBusy && slotEnd <= dayEnd) {
          let freeEnd = new Date(slotEnd);
          while (freeEnd < dayEnd) {
            const nextSlot = new Date(freeEnd);
            nextSlot.setMinutes(nextSlot.getMinutes() + 30);

            const isNextBusy = busyTimes.some(busy => {
              const busyStart = new Date(busy.start);
              const busyEnd = new Date(busy.end);
              return (freeEnd < busyEnd && nextSlot > busyStart);
            });

            if (isNextBusy) break;
            freeEnd = nextSlot;
          }

          const duration = (freeEnd.getTime() - currentTime.getTime()) / (1000 * 60);
          if (duration >= 30) {
            slots.push({
              start: new Date(currentTime),
              end: freeEnd,
              duration,
            });
          }
          currentTime = freeEnd;
        } else {
          currentTime.setMinutes(currentTime.getMinutes() + 30);
        }
      }
    }

    return slots;
  };

  const formatTimeSlot = (slot: FreeSlot) => {
    const isToday = new Date().toDateString() === slot.start.toDateString();
    const isTomorrow = new Date(Date.now() + 86400000).toDateString() === slot.start.toDateString();

    let dayLabel = '';
    if (isToday) dayLabel = 'Today';
    else if (isTomorrow) dayLabel = 'Tomorrow';
    else dayLabel = slot.start.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

    const timeRange = `${slot.start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} - ${slot.end.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;

    return { dayLabel, timeRange };
  };

  // Auto-save typical availability from calendar
  const autoSaveAvailability = async (slots: FreeSlot[]) => {
    try {
      // Calculate typical weekday and weekend hours from slots
      const weekdaySlots = slots.filter(s => {
        const day = s.start.getDay();
        return day >= 1 && day <= 5; // Mon-Fri
      });

      const weekendSlots = slots.filter(s => {
        const day = s.start.getDay();
        return day === 0 || day === 6; // Sat-Sun
      });

      // Find earliest start and latest end for each
      const getTypicalHours = (slotList: FreeSlot[]) => {
        if (slotList.length === 0) return null;

        const starts = slotList.map(s => s.start.getHours() * 60 + s.start.getMinutes());
        const ends = slotList.map(s => s.end.getHours() * 60 + s.end.getMinutes());

        const avgStart = Math.floor(starts.reduce((a, b) => a + b, 0) / starts.length);
        const avgEnd = Math.floor(ends.reduce((a, b) => a + b, 0) / ends.length);

        const formatTime = (mins: number) => {
          const h = Math.floor(mins / 60);
          const m = mins % 60;
          return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`;
        };

        return {
          start: formatTime(avgStart),
          end: formatTime(avgEnd)
        };
      };

      const weekdayHours = getTypicalHours(weekdaySlots);
      const weekendHours = getTypicalHours(weekendSlots);

      // Get session token
      const { supabase } = await import('@/lib/supabase');
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        const headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        };

        await fetch('/api/availability/update', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            weekday_start: weekdayHours?.start || '09:00:00',
            weekday_end: weekdayHours?.end || '17:00:00',
            weekend_start: weekendHours?.start || '10:00:00',
            weekend_end: weekendHours?.end || '18:00:00',
            google_calendar_connected: true,
          }),
        });

        console.log('Auto-saved availability from calendar');

        // Reload profile to show updated data
        const profileResponse = await fetch('/api/profile/me', { headers });
        if (profileResponse.ok) {
          const updatedProfile = await profileResponse.json();
          setProfile(updatedProfile);
        }

        alert('✅ Your calendar availability has been saved to your share link!');
      }
    } catch (err) {
      console.error('Failed to auto-save availability:', err);
      alert('Failed to save availability. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <p>Failed to load profile</p>
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

        <h1>Share your availability</h1>
      </div>

      {/* Share Link Card */}
      <ShareLinkCard shareToken={profile.share_token} />

      {/* Current Availability Preview */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-lg">
            {hasCalendar ? 'Your Free Time This Week' : 'Your Availability'}
          </h2>
          <div className="flex gap-2">
            {(() => {
              console.log('Button debug:', {
                hasCalendar,
                freeSlotsLength: freeSlots.length,
                weekdayStart: profile?.weekday_start,
                shouldShow: hasCalendar && freeSlots.length > 0 && !profile?.weekday_start
              });
              return null;
            })()}
            {hasCalendar && freeSlots.length > 0 && !profile?.weekday_start && (
              <HandDrawnButton
                color="tomato"
                onClick={() => autoSaveAvailability(freeSlots)}
              >
                💾 Save to Share Link
              </HandDrawnButton>
            )}
            <HandDrawnButton
              color="sage"
              variant="outline"
              onClick={() => router.push('/availability/set')}
            >
              Edit Times
            </HandDrawnButton>
          </div>
        </div>

        {hasCalendar && freeSlots.length > 0 ? (
          <WeeklyAvailability freeSlots={freeSlots} />
        ) : loadingCalendar ? (
          <div className="text-center py-8 text-gray-500">
            Loading calendar...
          </div>
        ) : (
          <AvailabilityDisplay
            timezone={profile.timezone}
            weekdayStart={profile.weekday_start}
            weekdayEnd={profile.weekday_end}
            weekendStart={profile.weekend_start}
            weekendEnd={profile.weekend_end}
            updatedAt={profile.availability_updated_at}
          />
        )}
      </div>

      {/* Connected Friends */}
      <div className="space-y-3">
        <h2 className="font-bold text-lg">Connected Friends</h2>
        <ConnectionsList
          connections={connections}
          onConnectionClick={(conn) => {
            // Could navigate to a detailed view in the future
            console.log('Clicked connection:', conn);
          }}
        />
      </div>
    </div>
  );
}

export default function ShareAvailability() {
  return (
    <AuthGuard>
      <ShareAvailabilityPage />
    </AuthGuard>
  );
}
