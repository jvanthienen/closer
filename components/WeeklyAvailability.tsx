'use client';

import React from 'react';
import HandDrawnCard from './HandDrawnCard';

interface FreeSlot {
  start: Date;
  end: Date;
  duration: number;
}

interface WeeklyAvailabilityProps {
  freeSlots: FreeSlot[];
}

export default function WeeklyAvailability({ freeSlots }: WeeklyAvailabilityProps) {
  const today = new Date();

  // Generate the next 7 days
  const days = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(today);
    day.setDate(today.getDate() + i);
    return day;
  });

  // Group free slots by day
  const slotsByDay = days.map(day => {
    const daySlots = freeSlots.filter(slot =>
      slot.start.toDateString() === day.toDateString()
    );
    return { day, slots: daySlots };
  });

  // Format day header
  const formatDayHeader = (day: Date): string => {
    const isToday = day.toDateString() === today.toDateString();
    const isTomorrow = day.toDateString() === new Date(today.getTime() + 86400000).toDateString();

    if (isToday) return 'Today';
    if (isTomorrow) return 'Tomorrow';

    return day.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  };

  // Get time of day emoji and label
  const getTimeOfDay = (date: Date): { emoji: string; label: string } => {
    const hour = date.getHours();
    if (hour < 12) return { emoji: '☕', label: 'morning' };
    if (hour < 17) return { emoji: '☀️', label: 'afternoon' };
    return { emoji: '🌙', label: 'evening' };
  };

  // Format time range
  const formatTimeRange = (start: Date, end: Date): string => {
    const formatTime = (date: Date) => {
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: date.getMinutes() > 0 ? '2-digit' : undefined,
        hour12: true
      });
    };
    return `${formatTime(start)} - ${formatTime(end)}`;
  };

  // Get friendly message for slots
  const getFriendlyMessage = (slots: FreeSlot[]): string => {
    if (slots.length === 0) return "All booked up";
    if (slots.length === 1) return "Might catch me";
    return "Good windows to call";
  };

  // Border colors for variety
  const borderColors: Array<'cobalt' | 'sage' | 'orange' | 'tomato'> = ['cobalt', 'sage', 'orange', 'tomato'];

  return (
    <div className="space-y-4">
      {slotsByDay.map(({ day, slots }, idx) => {
        const hasSlots = slots.length > 0;
        const borderColor = borderColors[idx % borderColors.length];

        return (
          <HandDrawnCard key={idx} borderColor={borderColor}>
            <div className="space-y-3">
              {/* Day header */}
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg" style={{ color: '#5C4A3E' }}>
                  {formatDayHeader(day)}
                </h3>
                <span className="text-sm opacity-70" style={{ color: '#7A6F65' }}>
                  {getFriendlyMessage(slots)}
                </span>
              </div>

              {/* Time windows */}
              {hasSlots ? (
                <div className="space-y-2">
                  {slots.map((slot, slotIdx) => {
                    const { emoji, label } = getTimeOfDay(slot.start);
                    const durationHours = Math.floor(slot.duration / 60);
                    const durationMins = slot.duration % 60;

                    return (
                      <div
                        key={slotIdx}
                        className="p-3 rounded-lg"
                        style={{
                          background: 'rgba(139, 195, 74, 0.1)',
                          border: '1px dashed rgba(139, 195, 74, 0.3)',
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{emoji}</span>
                            <div>
                              <p className="text-sm font-medium" style={{ color: '#5C4A3E' }}>
                                {formatTimeRange(slot.start, slot.end)}
                              </p>
                              <p className="text-xs opacity-60" style={{ color: '#7A6F65' }}>
                                {label} • {durationHours > 0 && `${durationHours}h `}{durationMins}min window
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div
                  className="text-center py-4 rounded-lg"
                  style={{
                    background: 'rgba(232, 146, 100, 0.05)',
                    border: '1px dashed rgba(232, 146, 100, 0.2)',
                  }}
                >
                  <p className="text-sm opacity-60" style={{ color: '#8B624A' }}>
                    Pretty packed this day
                  </p>
                </div>
              )}
            </div>
          </HandDrawnCard>
        );
      })}
    </div>
  );
}
