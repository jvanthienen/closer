import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import { Providers } from "@/components/Providers";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-serif",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Closer",
  description: "A warm app that helps you call friends around the world",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${cormorant.variable} ${dmSans.variable}`}>
      <body className="min-h-screen bg-[#F5EBE0] relative overflow-x-hidden">
        <Providers>
          {/* Blurred background with warmer tone */}
          <div
            className="fixed inset-0 z-0"
            style={{
              backgroundImage: 'url(/images/sand-dunes.jpg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'blur(50px) saturate(1.2)',
              opacity: 0.35,
              transform: 'scale(1.1)',
            }}
          />

          {/* Warm glow overlay */}
          <div
            className="fixed inset-0 z-0 pointer-events-none"
            style={{
              background: 'radial-gradient(circle at 50% 20%, rgba(232, 146, 100, 0.12) 0%, transparent 60%)',
            }}
          />

          {/* Subtle texture overlay */}
          <div
            className="fixed inset-0 z-0 pointer-events-none opacity-[0.03]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`,
            }}
          />

          {/* Content overlay */}
          <div className="relative z-10 max-w-md mx-auto min-h-screen flex flex-col">
            <main className="flex-1 pb-24 px-5 pt-8">
              {children}
            </main>
            <BottomNav />
          </div>
        </Providers>
      </body>
    </html>
  );
}
