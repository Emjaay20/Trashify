import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { MobileNav } from "@/components/mobile-nav";
import { PwaInstallPrompt } from "@/components/pwa-install-prompt";

export const metadata: Metadata = {
  title: "Trashify × ResolveGrid — Smarter Waste Collection on Nigeria's Digital Postcode",
  description: "Request a waste pickup as easily as ordering a ride. Powered by ResolveGrid location intelligence and the NIPOST National Digital Postcode API.",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg"
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Trashify"
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#173E2C"
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[var(--bg)] text-[var(--ink)] pb-16 md:pb-0">
        <Suspense fallback={<div className="h-16 border-b border-[var(--line)] bg-[var(--surface)]" />}>
          <Navbar />
        </Suspense>
        <main className="flex-1">{children}</main>
        <Suspense fallback={null}>
          <MobileNav />
        </Suspense>
        <PwaInstallPrompt />
      </body>
    </html>
  );
}
