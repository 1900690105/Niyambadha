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

// 🔥 Full SEO Metadata
export const metadata = {
  title: {
    default: "Niyambadha – Focus & Productivity Platform",
    template: "%s | Niyambadha",
  },
  description:
    "Niyambadha helps you stay focused by blocking distracting websites and guiding you through productivity challenges. Improve discipline and boost your workflow.",
  keywords: [
    "focus",
    "productivity",
    "website blocker",
    "chrome extension",
    "discipline tool",
    "study tool",
    "niyambadha",
  ],
  authors: [{ name: "Niyambadha Team" }],
  creator: "Niyambadha",
  publisher: "Niyambadha",

  metadataBase: new URL("https://niyambadha.com"),

  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://niyambadha.com",
    siteName: "Niyambadha",
    title: "Niyambadha – Stay Focused, Block Distractions",
    description:
      "A smart productivity platform that blocks distractions and helps you develop discipline.",
    images: [
      {
        url: "https://niyambadha.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "Niyambadha – Focus Productivity Platform",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Niyambadha – Focus & Productivity",
    description:
      "Stay focused, eliminate distractions, and build productive habits.",
    creator: "@niyambadha",
    images: ["https://niyambadha.com/og-image.png"],
  },

  // Optional extra SEO info
  category: "productivity",

  // Favicon
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "Niyambadha",
              url: "https://niyambadha.vercel.app",
              description:
                "Niyambadha helps you stay focused by blocking distracting websites and guiding you through productivity challenges.",
            }),
          }}
        />

        {children}
      </body>
    </html>
  );
}
