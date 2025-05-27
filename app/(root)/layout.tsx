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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang='en'>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        </head>
        <body className={inter.className}>
          <ThemeProvider>
            <Topbar />

            <main className='flex flex-row'>
              <LeftSidebar />
              <section className='main-container'>
                <div className='w-full max-w-4xl'>{children}</div>
              </section>
              <RightSidebar />
            </main>

            <Bottombar />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
