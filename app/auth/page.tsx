"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (error) throw error;

      setSent(true);
    } catch (error: any) {
      setError(error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });

      if (error) throw error;
    } catch (error: any) {
      setError(error.message || 'Failed to sign in with Google');
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div
          className="w-full max-w-md rounded-[28px] p-8 backdrop-blur-md border animate-fade-in"
          style={{
            background: 'rgba(255, 252, 249, 0.75)',
            borderColor: 'rgba(255, 255, 255, 0.5)',
            boxShadow: '0 8px 32px rgba(139, 98, 74, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
          }}
        >
          <div className="text-center space-y-4">
            {/* Success icon */}
            <div className="inline-flex">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, rgba(232, 146, 100, 0.2) 0%, rgba(193, 123, 92, 0.15) 100%)',
                }}
              >
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="#C17B5C"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-serif" style={{ color: '#3D2817' }}>
                Check your email
              </h1>
              <p className="text-sm font-sans" style={{ color: '#7A6F65' }}>
                We sent a magic link to<br />
                <span className="font-medium" style={{ color: '#5C4A3E' }}>{email}</span>
              </p>
            </div>

            <p className="text-sm font-sans opacity-70 pt-4" style={{ color: '#8B624A' }}>
              Click the link to sign in. It expires in 60 minutes.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div
        className="w-full max-w-md rounded-[28px] p-8 backdrop-blur-md border animate-fade-in"
        style={{
          background: 'rgba(255, 252, 249, 0.75)',
          borderColor: 'rgba(255, 255, 255, 0.5)',
          boxShadow: '0 8px 32px rgba(139, 98, 74, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
        }}
      >
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-serif" style={{ color: '#3D2817' }}>
              Welcome to Closer
            </h1>
            <p className="text-sm font-sans" style={{ color: '#7A6F65' }}>
              Sign in to get started
            </p>
          </div>

          {/* Google Sign In */}
          <button
            onClick={handleGoogleSignIn}
            type="button"
            className="w-full px-6 py-3 rounded-full font-sans font-medium text-sm transition-all duration-300 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3"
            style={{
              background: 'rgba(255, 255, 255, 0.8)',
              border: '1px solid rgba(193, 123, 92, 0.2)',
              color: '#5C4A3E',
              boxShadow: '0 2px 8px rgba(139, 98, 74, 0.08)',
            }}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px" style={{ background: 'rgba(193, 123, 92, 0.2)' }} />
            <span className="text-xs font-sans" style={{ color: '#8B624A', opacity: 0.6 }}>
              or
            </span>
            <div className="flex-1 h-px" style={{ background: 'rgba(193, 123, 92, 0.2)' }} />
          </div>

          {/* Form */}
          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-sm font-sans font-medium"
                style={{ color: '#5C4A3E' }}
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-4 py-3 rounded-2xl font-sans text-sm transition-all duration-200 focus:outline-none focus:ring-2"
                style={{
                  background: 'rgba(255, 255, 255, 0.6)',
                  border: '1px solid rgba(193, 123, 92, 0.2)',
                  color: '#3D2817',
                  '--tw-ring-color': 'rgba(193, 123, 92, 0.3)',
                } as any}
              />
            </div>

            {error && (
              <p className="text-sm font-sans text-error">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 rounded-full font-sans font-medium text-sm transition-all duration-300 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: loading
                  ? 'rgba(193, 123, 92, 0.5)'
                  : 'linear-gradient(135deg, #E89264 0%, #C17B5C 100%)',
                color: '#FFFCF9',
                boxShadow: '0 4px 16px rgba(232, 146, 100, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
              }}
            >
              {loading ? 'Sending...' : 'Send magic link'}
            </button>
          </form>

          {/* Footer */}
          <p className="text-xs font-sans text-center opacity-60" style={{ color: '#8B624A' }}>
            We'll email you a magic link for a password-free sign in.
          </p>
        </div>
      </div>
    </div>
  );
}
