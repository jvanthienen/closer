"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div
          className="w-12 h-12 rounded-full animate-pulse"
          style={{
            background: 'linear-gradient(135deg, rgba(232, 146, 100, 0.3) 0%, rgba(193, 123, 92, 0.2) 100%)',
          }}
        />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
