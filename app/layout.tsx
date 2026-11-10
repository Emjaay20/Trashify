import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { currentAccount } from "@/lib/auth";
import { PwaInstallPrompt } from "@/components/pwa-install-prompt";

export const metadata: Metadata = {
  title: "Trashify | Waste pickup in Abuja",
  description: "Book and track a waste pickup in Abuja.",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon.svg",
    apple: "/icon-192.png"
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
  themeColor: "#41357e"
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[var(--bg)] text-[var(--ink)]">
        <Suspense fallback={<div className="h-16 border-b border-[var(--line)] bg-[var(--surface)]" />}>
          <AccountNavigation />
        </Suspense>
        <main className="flex-1">{children}</main>
        <PwaInstallPrompt />
      </body>
    </html>
  );
}

async function AccountNavigation() {
  const account = await currentAccount();
  return <Navbar viewer={account ? { role: account.role, active: Boolean(account.active), demo: Boolean(account.demoGroup) } : null} />;
}
