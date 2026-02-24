'use client';

import React from 'react';
import HandDrawnCard from './HandDrawnCard';
import type { FriendConnection, PublicProfile } from '@/lib/db';

interface ConnectionsListProps {
  connections: Array<FriendConnection & { connected_profile: PublicProfile }>;
  onConnectionClick?: (connection: FriendConnection & { connected_profile: PublicProfile }) => void;
}

export default function ConnectionsList({ connections, onConnectionClick }: ConnectionsListProps) {
  const formatTime = (time: string | null) => {
    if (!time) return null;
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  if (connections.length === 0) {
    return (
      <HandDrawnCard borderColor="sage">
        <div className="text-center text-gray-500 py-8">
          No connections yet. Share your link to get started!
        </div>
      </HandDrawnCard>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="font-bold text-lg">Connected Friends</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {connections.map((conn) => {
          const profile = conn.connected_profile;
          const hasAvailability = profile.weekday_start || profile.weekend_start;

          return (
            <HandDrawnCard
              key={conn.id}
              borderColor="cobalt"
              onClick={onConnectionClick ? () => onConnectionClick(conn) : undefined}
              className={onConnectionClick ? 'cursor-pointer' : ''}
            >
              <div className="space-y-2">
                <h4 className="font-bold text-lg">
                  {profile.name || 'Friend'}
                </h4>

                {profile.timezone && (
                  <p className="text-sm text-gray-600">
                    🌍 {profile.timezone}
                  </p>
                )}

                {hasAvailability ? (
                  <div className="text-sm text-gray-700 space-y-1">
                    {profile.weekday_start && profile.weekday_end && (
                      <p>
                        <span className="font-medium">Weekdays:</span>{' '}
                        {formatTime(profile.weekday_start)} - {formatTime(profile.weekday_end)}
                      </p>
                    )}
                    {profile.weekend_start && profile.weekend_end && (
                      <p>
                        <span className="font-medium">Weekends:</span>{' '}
                        {formatTime(profile.weekend_start)} - {formatTime(profile.weekend_end)}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">
                    No availability set yet
                  </p>
                )}
              </div>
            </HandDrawnCard>
          );
        })}
      </div>
    </div>
  );
}
