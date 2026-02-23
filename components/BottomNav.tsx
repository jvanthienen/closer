"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function BottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  const isActive = (path: string) => pathname === path;

  // Don't show nav on auth page
  if (pathname === '/auth' || !user) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 pb-safe">
      <div className="max-w-md mx-auto px-4 pb-4">
        {/* Warm glow behind nav */}
        <div
          className="absolute inset-x-4 bottom-4 h-20 rounded-[28px] opacity-60 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 50% 50%, rgba(232, 146, 100, 0.2) 0%, transparent 70%)',
            filter: 'blur(24px)',
          }}
        />

        {/* Nav container */}
        <div
          className="relative rounded-[28px] px-6 py-3 backdrop-blur-xl border"
          style={{
            background: 'rgba(255, 252, 249, 0.85)',
            borderColor: 'rgba(255, 255, 255, 0.6)',
            boxShadow: '0 8px 32px rgba(139, 98, 74, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
          }}
        >
          <div className="flex justify-around items-center">
            <Link
              href="/"
              className="relative flex flex-col items-center gap-1.5 py-2 px-6 transition-all duration-300"
            >
              {/* Active indicator */}
              {isActive("/") && (
                <div
                  className="absolute inset-0 rounded-2xl animate-fade-in"
                  style={{
                    background: 'linear-gradient(135deg, rgba(232, 146, 100, 0.12) 0%, rgba(193, 123, 92, 0.08) 100%)',
                  }}
                />
              )}

              <svg
                className={`w-6 h-6 relative z-10 transition-all duration-300 ${
                  isActive("/") ? "scale-110" : ""
                }`}
                fill="none"
                stroke={isActive("/") ? "#C17B5C" : "#A08A7A"}
                strokeWidth={isActive("/") ? "2.5" : "2"}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              <span
                className={`text-xs font-sans font-medium relative z-10 transition-all duration-300 ${
                  isActive("/") ? "opacity-100" : "opacity-60"
                }`}
                style={{ color: isActive("/") ? "#C17B5C" : "#8B624A" }}
              >
                Home
              </span>

              {/* Active dot indicator */}
              {isActive("/") && (
                <div
                  className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full animate-fade-in"
                  style={{
                    background: '#C17B5C',
                  }}
                />
              )}
            </Link>

            <Link
              href="/friends"
              className="relative flex flex-col items-center gap-1.5 py-2 px-6 transition-all duration-300"
            >
              {/* Active indicator */}
              {isActive("/friends") && (
                <div
                  className="absolute inset-0 rounded-2xl animate-fade-in"
                  style={{
                    background: 'linear-gradient(135deg, rgba(232, 146, 100, 0.12) 0%, rgba(193, 123, 92, 0.08) 100%)',
                  }}
                />
              )}

              <svg
                className={`w-6 h-6 relative z-10 transition-all duration-300 ${
                  isActive("/friends") ? "scale-110" : ""
                }`}
                fill="none"
                stroke={isActive("/friends") ? "#C17B5C" : "#A08A7A"}
                strokeWidth={isActive("/friends") ? "2.5" : "2"}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
              <span
                className={`text-xs font-sans font-medium relative z-10 transition-all duration-300 ${
                  isActive("/friends") ? "opacity-100" : "opacity-60"
                }`}
                style={{ color: isActive("/friends") ? "#C17B5C" : "#8B624A" }}
              >
                Friends
              </span>

              {/* Active dot indicator */}
              {isActive("/friends") && (
                <div
                  className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full animate-fade-in"
                  style={{
                    background: '#C17B5C',
                  }}
                />
              )}
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
