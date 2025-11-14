import type React from "react"
import type { Metadata } from "next"

import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

import { Geist, Geist_Mono, Geist as V0_Font_Geist, Geist_Mono as V0_Font_Geist_Mono, Source_Serif_4 as V0_Font_Source_Serif_4 } from 'next/font/google'

// Initialize fonts (optimized: only load necessary weights for mobile performance)
const _geist = V0_Font_Geist({
  subsets: ['latin'],
  weight: ["400","500","600","700"],
  display: 'swap',
  preload: true
})
const _geistMono = V0_Font_Geist_Mono({
  subsets: ['latin'],
  weight: ["400","500","600"],
  display: 'swap',
  preload: false
})
const _sourceSerif_4 = V0_Font_Source_Serif_4({
  subsets: ['latin'],
  weight: ["400","600","700"],
  display: 'swap',
  preload: false
})

export const metadata: Metadata = {
  title: "Mariam Guide: Islamic remembrance",
  description: "Daily Islamic supplications, Hadith collection, and Quran reading",
  generator: "v0.app",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
  },
  themeColor: "#3b82f6",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Mariam Guide",
  },
  formatDetection: {
    telephone: false,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        {/* Preconnect to external API domains for faster requests on mobile */}
        <link rel="preconnect" href="https://api.alquran.cloud" />
        <link rel="preconnect" href="https://api.aladhan.com" />
        <link rel="preconnect" href="https://api.bigdatacloud.net" />
        <link rel="dns-prefetch" href="https://api.alquran.cloud" />
        <link rel="dns-prefetch" href="https://api.aladhan.com" />
        <link rel="dns-prefetch" href="https://api.bigdatacloud.net" />
      </head>
      <body className={`font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
