import type { Metadata } from "next";
import { Syne, DM_Mono } from "next/font/google";
import "./globals.css";
import { SWRProvider } from "./swr-provider";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { LayoutTransitions } from "@/components/LayoutTransitions";

const syne = Syne({ 
  subsets: ["latin"],
  variable: "--font-display",
});

const dmMono = DM_Mono({
  weight: ["300", "400", "500"],
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  ),
  title: "Nova Pay | DeFi on Stellar Soroban",
  description: "Experience the fastest AMM on Stellar. Swap VOLT, provide liquidity, and earn protocol fees with advanced Soroban smart contracts.",
  openGraph: {
    title: "Nova Pay",
    description: "The premier AMM and Liquidity Protocol on Stellar Soroban.",
    url: "https://novapay.vercel.app",
    siteName: "Nova Pay",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nova Pay",
    description: "High-voltage DeFi on Stellar Testnet",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${syne.variable} ${dmMono.variable}`}>
      <head>
        <link href="https://api.fontshare.com/v2/css?f[]=cabinet-grotesk@100,200,300,400,500,700,800,900&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased min-h-screen flex flex-col">
        <ErrorBoundary>
          <SWRProvider>
            <Navbar />
            <main className="flex-grow flex flex-col">
              {children}
            </main>
            <Footer />
          </SWRProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
