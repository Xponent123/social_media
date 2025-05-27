import { Metadata } from "next/types";
import "./globals.css";

export const metadata: Metadata = {
  title: "ConnectX",
  description: "A modern social networking platform",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Add explicit viewport meta tag in addition to the metadata API */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body>{children}</body>
    </html>
  );
}
