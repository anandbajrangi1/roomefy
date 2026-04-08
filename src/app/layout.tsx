import type { Metadata, Viewport } from "next";
import "./globals.css";
import AuthProvider from "@/components/providers/AuthProvider";

export const viewport: Viewport = {
  viewportFit: 'cover',
  themeColor: '#e72e3d',
};

export const metadata: Metadata = {
  title: "Roomefy - Premium Shared Accommodation | Luxury Living at Affordable Prices",
  description: "Find premium furnished rooms in shared flats at affordable prices. Perfect for corporate employees in prime locations across India.",
  keywords: "room rental, shared flat, corporate housing, furnished rooms, affordable luxury, premium accommodation",
  authors: [{ name: "Roomefy" }],
  openGraph: {
    title: "Roomefy - Luxury Living at Affordable Prices",
    description: "Premium furnished rooms in prime locations for corporate professionals",
    url: "https://roomrental.com/",
    type: "website",
    images: [{ url: "https://roomrental.com/images/og-image.jpg" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Premium Shared Accommodation for Professionals",
    description: "Luxury living at affordable prices with premium amenities",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body suppressHydrationWarning>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
