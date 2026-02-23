"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthGuard from "@/components/AuthGuard";
import { createFriend, createImportantDate } from '@/lib/db';
import CityAutocomplete from '@/components/CityAutocomplete';

function AddFriendPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  type ImportantDate = {
    label: string;
    month: string;
    day: string;
  };

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    city: '',
    timezone: 'America/New_York',
    cadence: 'monthly' as 'weekly' | 'monthly' | 'quarterly' | 'yearly',
    priority: 'high' as 'high' | 'medium' | 'low', // Everyone is high priority!
    weekday_start: '09:00',
    weekday_end: '17:00',
    weekend_start: '10:00',
    weekend_end: '20:00',
    birthday_month: '',
    birthday_day: '',
  });

  const [importantDates, setImportantDates] = useState<ImportantDate[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate city is filled
    if (!formData.city || formData.city.trim() === '') {
      setError('Please select a city');
      setLoading(false);
      return;
    }

    try {
      console.log('Creating friend with data:', formData);

      // Create the friend
      const friend = await createFriend({
        name: formData.name,
        phone: formData.phone,
        city: formData.city,
        timezone: formData.timezone,
        cadence: formData.cadence,
        priority: formData.priority,
        weekday_start: formData.weekday_start,
        weekday_end: formData.weekday_end,
        weekend_start: formData.weekend_start,
        weekend_end: formData.weekend_end,
        last_called_at: null,
      });

      // Add birthday if provided
      if (formData.birthday_month && formData.birthday_day) {
        await createImportantDate({
          friend_id: friend.id,
          label: 'Birthday',
          month: parseInt(formData.birthday_month),
          day: parseInt(formData.birthday_day),
        });
      }

      // Add other important dates
      for (const date of importantDates) {
        if (date.label && date.month && date.day) {
          await createImportantDate({
            friend_id: friend.id,
            label: date.label,
            month: parseInt(date.month),
            day: parseInt(date.day),
          });
        }
      }

      router.push('/friends');
    } catch (err: any) {
      console.error('Error creating friend:', err);
      setError(err.message || 'Failed to add friend');
    } finally {
      setLoading(false);
    }
  };

  const handleCityChange = (city: string, timezone: string) => {
    setFormData({ ...formData, city, timezone });
  };

  const addImportantDate = () => {
    setImportantDates([...importantDates, { label: '', month: '', day: '' }]);
  };

  const removeImportantDate = (index: number) => {
    setImportantDates(importantDates.filter((_, i) => i !== index));
  };

  const updateImportantDate = (index: number, field: keyof ImportantDate, value: string) => {
    const updated = [...importantDates];
    updated[index][field] = value;
    setImportantDates(updated);
  };

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

        <h1>Add friend</h1>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info Card */}
        <div
          className="rounded-[24px] p-6 backdrop-blur-md border space-y-4"
          style={{
            background: 'rgba(255, 252, 249, 0.65)',
            borderColor: 'rgba(255, 255, 255, 0.5)',
            boxShadow: '0 8px 32px rgba(139, 98, 74, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
          }}
        >
          <h3 className="font-sans">Basic info</h3>

          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-sans font-medium mb-2" style={{ color: '#5C4A3E' }}>
                Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="Jane Doe"
                className="w-full px-4 py-3 rounded-2xl font-sans text-sm"
                style={{
                  background: 'rgba(255, 255, 255, 0.6)',
                  border: '1px solid rgba(193, 123, 92, 0.2)',
                  color: '#3D2817',
                }}
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-sans font-medium mb-2" style={{ color: '#5C4A3E' }}>
                WhatsApp number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 234 567 8900"
                className="w-full px-4 py-3 rounded-2xl font-sans text-sm"
                style={{
                  background: 'rgba(255, 255, 255, 0.6)',
                  border: '1px solid rgba(193, 123, 92, 0.2)',
                  color: '#3D2817',
                }}
              />
            </div>

            {/* City/Timezone */}
            <div>
              <label className="block text-sm font-sans font-medium mb-2" style={{ color: '#5C4A3E' }}>
                City
              </label>
              <CityAutocomplete
                value={formData.city}
                onChange={handleCityChange}
              />
              <p className="text-xs font-sans mt-1 opacity-60" style={{ color: '#8B624A' }}>
                Start typing to search any city in the world
              </p>
            </div>
          </div>
        </div>

        {/* Preferences Card */}
        <div
          className="rounded-[24px] p-6 backdrop-blur-md border space-y-4"
          style={{
            background: 'rgba(255, 252, 249, 0.65)',
            borderColor: 'rgba(255, 255, 255, 0.5)',
            boxShadow: '0 8px 32px rgba(139, 98, 74, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
          }}
        >
          <h3 className="font-sans">Call preferences</h3>

          {/* Cadence */}
          <div>
            <label className="block text-sm font-sans font-medium mb-2" style={{ color: '#5C4A3E' }}>
              How often do you want to call?
            </label>
            <select
              value={formData.cadence}
              onChange={(e) => setFormData({ ...formData, cadence: e.target.value as any })}
              className="w-full px-4 py-3 rounded-2xl font-sans text-sm"
              style={{
                background: 'rgba(255, 255, 255, 0.6)',
                border: '1px solid rgba(193, 123, 92, 0.2)',
                color: '#3D2817',
              }}
            >
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>

          {/* Birthday */}
          <div className="pt-2">
            <label className="block text-sm font-sans font-medium mb-2" style={{ color: '#5C4A3E' }}>
              Birthday (optional)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <select
                value={formData.birthday_month}
                onChange={(e) => setFormData({ ...formData, birthday_month: e.target.value })}
                className="px-4 py-3 rounded-2xl font-sans text-sm"
                style={{
                  background: 'rgba(255, 255, 255, 0.6)',
                  border: '1px solid rgba(193, 123, 92, 0.2)',
                  color: '#3D2817',
                }}
              >
                <option value="">Month</option>
                <option value="1">January</option>
                <option value="2">February</option>
                <option value="3">March</option>
                <option value="4">April</option>
                <option value="5">May</option>
                <option value="6">June</option>
                <option value="7">July</option>
                <option value="8">August</option>
                <option value="9">September</option>
                <option value="10">October</option>
                <option value="11">November</option>
                <option value="12">December</option>
              </select>
              <select
                value={formData.birthday_day}
                onChange={(e) => setFormData({ ...formData, birthday_day: e.target.value })}
                className="px-4 py-3 rounded-2xl font-sans text-sm"
                style={{
                  background: 'rgba(255, 255, 255, 0.6)',
                  border: '1px solid rgba(193, 123, 92, 0.2)',
                  color: '#3D2817',
                }}
              >
                <option value="">Day</option>
                {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Other Important Dates */}
          <div className="pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-sans font-medium" style={{ color: '#5C4A3E' }}>
                Other important dates
              </label>
              <button
                type="button"
                onClick={addImportantDate}
                className="text-sm font-sans font-medium flex items-center gap-1 transition-colors duration-200"
                style={{ color: '#C17B5C' }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Add date
              </button>
            </div>

            {importantDates.length > 0 && (
              <div className="space-y-3">
                {importantDates.map((date, index) => (
                  <div key={index} className="space-y-2 p-4 rounded-2xl" style={{ background: 'rgba(193, 123, 92, 0.05)' }}>
                    <div className="flex items-center justify-between">
                      <input
                        type="text"
                        value={date.label}
                        onChange={(e) => updateImportantDate(index, 'label', e.target.value)}
                        placeholder="e.g., Kid: Emma, Mom's birthday"
                        className="flex-1 px-3 py-2 rounded-xl font-sans text-sm"
                        style={{
                          background: 'rgba(255, 255, 255, 0.6)',
                          border: '1px solid rgba(193, 123, 92, 0.2)',
                          color: '#3D2817',
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => removeImportantDate(index)}
                        className="ml-2 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
                        style={{ background: 'rgba(179, 38, 30, 0.1)' }}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="#B3261E" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        value={date.month}
                        onChange={(e) => updateImportantDate(index, 'month', e.target.value)}
                        className="px-3 py-2 rounded-xl font-sans text-sm"
                        style={{
                          background: 'rgba(255, 255, 255, 0.6)',
                          border: '1px solid rgba(193, 123, 92, 0.2)',
                          color: '#3D2817',
                        }}
                      >
                        <option value="">Month</option>
                        {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((month, i) => (
                          <option key={i} value={i + 1}>{month}</option>
                        ))}
                      </select>
                      <select
                        value={date.day}
                        onChange={(e) => updateImportantDate(index, 'day', e.target.value)}
                        className="px-3 py-2 rounded-xl font-sans text-sm"
                        style={{
                          background: 'rgba(255, 255, 255, 0.6)',
                          border: '1px solid rgba(193, 123, 92, 0.2)',
                          color: '#3D2817',
                        }}
                      >
                        <option value="">Day</option>
                        {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                          <option key={day} value={day}>{day}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {importantDates.length === 0 && (
              <p className="text-xs font-sans opacity-60 text-center py-2" style={{ color: '#8B624A' }}>
                Add kids' birthdays, anniversaries, or other dates to remember
              </p>
            )}
          </div>

          {/* Preferred Hours */}
          <div className="space-y-3 pt-4">
            <p className="text-sm font-sans font-medium" style={{ color: '#5C4A3E' }}>
              Best times to call (their local time)
            </p>

            <div className="space-y-3">
              {/* Weekdays */}
              <div className="flex items-center gap-3">
                <span className="text-sm font-sans w-20" style={{ color: '#7A6F65' }}>Weekdays</span>
                <input
                  type="time"
                  value={formData.weekday_start}
                  onChange={(e) => setFormData({ ...formData, weekday_start: e.target.value })}
                  className="flex-1 px-3 py-2 rounded-xl font-sans text-sm"
                  style={{
                    background: 'rgba(255, 255, 255, 0.6)',
                    border: '1px solid rgba(193, 123, 92, 0.2)',
                    color: '#3D2817',
                  }}
                />
                <span style={{ color: '#7A6F65' }}>to</span>
                <input
                  type="time"
                  value={formData.weekday_end}
                  onChange={(e) => setFormData({ ...formData, weekday_end: e.target.value })}
                  className="flex-1 px-3 py-2 rounded-xl font-sans text-sm"
                  style={{
                    background: 'rgba(255, 255, 255, 0.6)',
                    border: '1px solid rgba(193, 123, 92, 0.2)',
                    color: '#3D2817',
                  }}
                />
              </div>

              {/* Weekends */}
              <div className="flex items-center gap-3">
                <span className="text-sm font-sans w-20" style={{ color: '#7A6F65' }}>Weekends</span>
                <input
                  type="time"
                  value={formData.weekend_start}
                  onChange={(e) => setFormData({ ...formData, weekend_start: e.target.value })}
                  className="flex-1 px-3 py-2 rounded-xl font-sans text-sm"
                  style={{
                    background: 'rgba(255, 255, 255, 0.6)',
                    border: '1px solid rgba(193, 123, 92, 0.2)',
                    color: '#3D2817',
                  }}
                />
                <span style={{ color: '#7A6F65' }}>to</span>
                <input
                  type="time"
                  value={formData.weekend_end}
                  onChange={(e) => setFormData({ ...formData, weekend_end: e.target.value })}
                  className="flex-1 px-3 py-2 rounded-xl font-sans text-sm"
                  style={{
                    background: 'rgba(255, 255, 255, 0.6)',
                    border: '1px solid rgba(193, 123, 92, 0.2)',
                    color: '#3D2817',
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {error && (
          <p className="text-sm font-sans text-error text-center">{error}</p>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full px-6 py-4 rounded-full font-sans font-medium transition-all duration-300 hover:scale-[1.02] active:scale-95 disabled:opacity-50"
          style={{
            background: loading
              ? 'rgba(193, 123, 92, 0.5)'
              : 'linear-gradient(135deg, #E89264 0%, #C17B5C 100%)',
            color: '#FFFCF9',
            boxShadow: '0 4px 16px rgba(232, 146, 100, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
          }}
        >
          {loading ? 'Adding...' : 'Add friend'}
        </button>
      </form>
    </div>
  );
}

export default function AddFriend() {
  return (
    <AuthGuard>
      <AddFriendPage />
    </AuthGuard>
  );
}
