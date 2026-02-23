"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthGuard from "@/components/AuthGuard";
import { getFriends, deleteFriend, type Friend } from '@/lib/db';
import HandDrawnButton from '@/components/HandDrawnButton';
import HandDrawnCard from '@/components/HandDrawnCard';
import { PlusIcon, ImportIcon, EditIcon } from '@/components/HandDrawnIcons';
import RoughBorder, { RoughCircle } from '@/components/RoughBorder';

function FriendsPage() {
  const router = useRouter();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [swipedId, setSwipedId] = useState<string | null>(null);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);

  // Light Chalk roughness (locked in)
  const roughness = 2;

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
    router.push('/friends/import');
  };

  const handleDelete = async (friendId: string) => {
    const confirmed = confirm('Delete this friend? This cannot be undone.');
    if (!confirmed) return;

    try {
      await deleteFriend(friendId);
      setFriends(friends.filter(f => f.id !== friendId));
      setSwipedId(null);
    } catch (err) {
      console.error('Failed to delete friend:', err);
      alert('Failed to delete friend. Please try again.');
    }
  };

  const handleTouchStart = (e: React.TouchEvent, friendId: string) => {
    setTouchStart({
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    });
  };

  const handleTouchEnd = (e: React.TouchEvent, friendId: string) => {
    if (!touchStart) return;

    const touchEnd = {
      x: e.changedTouches[0].clientX,
      y: e.changedTouches[0].clientY,
    };

    const deltaX = touchEnd.x - touchStart.x;
    const deltaY = Math.abs(touchEnd.y - touchStart.y);

    if (Math.abs(deltaX) > 50 && deltaY < 30) {
      if (deltaX < 0) {
        setSwipedId(friendId);
      } else {
        setSwipedId(null);
      }
    }

    setTouchStart(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-cobalt text-lg font-bold animate-pulse">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with hand-drawn playful title */}
      <div className="flex items-center justify-between">
        <h1
          style={{
            color: '#E05F4F',
            transform: `rotate(${Math.random() * 2 - 1}deg)`,
            display: 'inline-block',
          }}
        >
          Friends
        </h1>
        <div className="flex items-center gap-3">
          {/* Import button - rough outline */}
          <button
            onClick={handleImportContacts}
            disabled={importing}
            className="relative px-4 py-2 bg-transparent font-bold text-sm flex items-center gap-2 transition-all hover:scale-105"
            style={{ color: '#3B7CC4' }}
          >
            <RoughBorder color="#3B7CC4" roughness={roughness} />
            <ImportIcon className="w-4 h-4 relative z-10" />
            <span className="relative z-10">{importing ? 'Importing...' : 'Import'}</span>
          </button>

          {/* Add button - round circle */}
          <button
            onClick={() => router.push('/friends/add')}
            className="relative w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95"
            style={{
              background: '#E05F4F',
              transform: `rotate(${Math.random() * 3 - 1.5}deg)`,
            }}
          >
            <RoughCircle color="#E05F4F" roughness={roughness} />
            <PlusIcon className="w-6 h-6 relative z-10" color="white" />
          </button>
        </div>
      </div>

      {/* Friends list or empty state */}
      {friends.length === 0 ? (
        <div className="relative bg-white p-8 text-center space-y-4">
          <RoughBorder color="#3B7CC4" roughness={2} />
          <p className="text-lg font-bold relative z-10" style={{ color: '#2C3E5A' }}>
            No friends yet
          </p>
          <p className="text-sm text-gray-600 relative z-10">
            Add someone you'd love to call
          </p>
          <button
            onClick={() => router.push('/friends/add')}
            className="relative px-6 py-3 bg-transparent font-bold text-sm transition-all hover:scale-105 inline-block"
            style={{ color: '#E05F4F' }}
          >
            <RoughBorder color="#E05F4F" roughness={2} />
            <span className="relative z-10">Add your first friend</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {friends.map((friend, idx) => {
            // Rotate colors - playful wine & coffee palette!
            const colors = ['coral', 'blue', 'orange', 'navy', 'maroon'] as const;
            const borderColor = colors[idx % colors.length];

            const colorMap = {
              coral: '#E05F4F',
              blue: '#3B7CC4',
              orange: '#F5A052',
              navy: '#2C3E5A',
              maroon: '#9B5174',
            };

            return (
              <div
                key={friend.id}
                className="relative overflow-visible"
              >
                {/* Delete button (revealed on swipe) */}
                {swipedId === friend.id && (
                  <div
                    className="absolute right-0 top-0 bottom-0 flex items-center justify-center px-6 bg-tomato z-0"
                    style={{
                      width: '100px',
                      borderRadius: '0 16px 16px 0',
                    }}
                  >
                    <button
                      onClick={() => handleDelete(friend.id)}
                      className="text-white font-bold text-sm"
                    >
                      Delete
                    </button>
                  </div>
                )}

                {/* Friend card (swipeable) - chalk border */}
                <div
                  onTouchStart={(e) => handleTouchStart(e, friend.id)}
                  onTouchEnd={(e) => handleTouchEnd(e, friend.id)}
                  className="relative bg-white p-5 transition-all duration-300 overflow-hidden"
                  style={{
                    transform: `
                      translateX(${swipedId === friend.id ? '-100px' : '0'})
                      rotate(${Math.random() * 1.5 - 0.75}deg)
                    `,
                  }}
                >
                  {/* Rough.js hand-drawn border */}
                  <RoughBorder
                    color={colorMap[borderColor]}
                    roughness={roughness}
                  />

                  <div className="flex items-start justify-between gap-3 relative z-10">
                    <div className="space-y-1 flex-1">
                      <h3
                        className="font-bold text-lg"
                        style={{
                          color: colorMap[borderColor],
                          transform: `rotate(${Math.random() * 1 - 0.5}deg)`,
                          display: 'inline-block',
                        }}
                      >
                        {friend.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {friend.city || 'No city'} • {friend.cadence}
                      </p>
                    </div>

                    {/* Edit button - chalk circle */}
                    <button
                      onClick={() => router.push(`/friends/${friend.id}`)}
                      className="relative w-10 h-10 flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                      style={{
                        color: colorMap[borderColor],
                        transform: `rotate(${Math.random() * 2 - 1}deg)`,
                      }}
                    >
                      <RoughCircle color={colorMap[borderColor]} roughness={roughness} />
                      <EditIcon className="w-4 h-4 relative z-10" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
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
