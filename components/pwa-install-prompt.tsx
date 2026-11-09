'use client';

import * as React from 'react';
import { Smartphone, Download, X, Check, Share } from 'lucide-react';
import { Button } from './ui/button';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = React.useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = React.useState(false);
  const [isIOS, setIsIOS] = React.useState(false);
  const [isStandalone, setIsStandalone] = React.useState(false);

  React.useEffect(() => {
    // Register service worker for offline support & PWA installability
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/sw.js').catch(err => {
        console.warn('SW registration skipped:', err);
      });
    }

    // Check if already running as standalone PWA
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as unknown as { standalone?: boolean }).standalone) {
      setIsStandalone(true);
      return;
    }

    // Check iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isAppleDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isAppleDevice);

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // If on iOS or mobile and not standalone, show after brief delay
    const timer = setTimeout(() => {
      if (isAppleDevice && !isStandalone) {
        setShowBanner(true);
      }
    }, 3000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      clearTimeout(timer);
    };
  }, [isStandalone]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  if (!showBanner || isStandalone) return null;

  return (
    <div className="fixed bottom-16 sm:bottom-6 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-in fade-in slide-in-from-bottom-5">
      <div className="p-4 rounded-xl bg-[#FAF8F3] border-2 border-[#173E2C] shadow-2xl flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#173E2C] text-[#FAF8F3] flex items-center justify-center shrink-0 shadow-sm">
          <Smartphone className="w-5 h-5 text-[#FAF8F3]" />
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h4 className="font-serif text-sm font-bold text-[#173E2C]">
              Install Trashify Mobile App
            </h4>
            <button
              onClick={() => setShowBanner(false)}
              className="text-[var(--muted)] hover:text-[var(--ink)] p-1 -mr-1"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-[var(--muted)] mt-1">
            {isIOS ? (
              <span className="flex items-center gap-1">
                Tap <Share className="w-3 h-3 inline text-[#173E2C]" /> Share and choose <strong>Add to Home Screen</strong> for instant Uber-style dispatch.
              </span>
            ) : (
              'Install on your device for instant offline access, GPS verification, and collector dispatch.'
            )}
          </p>

          {!isIOS && deferredPrompt && (
            <div className="mt-3 flex items-center gap-2">
              <Button size="sm" variant="primary" onClick={handleInstallClick}>
                <Download className="w-3.5 h-3.5" />
                <span>Install Now</span>
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setShowBanner(false)}>
                Later
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
