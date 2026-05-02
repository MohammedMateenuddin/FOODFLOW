import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingHelp from "@/components/FloatingHelp";
import { Toaster } from "sonner";
import PageTransition from "@/components/PageTransition";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

export const viewport: Viewport = {
  themeColor: "#10b981",
}

export const metadata: Metadata = {
  title: 'FoodFlow — Air Traffic Control for Surplus Food',
  description: 'AI-powered platform rescuing surplus food from restaurants and hotels, matching it with NGOs and orphanages before it expires. Zero waste guaranteed.',
  keywords: 'food waste, food rescue, NGO, surplus food, India, food donation, zero hunger, sustainability',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'FoodFlow — Where Surplus Becomes Meals',
    description: '67 million tonnes of food wasted in India yearly. 190 million go hungry. We\'re fixing that.',
    url: 'https://foodflow.in',
    siteName: 'FoodFlow',
    images: [{
      url: '/og-image.png',
      width: 1200,
      height: 630,
      alt: 'FoodFlow — Air Traffic Control for Surplus Food'
    }],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FoodFlow — Air Traffic Control for Surplus Food',
    description: 'Zero food waste. Maximum impact.',
    images: ['/og-image.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} font-sans antialiased bg-[#08090A] text-[#e3e2e3]`}
      >
        <Navbar />
        <main className="pt-20 min-h-screen flex flex-col">
          <PageTransition>{children}</PageTransition>
        </main>
        <Footer />
        <FloatingHelp />
        <Toaster
          theme="dark"
        />
      </body>
    </html>
  );
}
