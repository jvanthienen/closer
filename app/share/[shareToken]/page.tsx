'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import AvailabilityDisplay from '@/components/AvailabilityDisplay';
import HandDrawnButton from '@/components/HandDrawnButton';
import type { PublicProfile } from '@/lib/db';

export default function SharePage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const shareToken = params.shareToken as string;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`/api/profile/public/${shareToken}`);

        if (!response.ok) {
          setError('Profile not found');
          return;
        }

        const data = await response.json();
        setProfile(data);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [shareToken]);

  const handleCreateAccount = () => {
    // Redirect to availability set page with share token
    router.push(`/availability/set?fromShare=${shareToken}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Profile not found</h1>
          <p className="text-gray-600">This share link may be invalid or expired.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <h1 className="text-3xl font-bold">
            You might catch {profile.name || 'your friend'} free around these times
          </h1>
          <p className="text-gray-600">
            No pressure - just helpful to know when they're usually available
          </p>
        </div>

        {/* Availability Display */}
        <AvailabilityDisplay
          timezone={profile.timezone}
          weekdayStart={profile.weekday_start}
          weekdayEnd={profile.weekday_end}
          weekendStart={profile.weekend_start}
          weekendEnd={profile.weekend_end}
          updatedAt={profile.availability_updated_at}
        />

        {/* CTAs */}
        <div className="space-y-4">
          {status !== 'authenticated' && (
            <div className="text-center">
              <HandDrawnButton
                color="tomato"
                onClick={handleCreateAccount}
                className="w-full sm:w-auto"
              >
                Create account & share back
              </HandDrawnButton>
              <p className="text-xs text-gray-500 mt-2">
                Share your availability with {profile.name || 'them'} too
              </p>
            </div>
          )}

          {status === 'authenticated' && (
            <div className="text-center">
              <HandDrawnButton
                color="sage"
                onClick={handleCreateAccount}
                className="w-full sm:w-auto"
              >
                Share your availability back
              </HandDrawnButton>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
