'use client';

import React, { useState, useEffect } from 'react';
import HandDrawnButton from './HandDrawnButton';
import HandDrawnCard from './HandDrawnCard';

interface AvailabilityFormProps {
  initialTimezone?: string | null;
  initialWeekdayStart?: string | null;
  initialWeekdayEnd?: string | null;
  initialWeekendStart?: string | null;
  initialWeekendEnd?: string | null;
  onSubmit: (data: {
    timezone: string;
    weekday_start: string;
    weekday_end: string;
    weekend_start: string;
    weekend_end: string;
  }) => Promise<void>;
  submitLabel?: string;
}

export default function AvailabilityForm({
  initialTimezone,
  initialWeekdayStart,
  initialWeekdayEnd,
  initialWeekendStart,
  initialWeekendEnd,
  onSubmit,
  submitLabel = 'Save Availability',
}: AvailabilityFormProps) {
  const [timezone, setTimezone] = useState(initialTimezone || '');
  const [weekdayStart, setWeekdayStart] = useState(initialWeekdayStart || '');
  const [weekdayEnd, setWeekdayEnd] = useState(initialWeekdayEnd || '');
  const [weekendStart, setWeekendStart] = useState(initialWeekendStart || '');
  const [weekendEnd, setWeekendEnd] = useState(initialWeekendEnd || '');
  const [loading, setLoading] = useState(false);

  // Auto-detect timezone on mount
  useEffect(() => {
    if (!initialTimezone && !timezone) {
      const detectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      setTimezone(detectedTimezone);
    }
  }, [initialTimezone, timezone]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onSubmit({
        timezone,
        weekday_start: weekdayStart,
        weekday_end: weekdayEnd,
        weekend_start: weekendStart,
        weekend_end: weekendEnd,
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Failed to save availability');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <HandDrawnCard borderColor="sage">
        <div className="space-y-4">
          <h3 className="font-bold text-lg">Your Timezone</h3>
          <input
            type="text"
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            placeholder="e.g., America/New_York"
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-sage"
            required
          />
          <p className="text-xs text-gray-500">
            Auto-detected: {Intl.DateTimeFormat().resolvedOptions().timeZone}
          </p>
        </div>
      </HandDrawnCard>

      <HandDrawnCard borderColor="cobalt">
        <div className="space-y-4">
          <h3 className="font-bold text-lg">Weekday Availability</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Time
              </label>
              <input
                type="time"
                value={weekdayStart}
                onChange={(e) => setWeekdayStart(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-cobalt"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Time
              </label>
              <input
                type="time"
                value={weekdayEnd}
                onChange={(e) => setWeekdayEnd(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-cobalt"
                required
              />
            </div>
          </div>
        </div>
      </HandDrawnCard>

      <HandDrawnCard borderColor="tomato">
        <div className="space-y-4">
          <h3 className="font-bold text-lg">Weekend Availability</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Time
              </label>
              <input
                type="time"
                value={weekendStart}
                onChange={(e) => setWeekendStart(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-tomato"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Time
              </label>
              <input
                type="time"
                value={weekendEnd}
                onChange={(e) => setWeekendEnd(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-tomato"
                required
              />
            </div>
          </div>
        </div>
      </HandDrawnCard>

      <div className="flex justify-center">
        <HandDrawnButton type="submit" color="sage" disabled={loading}>
          {loading ? 'Saving...' : submitLabel}
        </HandDrawnButton>
      </div>
    </form>
  );
}
