import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import UserMenu from "@/components/UserMenu";
import { Providers } from "@/components/Providers";

// Friendly, rounded sans-serif for the playful hand-drawn aesthetic
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
    <html lang="en" className={dmSans.variable}>
      <body className="min-h-screen bg-[#FAF7F4] relative overflow-x-hidden font-sans">
        <Providers>
          {/* Clean bone white background with subtle paper texture (in globals.css) */}

          {/* User menu */}
          <UserMenu />

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
