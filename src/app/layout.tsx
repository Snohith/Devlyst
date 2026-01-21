import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://devlyst-web.onrender.com'),
  title: {
    default: "Devlyst | Real-time Collaborative Code Editor",
    template: "%s | Devlyst"
  },
  description: "Experience the future of pair programming with Devlyst. Real-time collaboration, AI assistance, and instant execution in a premium secure environment.",
  keywords: ["code editor", "collaboration", "pair programming", "online ide", "typescript", "react", "yjs", "monaco"],
  authors: [{ name: "Devlyst Team" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://devlyst-web.onrender.com",
    title: "Devlyst | Real-time Collaborative Code Editor",
    description: "Code together, instantly. Features real-time sync, AI copilot, and multi-language execution.",
    siteName: "Devlyst",
    images: [
      {
        url: "/logo.svg", // Fallback to logo until a proper OG image is made
        width: 800,
        height: 600,
        alt: "Devlyst Logo"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Devlyst | Real-time Collaborative Code Editor",
    description: "Code together, instantly. Features real-time sync, AI copilot, and multi-language execution.",
  },
  icons: {
    icon: "/icon.svg",
    apple: "/apple-touch-icon.png",
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Devlyst'
  },
  formatDetection: {
    telephone: false
  }
};




import { ClerkProvider } from "@clerk/nextjs";
import Script from "next/script";
import { InstallPrompt } from "@/components/InstallPrompt";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          {/* Plausible Analytics - Privacy-focused, GDPR compliant */}
          {process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN && (
            <Script
              defer
              data-domain={process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN}
              src="https://plausible.io/js/script.js"
            />
          )}
        </head>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          {/* Skip to main content link for accessibility */}
          <a
            href="#main-content"
            className="sr-only focus-visible:not-sr-only focus-visible:absolute focus-visible:top-4 focus-visible:left-4 focus-visible:z-50 focus-visible:px-4 focus-visible:py-2 focus-visible:bg-white focus-visible:text-black focus-visible:rounded-lg focus-visible:shadow-lg"
          >
            Skip to main content
          </a>
          <InstallPrompt />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}

