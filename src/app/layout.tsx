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

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://postcoach-mini.vercel.app";

const frame = {
  version: "1",
  imageUrl: `${appUrl}/og-image.png`,
  button: {
    title: "Get My Analysis",
    action: {
      type: "launch_miniapp",
      name: "Tenor",
      url: appUrl,
      splashImageUrl: `${appUrl}/splash.png`,
      splashBackgroundColor: "#ffffff"
    }
  }
};

export const metadata: Metadata = {
  title: "Tenor - Optimize your reach",
  description: "Optimize your reach. Get AI-powered feedback on your Farcaster posts and a personalized weekly brief.",
  openGraph: {
    title: "Tenor",
    description: "Optimize your reach",
    images: [`${appUrl}/og-image.png`],
  },
  other: {
    "fc:miniapp": JSON.stringify(frame),
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
