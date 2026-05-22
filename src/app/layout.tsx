import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ui/ThemeProvider";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

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
    default: "MySoftTools - Premium 100% Free & Secure Online Utilities",
    template: "%s | MySoftTools",
  },
  description:
    "Explore 50+ modern, privacy-first online tools for images, PDFs, text, and calculations. Processes fully locally in your browser with absolute security.",
  metadataBase: new URL("https://mysofttools.com"),
  keywords: [
    "online text tools",
    "image compressor",
    "pdf unlocker",
    "free calculators",
    "json formatter",
    "base64 encoder",
    "word counter",
    "privacy tools",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "MySoftTools - Free & Secure Online Utilities",
    description:
      "Explore 50+ modern, privacy-first online tools. 100% browser-based execution ensures files never leave your device.",
    url: "https://mysofttools.com",
    siteName: "MySoftTools",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MySoftTools - Free & Secure Online Utilities",
    description:
      "Explore 50+ modern, privacy-first online tools. 100% browser-based execution ensures files never leave your device.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* Anti-SSR Theme Flashing Script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const stored = localStorage.getItem('theme');
                  if (stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (_) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground transition-colors duration-200">
        <ThemeProvider>
          <Header />
          <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
            {children}
          </main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
