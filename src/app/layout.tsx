import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ScholarForge | AI-Powered Research Workspace",
  description: "A local-first, AI-powered workspace for writing research papers with LaTeX precision.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`} style={{ colorScheme: 'dark' }}>
        <body className="min-h-full bg-base text-primary font-sans">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
