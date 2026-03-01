import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Tracker Smart Habit | For All Your Activities",
  description:
    "Build better habits with AI that understands your lifestyle. Track, analyze, and improve with personalized AI insights.",
  keywords: ["habit tracker", "productivity", "AI insights", "goal tracking"],
  openGraph: {
    title: "Tracker Smart Habit | For All Your Activities",
    description: "Build better habits with AI that understands your lifestyle.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
