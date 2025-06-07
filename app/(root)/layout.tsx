import React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";

import "../globals.css";
import { ThemeProvider } from "@/context/ThemeProvider";
import LeftSidebar from "@/components/shared/LeftSidebar";
import Bottombar from "@/components/shared/Bottombar";
import RightSidebar from "@/components/shared/RightSidebar";
import Topbar from "@/components/shared/Topbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ConnectX",
  description: "A modern social media platform",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
  // Add icons metadata for Next.js 13+ App Router convention
  icons: {
    icon: '/logo.png', // Path relative to the public folder
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang='en' suppressHydrationWarning={true}>
        <head>
          {/* Standard favicon links (can be redundant if using Next.js metadata.icons but good for broader compatibility) */}
          <link rel="icon" href="/logo.png" type="image/png" />
          <link rel="shortcut icon" href="/logo.png" type="image/png" />
          <link rel="apple-touch-icon" href="/logo.png" />
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        </head>
        <body className={inter.className} suppressHydrationWarning={true}>
          <ThemeProvider>
            <Topbar />

            <div className="layout-container">
              <LeftSidebar />
              <main className='main-container'>
                <div className='content-container'>{children}</div>
              </main>
              <RightSidebar />
            </div>

            <Bottombar />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
