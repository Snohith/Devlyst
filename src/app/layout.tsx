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
  title: {
    default: "Devlyst | Real-time Collaborative Code Editor",
    template: "%s | Devlyst"
  },
  description: "Experience the future of pair programming with Devlyst. Real-time collaboration, AI assistance, and instant execution in a premium secure environment.",
  keywords: ["code editor", "collaboration", "pair programming", "online ide", "typescript", "react"],
  authors: [{ name: "Devlyst Team" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://devlyst.com",
    title: "Devlyst | Real-time Collaborative Code Editor",
    description: "Code together, instantly. Features real-time sync, AI copilot, and multi-language execution.",
    siteName: "Devlyst",
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
        {children}
      </body>
    </html>
  );
}

