import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: "%s | DocuMate",
    default: "DocuMate",
  },
  description: "A RAG-powered document assistant built with Next.js, Supabase, and Google Gemini that enables semantic chat with PDF files. Features high-speed vector search and strict context grounding to deliver accurate, hallucination-free answers.",
  icons: {
    icon: 'icon.png',
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Toaster position="top-right" richColors={true}/>
        {children}
      </body>
    </html>
  );
}
