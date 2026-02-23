"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthGuard from "@/components/AuthGuard";
import { getFriends, deleteFriend, type Friend } from '@/lib/db';
import HandDrawnButton from '@/components/HandDrawnButton';
import HandDrawnCard from '@/components/HandDrawnCard';
import { PlusIcon, ImportIcon, EditIcon } from '@/components/HandDrawnIcons';

function FriendsPage() {
  const router = useRouter();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [swipedId, setSwipedId] = useState<string | null>(null);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);

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
        <div className="text-cobalt text-lg font-semibold animate-pulse">
          Loading friends...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-tomato">Friends</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={handleImportContacts}
            disabled={importing}
            className="px-4 py-2 rounded-[24px] border-[2.5px] border-cobalt bg-transparent text-cobalt font-semibold text-sm transition-all hover:scale-105 active:scale-96 flex items-center gap-2"
          >
            <ImportIcon className="w-4 h-4" />
            {importing ? 'Importing...' : 'Import'}
          </button>
          <button
            onClick={() => router.push('/friends/add')}
            className="w-10 h-10 rounded-full bg-tomato border-[2.5px] border-tomato flex items-center justify-center transition-all hover:scale-110 active:scale-95"
          >
            <PlusIcon className="w-5 h-5" color="white" />
          </button>
        </div>
      </div>

      {/* Friends list or empty state */}
      {friends.length === 0 ? (
        <HandDrawnCard borderColor="cobalt" className="text-center space-y-4 p-8">
          <p className="text-lg font-medium text-navy">
            No friends yet
          </p>
          <p className="text-sm text-gray-600">
            Add someone you'd love to call
          </p>
          <HandDrawnButton
            variant="primary"
            color="tomato"
            onClick={() => router.push('/friends/add')}
          >
            Add your first friend
          </HandDrawnButton>
        </HandDrawnCard>
      ) : (
        <div className="space-y-3">
          {friends.map((friend, idx) => {
            // Rotate colors for variety
            const colors = ['cobalt', 'tomato', 'sage', 'orange', 'magenta'] as const;
            const borderColor = colors[idx % colors.length];

            const colorMap = {
              cobalt: '#457B9D',
              tomato: '#E63946',
              sage: '#8CB369',
              orange: '#F77F00',
              magenta: '#E76F9B',
            };

            return (
              <div
                key={friend.id}
                className="relative overflow-hidden"
              >
                {/* Delete button (revealed on swipe) */}
                <div
                  className="absolute right-0 top-0 bottom-0 flex items-center justify-center px-6 bg-tomato rounded-r-[20px]"
                  style={{ width: '100px' }}
                >
                  <button
                    onClick={() => handleDelete(friend.id)}
                    className="text-white font-semibold text-sm"
                  >
                    Delete
                  </button>
                </div>

                {/* Friend card (swipeable) */}
                <div
                  onTouchStart={(e) => handleTouchStart(e, friend.id)}
                  onTouchEnd={(e) => handleTouchEnd(e, friend.id)}
                  className="bg-white rounded-[20px] p-5 border-[2.5px] transition-all duration-300 hover:shadow-lg"
                  style={{
                    borderColor: colorMap[borderColor],
                    transform: swipedId === friend.id ? 'translateX(-100px)' : 'translateX(0)',
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 flex-1">
                      <h3 className="font-bold text-lg" style={{ color: colorMap[borderColor] }}>
                        {friend.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {friend.city || 'No city'} • {friend.cadence}
                      </p>
                    </div>
                    <button
                      onClick={() => router.push(`/friends/${friend.id}`)}
                      className="w-9 h-9 rounded-full border-[2.5px] flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                      style={{ borderColor: colorMap[borderColor], color: colorMap[borderColor] }}
                    >
                      <EditIcon className="w-4 h-4" />
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
