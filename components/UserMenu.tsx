'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';

export default function UserMenu() {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [showMenu, setShowMenu] = useState(false);

  // Don't show on auth page or if not logged in
  if (!session || pathname === '/auth') {
    return null;
  }

  const userEmail = session.user?.email || '';
  const initials = userEmail
    .split('@')[0]
    .split('.')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/auth' });
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      {/* User button */}
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
        style={{
          background: 'linear-gradient(135deg, #E89264 0%, #C17B5C 100%)',
          color: '#FFFCF9',
          boxShadow: '0 2px 8px rgba(193, 123, 92, 0.3)',
        }}
      >
        <span className="text-sm font-bold">{initials}</span>
      </button>

      {/* Dropdown menu */}
      {showMenu && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowMenu(false)}
          />

          {/* Menu */}
          <div
            className="absolute top-12 right-0 w-64 rounded-2xl backdrop-blur-md border z-50"
            style={{
              background: 'rgba(255, 252, 249, 0.95)',
              borderColor: 'rgba(193, 123, 92, 0.2)',
              boxShadow: '0 8px 32px rgba(139, 98, 74, 0.15)',
            }}
          >
            <div className="p-4 space-y-3">
              {/* User info */}
              <div className="pb-3 border-b border-gray-200">
                <p className="text-sm font-medium" style={{ color: '#5C4A3E' }}>
                  {userEmail}
                </p>
              </div>

              {/* Menu items */}
              <button
                onClick={handleSignOut}
                className="w-full px-4 py-2 rounded-lg text-left text-sm font-medium transition-all duration-200 hover:bg-red-50"
                style={{ color: '#B3261E' }}
              >
                Sign out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
