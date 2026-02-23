"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signIn, signOut } from 'next-auth/react';
import AuthGuard from "@/components/AuthGuard";

function AvailabilityPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [busyTimes, setBusyTimes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const connected = status === 'authenticated' && session?.accessToken;

  const fetchBusyTimes = async () => {
    if (!session?.accessToken) return;

    setLoading(true);
    try {
      const response = await fetch('/api/calendar/freebusy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accessToken: session.accessToken,
        }),
      });

      const data = await response.json();
      if (data.busy) {
        setBusyTimes(data.busy);
      }
    } catch (err) {
      console.error('Failed to fetch busy times:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (connected) {
      fetchBusyTimes();
      // Redirect to home after successful connection
      const timer = setTimeout(() => {
        router.push('/');
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [connected, router]);

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
          style={{
            background: 'rgba(193, 123, 92, 0.1)',
          }}
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

        <h1>Your availability</h1>
      </div>

      {/* Google Calendar Connection */}
      <div
        className="rounded-[24px] p-6 backdrop-blur-md border space-y-4"
        style={{
          background: 'rgba(255, 252, 249, 0.65)',
          borderColor: 'rgba(255, 255, 255, 0.5)',
          boxShadow: '0 8px 32px rgba(139, 98, 74, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
        }}
      >
        <div className="flex items-start gap-4">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{
              background: connected
                ? 'linear-gradient(135deg, rgba(46, 125, 50, 0.15) 0%, rgba(46, 125, 50, 0.1) 100%)'
                : 'linear-gradient(135deg, rgba(232, 146, 100, 0.15) 0%, rgba(193, 123, 92, 0.1) 100%)',
            }}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke={connected ? "#2E7D32" : "#C17B5C"}
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

          <div className="flex-1 space-y-2">
            <h3 className="font-sans">Google Calendar</h3>
            <p className="text-sm font-sans opacity-70" style={{ color: '#7A6F65' }}>
              {connected
                ? "We'll automatically avoid suggesting calls during your busy times."
                : "Connect your calendar to automatically sync your availability."}
            </p>
          </div>
        </div>

        {!connected ? (
          <button
            onClick={() => signIn('google')}
            className="w-full px-6 py-3 rounded-full font-sans font-medium text-sm transition-all duration-300 hover:scale-[1.02]"
            style={{
              background: 'linear-gradient(135deg, #E89264 0%, #C17B5C 100%)',
              color: '#FFFCF9',
              boxShadow: '0 4px 16px rgba(232, 146, 100, 0.3)',
            }}
          >
            Connect Google Calendar
          </button>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={fetchBusyTimes}
              disabled={loading}
              className="flex-1 px-6 py-3 rounded-full font-sans font-medium text-sm transition-all duration-300 hover:scale-[1.02]"
              style={{
                background: loading
                  ? 'rgba(193, 123, 92, 0.3)'
                  : 'rgba(46, 125, 50, 0.15)',
                color: '#2E7D32',
                border: '1px solid rgba(46, 125, 50, 0.2)',
              }}
            >
              {loading ? 'Syncing...' : 'Refresh'}
            </button>
            <button
              onClick={() => signOut()}
              className="px-6 py-3 rounded-full font-sans font-medium text-sm transition-all duration-300 hover:scale-[1.02]"
              style={{
                background: 'rgba(179, 38, 30, 0.1)',
                color: '#B3261E',
                border: '1px solid rgba(179, 38, 30, 0.2)',
              }}
            >
              Disconnect
            </button>
          </div>
        )}
      </div>

      {/* Busy Times Display */}
      {connected && busyTimes.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-sans" style={{ color: '#5C4A3E' }}>
            Busy times from calendar
          </h3>

          {busyTimes.slice(0, 10).map((busy, idx) => (
            <div
              key={idx}
              className="rounded-[20px] p-4 backdrop-blur-md border"
              style={{
                background: 'rgba(255, 252, 249, 0.5)',
                borderColor: 'rgba(255, 255, 255, 0.4)',
              }}
            >
              <p className="text-sm font-sans" style={{ color: '#5C4A3E' }}>
                {new Date(busy.start).toLocaleString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                })}{' '}
                -{' '}
                {new Date(busy.end).toLocaleString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </p>
            </div>
          ))}

          {busyTimes.length > 10 && (
            <p className="text-sm font-sans text-center opacity-60" style={{ color: '#8B624A' }}>
              + {busyTimes.length - 10} more events
            </p>
          )}
        </div>
      )}

      {connected && busyTimes.length === 0 && !loading && (
        <div
          className="rounded-[24px] p-8 backdrop-blur-md border text-center"
          style={{
            background: 'rgba(255, 252, 249, 0.5)',
            borderColor: 'rgba(255, 255, 255, 0.4)',
          }}
        >
          <p className="text-sm font-sans opacity-60" style={{ color: '#8B624A' }}>
            No busy times found in your calendar for the next week.
          </p>
        </div>
      )}
    </div>
  );
}

export default function Availability() {
  return (
    <AuthGuard>
      <AvailabilityPage />
    </AuthGuard>
  );
}
