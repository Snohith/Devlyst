import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { ClerkProvider } from "@clerk/nextjs";
import { InstallPrompt } from "@/components/InstallPrompt";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://devlyst-web.onrender.com";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "Devlyst | Real-time Collaborative Code Editor",
    template: "%s | Devlyst"
  },
  description: "Pair programming in the browser: real-time collaborative editing, 12 executable languages and instant results.",
  keywords: ["code editor", "collaboration", "pair programming", "online ide", "typescript", "react", "yjs", "monaco"],
  authors: [{ name: "Devlyst Team" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: appUrl,
    title: "Devlyst | Real-time Collaborative Code Editor",
    description: "Code together, instantly. Real-time sync across a shared Monaco editor with multi-language execution.",
    siteName: "Devlyst",
    images: [
      {
        url: "/logo.svg",
        width: 800,
        height: 600,
        alt: "Devlyst Logo"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Devlyst | Real-time Collaborative Code Editor",
    description: "Code together, instantly. Real-time sync across a shared Monaco editor with multi-language execution.",
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.png",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Devlyst"
  },
  formatDetection: {
    telephone: false
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Clerk is optional: builds and self-hosted copies work without keys, the
  // sign-in buttons are simply replaced by a developer shortcut.
  const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  const content = (
    <html lang="en">
      <head />
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
        {process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN && (
          <Script
            strategy="afterInteractive"
            data-domain={process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN}
            src="https://plausible.io/js/script.js"
          />
        )}
        <InstallPrompt />
        {children}
      </body>
    </html>
  );

  if (!clerkKey) {
    return content;
  }

  return (
    <ClerkProvider>
      {content}
    </ClerkProvider>
  );
}

