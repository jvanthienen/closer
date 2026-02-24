'use client';

import React from 'react';
import HandDrawnCard from './HandDrawnCard';

interface AvailabilityDisplayProps {
  timezone: string | null;
  weekdayStart: string | null;
  weekdayEnd: string | null;
  weekendStart: string | null;
  weekendEnd: string | null;
  updatedAt: string | null;
}

export default function AvailabilityDisplay({
  timezone,
  weekdayStart,
  weekdayEnd,
  weekendStart,
  weekendEnd,
  updatedAt,
}: AvailabilityDisplayProps) {
  // Check if data is stale (>7 days)
  const isStale = updatedAt &&
    (new Date().getTime() - new Date(updatedAt).getTime()) > 7 * 24 * 60 * 60 * 1000;

  const formatTime = (time: string | null) => {
    if (!time) return 'Not set';
    // Convert HH:MM:SS to HH:MM AM/PM
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const hasAvailability = weekdayStart || weekdayEnd || weekendStart || weekendEnd;

  return (
    <div className="space-y-4">
      {/* Timezone display */}
      {timezone && (
        <div className="text-center text-sm text-gray-600">
          🌍 {timezone}
        </div>
      )}

      {/* Staleness warning */}
      {isStale && (
        <div className="text-center">
          <span className="inline-block bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-xs font-medium">
            ⚠️ Last updated {Math.floor((new Date().getTime() - new Date(updatedAt!).getTime()) / (24 * 60 * 60 * 1000))} days ago - might have changed
          </span>
        </div>
      )}

      {!hasAvailability ? (
        <HandDrawnCard borderColor="sage">
          <div className="text-center text-gray-500 py-4">
            No availability set yet
          </div>
        </HandDrawnCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Weekdays */}
          <HandDrawnCard borderColor="cobalt">
            <div className="text-center">
              <h3 className="font-bold text-lg mb-2">Weekdays</h3>
              {weekdayStart && weekdayEnd ? (
                <p className="text-gray-700">
                  Usually free<br />
                  <span className="text-xl font-bold text-cobalt">
                    {formatTime(weekdayStart)} - {formatTime(weekdayEnd)}
                  </span>
                </p>
              ) : (
                <p className="text-gray-400 text-sm">Not set</p>
              )}
            </div>
          </HandDrawnCard>

          {/* Weekends */}
          <HandDrawnCard borderColor="tomato">
            <div className="text-center">
              <h3 className="font-bold text-lg mb-2">Weekends</h3>
              {weekendStart && weekendEnd ? (
                <p className="text-gray-700">
                  Usually free<br />
                  <span className="text-xl font-bold text-tomato">
                    {formatTime(weekendStart)} - {formatTime(weekendEnd)}
                  </span>
                </p>
              ) : (
                <p className="text-gray-400 text-sm">Not set</p>
              )}
            </div>
          </HandDrawnCard>
        </div>
      )}

      {/* Last updated */}
      {updatedAt && (
        <div className="text-center text-xs text-gray-400">
          Last updated {new Date(updatedAt).toLocaleDateString()}
        </div>
      )}
    </div>
  );
}
