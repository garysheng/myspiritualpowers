import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { AuthProvider } from "@/contexts/auth-context";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MySpiritualPowers.com - Discover Your Spiritual Gifts",
  description: "Take our interactive quiz to discover your unique spiritual gifts and superpowers. Get personalized insights and learn how to use your gifts to make a difference.",
  metadataBase: new URL('https://myspiritualpowers.com'),
  openGraph: {
    title: "Discover Your Spiritual Powers",
    description: "Take the quiz to uncover your unique gifts",
    url: 'https://myspiritualpowers.com',
    siteName: 'MySpiritualPowers.com',
    locale: 'en_US',
    images: [{
      url: '/og.png',
      width: 1748,
      height: 852,
      alt: 'MySpiritualPowers.com - Discover Your Spiritual Gifts',
    }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Discover Your Spiritual Powers',
    description: 'Take the quiz to uncover your unique gifts',
    images: ['/og.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen bg-background text-foreground antialiased`}>
        <AuthProvider>
          <Header />
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
