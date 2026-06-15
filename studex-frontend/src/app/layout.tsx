import type { Metadata } from "next";
import { Geist, Geist_Mono, Bitter } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const bitter = Bitter({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: "variable",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import Providers from './providers';

export const metadata: Metadata = {
  title: "StudEx — Student Express",
  description: "Platform jastip mahasiswa kampus",
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} ${bitter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#F5F5F7]">
        <Providers>
          <div className="mx-auto w-full max-w-[430px] min-h-screen flex flex-col bg-white relative">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
