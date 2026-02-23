"use client";

import { useState, useEffect } from 'react';
import { useSession, signOut, signIn } from 'next-auth/react';
import AuthGuard from "@/components/AuthGuard";
import { useAuth } from "@/lib/auth-context";
import { getFriends, getImportantDates, updateFriend, type Friend, type ImportantDate } from '@/lib/db';
import RoughBorder from '@/components/RoughBorder';

interface BusyTime {
  start: string;
  end: string;
}

interface FreeSlot {
  start: Date;
  end: Date;
  duration: number; // in minutes
}

interface UpcomingDate {
  friend: Friend;
  date: ImportantDate;
  daysUntil: number;
  dateThisYear: Date;
}

interface BestCallTime {
  yourTime: Date;
  theirTime: Date;
  reason: string;
}

interface FriendWithBestTime extends Friend {
  currentLocalTime: string;
  bestCallTime: BestCallTime | null;
}

// Helper: Get friend's current local time
function getFriendLocalTime(timezone: string): string {
  try {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', {
      timeZone: timezone,
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
    return timeString;
  } catch (err) {
    return 'Unknown';
  }
}

// Helper: Check if a time is within friend's preferred hours
function isWithinPreferredHours(time: Date, friend: Friend, timezone: string): boolean {
  try {
    // Get the hour and day in the friend's timezone
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: 'numeric',
      minute: 'numeric',
      hour12: false,
      weekday: 'short',
    });

    const parts = formatter.formatToParts(time);
    const hourPart = parts.find(p => p.type === 'hour');
    const minutePart = parts.find(p => p.type === 'minute');
    const weekdayPart = parts.find(p => p.type === 'weekday');

    if (!hourPart || !minutePart || !weekdayPart) return true;

    const hour = parseInt(hourPart.value);
    const minutes = parseInt(minutePart.value);
    const timeInMinutes = hour * 60 + minutes;

    const isWeekend = weekdayPart.value === 'Sat' || weekdayPart.value === 'Sun';

    const startTime = isWeekend ? friend.weekend_start : friend.weekday_start;
    const endTime = isWeekend ? friend.weekend_end : friend.weekday_end;

    if (!startTime || !endTime) return true; // No restrictions

    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);

    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    return timeInMinutes >= startMinutes && timeInMinutes <= endMinutes;
  } catch (err) {
    return true; // Default to allowing if error
  }
}

// Helper: Get a date in a specific timezone (for display purposes)
function getDateInTimezone(date: Date, timezone: string): Date {
  // This creates a Date object that represents the same moment in time
  // but will display using the target timezone when formatted
  const timeString = date.toLocaleString('en-US', { timeZone: timezone });
  return new Date(timeString);
}

// Helper: Calculate best call time for a friend (only today/tomorrow)
function calculateBestCallTime(friend: Friend, freeSlots: FreeSlot[]): BestCallTime | null {
  const now = new Date();
  const endOfTomorrow = new Date(now);
  endOfTomorrow.setDate(now.getDate() + 2);
  endOfTomorrow.setHours(0, 0, 0, 0);

  // Find the next free slot that overlaps with friend's preferred hours
  // ONLY consider slots in the next 48 hours (today + tomorrow)
  for (const slot of freeSlots) {
    // Skip past slots
    if (slot.end < now) continue;

    // Skip slots beyond tomorrow
    if (slot.start >= endOfTomorrow) continue;

    // Check if this slot overlaps with friend's preferred hours
    const slotStart = slot.start > now ? slot.start : now;

    if (isWithinPreferredHours(slotStart, friend, friend.timezone)) {
      // Calculate friend's local time for this slot
      const theirTime = getDateInTimezone(slotStart, friend.timezone);

      // Generate reason
      let reason = '';
      const hoursUntil = (slotStart.getTime() - now.getTime()) / (1000 * 60 * 60);

      if (hoursUntil < 1) {
        reason = 'Both free now';
      } else if (slotStart.toDateString() === now.toDateString()) {
        reason = 'Good overlap today';
      } else if (slotStart.toDateString() === new Date(now.getTime() + 86400000).toDateString()) {
        reason = 'Free tomorrow';
      } else {
        // This shouldn't happen due to our endOfTomorrow check above
        continue;
      }

      // Check if overdue
      if (friend.last_called_at) {
        const lastCalled = new Date(friend.last_called_at);
        const daysSinceCall = (now.getTime() - lastCalled.getTime()) / (1000 * 60 * 60 * 24);

        const cadenceDays: Record<string, number> = {
          weekly: 7,
          monthly: 30,
          quarterly: 90,
          yearly: 365,
        };

        const expectedDays = cadenceDays[friend.cadence] || 30;
        if (daysSinceCall > expectedDays) {
          reason = `Overdue • ${reason}`;
        }
      }

      return {
        yourTime: slotStart,
        theirTime,
        reason,
      };
    }
  }

  // No good time found in the next 2 days - return null
  return null;
}

