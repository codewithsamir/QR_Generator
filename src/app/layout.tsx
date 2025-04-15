import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Analytics } from "@vercel/analytics/react"
// Improved Metadata for SEO
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://get-qr-generator.vercel.app/"; // Replace with your actual URL or use env var
const siteTitle = "Free QR Code Generator | Create Custom QR Codes Online";
const siteDescription = "Easily create custom QR codes online for websites, text, PDFs, and images. Customize colors, size, and error correction. Free, fast, and responsive.";
const ogImageUrl = process.env.NEXT_PUBLIC_OG_IMAGE_URL || `${siteUrl}/.png`; // Use env var or construct

export const metadata: Metadata = {
  metadataBase: process.env.NEXT_PUBLIC_SITE_URL ? new URL(process.env.NEXT_PUBLIC_SITE_URL) : new URL("https://get-qr-generator.vercel.app/"),
  title: siteTitle,
  description: siteDescription,
  keywords: ["QR code generator", "free QR code", "custom QR code", "online QR code", "QR code creator", "website QR", "text QR", "PDF QR", "image QR"],
  // Open Graph Metadata
  openGraph: {
    type: 'website',
    url: siteUrl,
    title: siteTitle,
    description: siteDescription,
    images: [
      {
        url: ogImageUrl,
        width: 1200,
        height: 630,
        alt: 'QR Code Generator Tool Preview',
      },
    ],
    siteName: siteTitle,
  },
  // Twitter Card Metadata
  twitter: {
    card: 'summary_large_image',
    // site: '@yourTwitterHandle', // Optional: Add your Twitter handle
    // creator: '@yourTwitterHandle', // Optional: Add creator handle
    title: siteTitle,
    description: siteDescription,
    images: [ogImageUrl], // Must be an absolute URL
  },
  // Favicon and Icons (Metadata approach)
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any', type: 'image/x-icon' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-touch-icon.png', // For Apple devices
    // Add other icons if needed (e.g., shortcut)
  },
  manifest: '/site.webmanifest', // For PWA capabilities
  // Other relevant metadata
  // Try setting metadataBase directly with a fallback
  // metadataBase: process.env.NEXT_PUBLIC_SITE_URL ? new URL(process.env.NEXT_PUBLIC_SITE_URL) : new URL("https://yourdomain.com"), // Commented out to fix linter block
  alternates: {
    canonical: '/', // Assuming this is the root page of the siteUrl
  },
  robots: { // Basic robots directive
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  // Google Site Verification
  verification: {
    google: '0h6mLogELJG-SKu5XC5V5dTzYRqmcD02VKnpBTtHbz4',
    // Add other verification tags if needed (e.g., yandex, other)
  },
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* 
        Favicon links can also be placed directly in head if preferred, 
        but Next.js metadata object is the recommended way.
        <head>
          <link rel="icon" href="/favicon.ico" sizes="any" />
          <link rel="icon" href="/icon.svg" type="image/svg+xml" />
          <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
          <link rel="manifest" href="/site.webmanifest" />
        </head>
      */}
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Analytics/>
        
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
