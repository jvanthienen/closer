"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthGuard from "@/components/AuthGuard";
import { getFriends, type Friend } from '@/lib/db';

function FriendsPage() {
  const router = useRouter();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    loadFriends();
  }, []);

  const loadFriends = async () => {
    try {
      const data = await getFriends();
      setFriends(data);
    } catch (err) {
      console.error('Failed to load friends:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleImportContacts = async () => {
    // Go directly to import page (works on all devices)
    router.push('/friends/import');
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
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1>Friends</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={handleImportContacts}
            disabled={importing}
            className="px-4 py-2 rounded-full flex items-center gap-2 font-sans font-medium text-sm transition-all duration-200 hover:scale-105"
            style={{
              background: 'rgba(232, 146, 100, 0.15)',
              color: '#C17B5C',
              border: '1px solid rgba(232, 146, 100, 0.3)',
            }}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            {importing ? 'Importing...' : 'Import'}
          </button>
          <button
            onClick={() => router.push('/friends/add')}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
            style={{
              background: 'linear-gradient(135deg, #E89264 0%, #C17B5C 100%)',
              boxShadow: '0 4px 12px rgba(232, 146, 100, 0.3)',
            }}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="#FFFCF9"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>

      {/* Friends list or empty state */}
      {friends.length === 0 ? (
        <div className="relative group animate-slide-up">
          <div
            className="relative rounded-[28px] p-8 backdrop-blur-md border text-center space-y-4"
            style={{
              background: 'rgba(255, 252, 249, 0.65)',
              borderColor: 'rgba(255, 255, 255, 0.5)',
              boxShadow: '0 8px 32px rgba(139, 98, 74, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
            }}
          >
            <p className="text-sm font-sans opacity-60" style={{ color: '#8B624A' }}>
              No friends yet
            </p>
            <button
              onClick={() => router.push('/friends/add')}
              className="px-6 py-3 rounded-full font-sans font-medium text-sm transition-all duration-300 hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #E89264 0%, #C17B5C 100%)',
                color: '#FFFCF9',
                boxShadow: '0 4px 16px rgba(232, 146, 100, 0.3)',
              }}
            >
              Add your first friend
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {friends.map((friend, idx) => (
            <div
              key={friend.id}
              className="rounded-[24px] p-5 backdrop-blur-md border transition-all duration-300 hover:scale-[1.01]"
              style={{
                background: 'rgba(255, 252, 249, 0.65)',
                borderColor: 'rgba(255, 255, 255, 0.5)',
                boxShadow: '0 4px 16px rgba(139, 98, 74, 0.06)',
                animationDelay: `${idx * 0.05}s`,
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1 flex-1">
                  <h3 className="font-serif text-lg" style={{ color: '#3D2817' }}>
                    {friend.name}
                  </h3>
                  <p className="text-sm font-sans" style={{ color: '#7A6F65' }}>
                    {friend.city || 'No city'} • {friend.cadence}
                  </p>
                </div>
                <button
                  onClick={() => router.push(`/friends/${friend.id}`)}
                  className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
                  style={{
                    background: 'rgba(193, 123, 92, 0.15)',
                  }}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="#C17B5C"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Friends() {
  return (
    <AuthGuard>
      <FriendsPage />
    </AuthGuard>
  );
}