function HomePage() {
  const { user } = useAuth();
  const { data: session } = useSession();
  const [freeSlots, setFreeSlots] = useState<FreeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendsWithTimes, setFriendsWithTimes] = useState<FriendWithBestTime[]>([]);
  const [upcomingDates, setUpcomingDates] = useState<UpcomingDate[]>([]);
  const [loadingFriends, setLoadingFriends] = useState(true);

  // Light Chalk roughness (locked in)
  const roughness = 2;

  // Wine & Coffee color palette
  const colors = {
    coral: '#E05F4F',
    blue: '#3B7CC4',
    orange: '#F5A052',
    navy: '#2C3E5A',
    maroon: '#9B5174',
  };

  // WhatsApp action handlers
  const handleWhatsAppAction = async (friend: Friend, action: 'call' | 'message', e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click

    // Update last_called_at
    try {
      await updateFriend(friend.id, {
        last_called_at: new Date().toISOString(),
      } as any);

      // Reload friends to update the timestamp
      const updatedFriends = await getFriends();
      setFriends(updatedFriends);
    } catch (err) {
      console.error('Failed to update last_called_at:', err);
    }

    // Open WhatsApp
    const phone = friend.phone?.replace(/\D/g, ''); // Remove non-digits
    if (!phone) {
      alert('No phone number set for this friend');
      return;
    }

    const whatsappUrl = action === 'call'
      ? `https://wa.me/${phone}?call=voice`
      : `https://wa.me/${phone}`;

    window.open(whatsappUrl, '_blank');
  };

  const calculateFreeSlots = (busyTimes: BusyTime[]): FreeSlot[] => {
    const now = new Date();
    const endOfWeek = new Date(now);
    endOfWeek.setDate(now.getDate() + 7);

    // Define working hours (9 AM - 9 PM)
    const workStart = 9;
    const workEnd = 21;

    const slots: FreeSlot[] = [];

    // Generate time slots for each day
    for (let d = 0; d < 7; d++) {
      const day = new Date(now);
      day.setDate(now.getDate() + d);
      day.setHours(workStart, 0, 0, 0);

      const dayEnd = new Date(day);
      dayEnd.setHours(workEnd, 0, 0, 0);

      let currentTime = new Date(day);

      // Skip if day is in the past
      if (dayEnd < now) continue;

      // If it's today, start from current time
      if (d === 0 && currentTime < now) {
        currentTime = new Date(now);
        currentTime.setMinutes(Math.ceil(currentTime.getMinutes() / 30) * 30);
      }

      while (currentTime < dayEnd) {
        const slotEnd = new Date(currentTime);
        slotEnd.setMinutes(slotEnd.getMinutes() + 30);

        // Check if this slot overlaps with any busy time
        const isBusy = busyTimes.some(busy => {
          const busyStart = new Date(busy.start);
          const busyEnd = new Date(busy.end);
          return (currentTime < busyEnd && slotEnd > busyStart);
        });

        if (!isBusy && slotEnd <= dayEnd) {
          // Find consecutive free slots
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
          if (duration >= 30) { // Only show slots 30+ minutes
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

    return slots.slice(0, 5); // Return next 5 free slots
  };

  useEffect(() => {
    const fetchFreeSlots = async () => {
      if (!session?.accessToken) return;

      setLoading(true);
      try {
        const response = await fetch('/api/calendar/freebusy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accessToken: session.accessToken }),
        });

        const data = await response.json();
        if (data.busy) {
          const slots = calculateFreeSlots(data.busy);
          setFreeSlots(slots);
        }
      } catch (err) {
        console.error('Failed to fetch free slots:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFreeSlots();
  }, [session?.accessToken]);

  useEffect(() => {
    const loadFriendsAndDates = async () => {
      try {
        const allFriends = await getFriends();
        setFriends(allFriends);

        // Calculate upcoming dates (next 30 days)
        const upcoming: UpcomingDate[] = [];
        const now = new Date();
        const thirtyDaysFromNow = new Date(now);
        thirtyDaysFromNow.setDate(now.getDate() + 30);

        for (const friend of allFriends) {
          const dates = await getImportantDates(friend.id);

          for (const date of dates) {
            // Calculate the date this year
            const dateThisYear = new Date(now.getFullYear(), date.month - 1, date.day);

            // If the date has passed this year, use next year
            if (dateThisYear < now) {
              dateThisYear.setFullYear(now.getFullYear() + 1);
            }

            // Check if it's within the next 30 days
            if (dateThisYear >= now && dateThisYear <= thirtyDaysFromNow) {
              const daysUntil = Math.ceil((dateThisYear.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
              upcoming.push({
                friend,
                date,
                daysUntil,
                dateThisYear,
              });
            }
          }
        }

        // Sort by date
        upcoming.sort((a, b) => a.dateThisYear.getTime() - b.dateThisYear.getTime());
        setUpcomingDates(upcoming);
      } catch (err) {
        console.error('Failed to load friends:', err);
      } finally {
        setLoadingFriends(false);
      }
    };

    loadFriendsAndDates();
  }, []);

  // Calculate local times and best call times when friends or free slots change
  useEffect(() => {
    if (friends.length === 0) return;

    const enrichedFriends: FriendWithBestTime[] = friends.map(friend => ({
      ...friend,
      currentLocalTime: getFriendLocalTime(friend.timezone),
      bestCallTime: freeSlots.length > 0 ? calculateBestCallTime(friend, freeSlots) : null,
    }));

    setFriendsWithTimes(enrichedFriends);

    // Update local times every minute
    const interval = setInterval(() => {
      const updated: FriendWithBestTime[] = friends.map(friend => ({
        ...friend,
        currentLocalTime: getFriendLocalTime(friend.timezone),
        bestCallTime: freeSlots.length > 0 ? calculateBestCallTime(friend, freeSlots) : null,
      }));
      setFriendsWithTimes(updated);
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [friends, freeSlots]);

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

  const formatLastContacted = (lastCalledAt: string | null): string => {
    if (!lastCalledAt) return '';

    const lastCalled = new Date(lastCalledAt);
    const now = new Date();
    const diffMs = now.getTime() - lastCalled.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Last contacted today';
    if (diffDays === 1) return 'Last contacted yesterday';
    if (diffDays < 7) return `Last contacted ${diffDays} days ago`;
    if (diffDays < 30) return `Last contacted ${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `Last contacted ${Math.floor(diffDays / 30)} months ago`;
    return `Last contacted ${Math.floor(diffDays / 365)} years ago`;
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Calendar Connection Card - Always visible */}
      <div className="animate-slide-up">
        <div
          className="relative bg-white p-6"
          style={{
            transform: `rotate(${Math.random() * 1 - 0.5}deg)`,
          }}
        >
          <RoughBorder color={colors.blue} roughness={roughness} />
          <div className="flex items-start gap-4 relative z-10">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{
                background: session?.accessToken ? colors.blue : colors.orange,
                opacity: 0.15,
              }}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke={session?.accessToken ? colors.blue : colors.orange}
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>

            <div className="flex-1 space-y-3">
              <div>
                <h3 className="font-bold" style={{ color: colors.navy }}>
                  {session?.accessToken ? 'Google Calendar Connected' : 'Connect your calendar'}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {session?.accessToken
                    ? "We'll automatically avoid suggesting calls during your busy times"
                    : "See when you're free and get smart call suggestions"}
                </p>
              </div>

              {!session?.accessToken ? (
                <button
                  onClick={() => signIn('google')}
                  className="relative px-5 py-2.5 bg-transparent font-bold text-sm transition-all hover:scale-105"
                  style={{ color: colors.blue }}
                >
                  <RoughBorder color={colors.blue} roughness={roughness} />
                  <span className="relative z-10">Connect Google Calendar</span>
                </button>
              ) : (
                <button
                  onClick={() => signOut()}
                  className="relative px-5 py-2.5 bg-transparent font-bold text-sm transition-all hover:scale-105"
                  style={{ color: colors.coral }}
                >
                  <RoughBorder color={colors.coral} roughness={roughness} />
                  <span className="relative z-10">Disconnect Calendar</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Free Time Section */}
      {session?.accessToken && freeSlots.length > 0 && (
        <div className="space-y-4 animate-slide-up">
          <h2
            className="text-lg font-bold"
            style={{
              color: colors.navy,
              transform: `rotate(${Math.random() * 1 - 0.5}deg)`,
              display: 'inline-block',
            }}
          >
            Your free time
          </h2>

          <div className="space-y-3">
            {freeSlots.map((slot, idx) => {
              const { dayLabel, timeRange } = formatTimeSlot(slot);
              return (
                <div
                  key={idx}
                  className="relative bg-white p-4 transition-all hover:scale-[1.02]"
                  style={{
                    transform: `rotate(${Math.random() * 0.5 - 0.25}deg)`,
                  }}
                >
                  <RoughBorder color={colors.orange} roughness={roughness} />
                  <div className="flex items-center justify-between relative z-10">
                    <div>
                      <p className="font-bold" style={{ color: colors.navy }}>
                        {dayLabel}
                      </p>
                      <p className="text-sm text-gray-600">
                        {timeRange}
                      </p>
                    </div>
                    <div
                      className="px-3 py-1 text-xs font-bold"
                      style={{
                        color: colors.orange,
                      }}
                    >
                      {Math.floor(slot.duration / 60)}h {slot.duration % 60}m
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="relative">
        <h1
          style={{
            color: colors.maroon,
            transform: `rotate(${Math.random() * 1.5 - 0.75}deg)`,
            display: 'inline-block',
          }}
        >
          Best this week
        </h1>
      </div>

      {/* Friends list or empty state */}
      {loadingFriends ? (
        <div className="flex items-center justify-center py-12">
          <div
            className="text-lg font-bold animate-pulse"
            style={{ color: colors.blue }}
          >
            Loading...
          </div>
        </div>
      ) : friends.length === 0 || friendsWithTimes.filter(f => f.bestCallTime !== null).length === 0 ? (
        /* Empty state card */
        <div
          className="relative bg-white p-8 animate-slide-up"
          style={{
            animationDelay: '0.1s',
            transform: `rotate(${Math.random() * 1 - 0.5}deg)`,
          }}
        >
          <RoughBorder color={colors.maroon} roughness={roughness} />

          {/* Content */}
          <div className="relative space-y-6 z-10">
            {/* Text */}
            <div className="space-y-3">
              <p
                className="text-lg leading-relaxed font-bold"
                style={{ color: colors.navy }}
              >
                {friends.length === 0 ? (
                  <>
                    Add someone you miss.
                    <br />
                    We'll find the gentle overlap.
                  </>
                ) : (
                  <>
                    No good call times today or tomorrow.
                    <br />
                    Check back later for suggestions.
                  </>
                )}
              </p>

              <p className="text-sm text-gray-600">
                {friends.length === 0
                  ? 'No calls scheduled yet'
                  : 'Adjust friend availability or check back later'
                }
              </p>
            </div>

            {/* CTA */}
            {friends.length === 0 && (
              <button
                onClick={() => (window.location.href = '/friends/add')}
                className="relative px-6 py-3 bg-transparent font-bold text-sm transition-all hover:scale-105 active:scale-95"
                style={{ color: colors.coral }}
              >
                <RoughBorder color={colors.coral} roughness={roughness} />
                <span className="relative z-10">Add your first friend</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Friends cards - only show friends with good times today/tomorrow */
        <div className="space-y-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          {friendsWithTimes
            .filter(friend => friend.bestCallTime !== null)
            .slice(0, 5)
            .map((friend, idx) => {
              // Rotate through the 5 colors
              const colorKeys = ['coral', 'blue', 'orange', 'navy', 'maroon'] as const;
              const borderColor = colors[colorKeys[idx % colorKeys.length]];

              return (
                <div
                  key={friend.id}
                  onClick={() => (window.location.href = `/friends/${friend.id}`)}
                  className="relative bg-white p-5 transition-all duration-300 hover:scale-[1.01] cursor-pointer"
                  style={{
                    transform: `rotate(${Math.random() * 0.8 - 0.4}deg)`,
                  }}
                >
                  <RoughBorder color={borderColor} roughness={roughness} />

                  {/* Friend header */}
                  <div className="flex items-start justify-between mb-3 relative z-10">
                    <div className="flex-1">
                      <p className="font-bold text-lg mb-1" style={{ color: borderColor }}>
                        {friend.name}
                      </p>
                      <div className="space-y-0.5">
                        <p className="text-sm text-gray-600">
                          {friend.city || 'No city set'} • Their time: {friend.currentLocalTime}
                        </p>
                        {friend.last_called_at && (
                          <p className="text-xs text-gray-500">
                            {formatLastContacted(friend.last_called_at)}
                          </p>
                        )}
                      </div>
                    </div>
                    <div
                      className="px-3 py-1 text-xs font-bold"
                      style={{
                        color: borderColor,
                      }}
                    >
                      {friend.cadence}
                    </div>
                  </div>

                  {/* Best call time */}
                  {friend.bestCallTime && (
                    <div className="p-3 space-y-2 mb-3 relative z-10" style={{ background: '#F5F5F5' }}>
                      {/* Reason */}
                      <div className="flex items-center gap-2">
                        <div
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ background: borderColor }}
                        />
                        <p className="text-xs font-bold" style={{ color: borderColor }}>
                          {friend.bestCallTime.reason}
                        </p>
                      </div>

                      {/* Times */}
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex-1">
                          <p className="text-xs text-gray-500">Your time</p>
                          <p className="font-bold" style={{ color: colors.navy }}>
                            {friend.bestCallTime.yourTime.toLocaleTimeString('en-US', {
                              hour: 'numeric',
                              minute: '2-digit',
                              hour12: true,
                            })}
                          </p>
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-gray-500">Their time</p>
                          <p className="font-bold" style={{ color: colors.navy }}>
                            {friend.bestCallTime.theirTime.toLocaleTimeString('en-US', {
                              hour: 'numeric',
                              minute: '2-digit',
                              hour12: true,
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* WhatsApp actions */}
                  {friend.phone && (
                    <div className="flex items-center gap-2 relative z-10">
                      <button
                        onClick={(e) => handleWhatsAppAction(friend, 'call', e)}
                        className="flex-1 px-4 py-2.5 font-bold text-sm transition-all duration-200 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
                        style={{
                          background: '#25D366',
                          color: 'white',
                        }}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        Call
                      </button>
                      <button
                        onClick={(e) => handleWhatsAppAction(friend, 'message', e)}
                        className="relative flex-1 px-4 py-2.5 bg-transparent font-bold text-sm transition-all duration-200 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
                        style={{
                          color: '#128C7E',
                        }}
                      >
                        <RoughBorder color="#128C7E" roughness={roughness} />
                        <svg className="w-4 h-4 relative z-10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <span className="relative z-10">Message</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      )}

      {/* Upcoming section */}
      <div
        className="animate-slide-up"
        style={{ animationDelay: '0.2s' }}
      >
        <h2
          className="text-lg mb-4 font-bold"
          style={{
            color: colors.navy,
            transform: `rotate(${Math.random() * 1 - 0.5}deg)`,
            display: 'inline-block',
          }}
        >
          Upcoming
        </h2>

        {loadingFriends ? (
          <div className="relative bg-white p-6">
            <RoughBorder color={colors.blue} roughness={roughness} />
            <div className="flex items-center justify-center py-4 relative z-10">
              <div className="text-lg font-bold animate-pulse" style={{ color: colors.blue }}>
                Loading...
              </div>
            </div>
          </div>
        ) : upcomingDates.length === 0 ? (
          <div className="relative bg-white p-6" style={{ transform: `rotate(${Math.random() * 0.5 - 0.25}deg)` }}>
            <RoughBorder color={colors.navy} roughness={roughness} />
            <p className="text-sm text-center text-gray-500 relative z-10">
              No important dates in the next 30 days
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingDates.map((item, idx) => {
              // Rotate through colors for upcoming dates too
              const colorKeys = ['coral', 'blue', 'orange', 'navy', 'maroon'] as const;
              const borderColor = colors[colorKeys[idx % colorKeys.length]];

              return (
                <div
                  key={idx}
                  className="relative bg-white p-4 transition-all duration-300 hover:scale-[1.02]"
                  style={{
                    transform: `rotate(${Math.random() * 0.5 - 0.25}deg)`,
                  }}
                >
                  <RoughBorder color={borderColor} roughness={roughness} />
                  <div className="flex items-center justify-between relative z-10">
                    <div>
                      <p className="font-bold" style={{ color: borderColor }}>
                        {item.friend.name} • {item.date.label}
                      </p>
                      <p className="text-sm text-gray-600">
                        {item.dateThisYear.toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: item.dateThisYear.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
                        })}
                      </p>
                    </div>
                    <div
                      className="px-3 py-1 text-xs font-bold"
                      style={{
                        color: borderColor,
                      }}
                    >
                      {item.daysUntil === 0 ? 'Today' : item.daysUntil === 1 ? 'Tomorrow' : `${item.daysUntil} days`}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <AuthGuard>
      <HomePage />
    </AuthGuard>
  );
}
