import type { Metadata } from "next";
import { Permanent_Marker } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import { Providers } from "@/components/Providers";

// Permanent Marker - bold hand-drawn marker style
const permanentMarker = Permanent_Marker({
  subsets: ["latin"],
  weight: ["400"],
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
    <html lang="en" className={permanentMarker.variable}>
      <body className="min-h-screen bg-[#FAF7F4] relative overflow-x-hidden font-sans">
        <Providers>
          {/* Clean bone white background with subtle paper texture (in globals.css) */}

          {/* Hand-drawn illustration at the bottom */}
          <div
            className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md h-[300px] pointer-events-none z-0"
            style={{
              backgroundImage: 'url(/images/closer-background.jpg)',
              backgroundSize: 'contain',
              backgroundPosition: 'bottom center',
              backgroundRepeat: 'no-repeat',
              opacity: 0.08, // Very subtle
              mixBlendMode: 'multiply',
            }}
          />

          {/* Content */}
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
