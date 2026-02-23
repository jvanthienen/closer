"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AuthGuard from "@/components/AuthGuard";
import { getFriend, updateFriend, getImportantDates, createImportantDate, deleteImportantDate } from '@/lib/db';
import CityAutocomplete from '@/components/CityAutocomplete';

type ImportantDate = {
  id?: string;
  label: string;
  month: string;
  day: string;
};

function EditFriendPage() {
  const router = useRouter();
  const params = useParams();
  const friendId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    city: '',
    timezone: 'America/New_York',
    cadence: 'monthly' as 'weekly' | 'monthly' | 'quarterly' | 'yearly',
    weekday_start: '09:00',
    weekday_end: '17:00',
    weekend_start: '10:00',
    weekend_end: '20:00',
    birthday_month: '',
    birthday_day: '',
  });

  const [importantDates, setImportantDates] = useState<ImportantDate[]>([]);
  const [originalDates, setOriginalDates] = useState<ImportantDate[]>([]);

  useEffect(() => {
    loadFriend();
  }, [friendId]);

  const loadFriend = async () => {
    try {
      const friend = await getFriend(friendId);
      if (!friend) {
        router.push('/friends');
        return;
      }

      setFormData({
        name: friend.name,
        phone: friend.phone || '',
        city: friend.city || '',
        timezone: friend.timezone,
        cadence: friend.cadence,
        weekday_start: friend.weekday_start || '09:00',
        weekday_end: friend.weekday_end || '17:00',
        weekend_start: friend.weekend_start || '10:00',
        weekend_end: friend.weekend_end || '20:00',
        birthday_month: '',
        birthday_day: '',
      });

      // Load important dates
      const dates = await getImportantDates(friendId);
      const birthday = dates.find(d => d.label === 'Birthday');
      const otherDates = dates.filter(d => d.label !== 'Birthday');

      if (birthday) {
        setFormData(prev => ({
          ...prev,
          birthday_month: birthday.month.toString(),
          birthday_day: birthday.day.toString(),
        }));
      }

      const mappedDates = otherDates.map(d => ({
        id: d.id,
        label: d.label,
        month: d.month.toString(),
        day: d.day.toString(),
      }));

      setImportantDates(mappedDates);
      setOriginalDates(mappedDates);
    } catch (err) {
      console.error('Failed to load friend:', err);
      setError('Failed to load friend');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    if (!formData.city || formData.city.trim() === '') {
      setError('Please select a city');
      setSaving(false);
      return;
    }

    try {
      // Update friend
      await updateFriend(friendId, {
        name: formData.name,
        phone: formData.phone,
        city: formData.city,
        timezone: formData.timezone,
        cadence: formData.cadence,
        weekday_start: formData.weekday_start,
        weekday_end: formData.weekday_end,
        weekend_start: formData.weekend_start,
        weekend_end: formData.weekend_end,
      } as any);

      // Handle birthday
      const existingDates = await getImportantDates(friendId);
      const birthdayDate = existingDates.find(d => d.label === 'Birthday');

      if (formData.birthday_month && formData.birthday_day) {
        if (birthdayDate) {
          // Birthday exists but we can't update, so delete and recreate
          await deleteImportantDate(birthdayDate.id);
        }
        await createImportantDate({
          friend_id: friendId,
          label: 'Birthday',
          month: parseInt(formData.birthday_month),
          day: parseInt(formData.birthday_day),
        });
      } else if (birthdayDate) {
        // Birthday was removed
        await deleteImportantDate(birthdayDate.id);
      }

      // Handle other important dates
      // Delete removed dates
      for (const original of originalDates) {
        if (original.id && !importantDates.find(d => d.id === original.id)) {
          await deleteImportantDate(original.id);
        }
      }

      // Add or update dates
      for (const date of importantDates) {
        if (date.label && date.month && date.day) {
          if (!date.id) {
            // New date
            await createImportantDate({
              friend_id: friendId,
              label: date.label,
              month: parseInt(date.month),
              day: parseInt(date.day),
            });
          }
          // Note: We don't update existing dates, they're immutable
          // If changed, delete and recreate above
        }
      }

      router.push('/friends');
    } catch (err: any) {
      console.error('Error updating friend:', err);
      setError(err.message || 'Failed to update friend');
    } finally {
      setSaving(false);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div
          className="w-12 h-12 rounded-full animate-pulse"
          style={{
            background: 'linear-gradient(135deg, rgba(232, 146, 100, 0.3) 0%, rgba(193, 123, 92, 0.2) 100%)',
          }}
        />
      </div>
    );
  }

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

        <h1>Edit friend</h1>
      </div>

      {/* Form - Same as add friend form */}
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
                className="w-full px-4 py-3 rounded-2xl font-sans text-sm"
                style={{
                  background: 'rgba(255, 255, 255, 0.6)',
                  border: '1px solid rgba(193, 123, 92, 0.2)',
                  color: '#3D2817',
                }}
              />
            </div>

            {/* City */}
            <div>
              <label className="block text-sm font-sans font-medium mb-2" style={{ color: '#5C4A3E' }}>
                City
              </label>
              <CityAutocomplete
                value={formData.city}
                onChange={handleCityChange}
              />
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
                {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((month, i) => (
                  <option key={i} value={i + 1}>{month}</option>
                ))}
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
                  <option key={day} value={day}>{day}</option>
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
                className="text-sm font-sans font-medium flex items-center gap-1"
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
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={date.label}
                        onChange={(e) => updateImportantDate(index, 'label', e.target.value)}
                        placeholder="e.g., Kid: Emma"
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
                        className="w-8 h-8 rounded-full flex items-center justify-center"
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
          </div>

          {/* Preferred Hours */}
          <div className="space-y-3 pt-4">
            <p className="text-sm font-sans font-medium" style={{ color: '#5C4A3E' }}>
              Best times to call (their local time)
            </p>

            <div className="space-y-3">
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
          disabled={saving}
          className="w-full px-6 py-4 rounded-full font-sans font-medium transition-all duration-300 hover:scale-[1.02] active:scale-95 disabled:opacity-50"
          style={{
            background: saving
              ? 'rgba(193, 123, 92, 0.5)'
              : 'linear-gradient(135deg, #E89264 0%, #C17B5C 100%)',
            color: '#FFFCF9',
            boxShadow: '0 4px 16px rgba(232, 146, 100, 0.3)',
          }}
        >
          {saving ? 'Saving...' : 'Save changes'}
        </button>
      </form>
    </div>
  );
}

export default function EditFriend() {
  return (
    <AuthGuard>
      <EditFriendPage />
    </AuthGuard>
  );
}
