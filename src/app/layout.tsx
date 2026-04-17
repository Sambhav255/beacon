import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://beacon.vercel.app"),
  title: {
    default: "Beacon",
    template: "Beacon · %s",
  },
  description: "A vision prototype by Sambhav Lamichhane.",
  openGraph: {
    title: "Beacon — Market Entry Agent for Modo Energy",
    description: "A vision prototype by Sambhav Lamichhane.",
    images: ["/opengraph-image"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Beacon — Market Entry Agent for Modo Energy",
    description: "A vision prototype by Sambhav Lamichhane.",
    images: ["/opengraph-image"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-bg text-text">{children}</body>
    </html>
  );
}
