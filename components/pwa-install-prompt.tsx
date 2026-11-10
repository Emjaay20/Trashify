'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from './ui/button';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
}

export function PwaInstallPrompt() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIOSHelp, setShowIOSHelp] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        console.warn('Could not register Trashify’s offline page.');
      });
    }

    const iosStandalone = (navigator as Navigator & { standalone?: boolean }).standalone;
    if (iosStandalone || window.matchMedia('(display-mode: standalone)').matches) return;

    function offerInstall(event: Event) {
      event.preventDefault();
      setPrompt(event as BeforeInstallPromptEvent);
    }

    window.addEventListener('beforeinstallprompt', offerInstall);
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const timer = isIOS ? setTimeout(() => setShowIOSHelp(true), 1800) : undefined;
    return () => {
      window.removeEventListener('beforeinstallprompt', offerInstall);
      clearTimeout(timer);
    };
  }, []);

  if (dismissed || (!prompt && !showIOSHelp)) return null;

  return (
    <aside className="mx-auto my-6 flex w-[calc(100%-2.5rem)] max-w-lg items-start gap-4 rounded-md border border-[var(--line)] bg-[var(--surface)] p-4">
      <div className="flex-1">
        <h2 className="font-semibold">Add Trashify to your home screen</h2>
        {prompt ? (
          <Button size="sm" className="mt-2" onClick={async () => {
            setPrompt(null);
            try {
              await prompt.prompt();
            } catch {
              setDismissed(true);
            }
          }}>Install</Button>
        ) : (
          <p className="mt-1 text-sm text-[var(--muted)]">In Safari, tap Share, then Add to Home Screen.</p>
        )}
      </div>
      <button type="button" aria-label="Dismiss install help" onClick={() => setDismissed(true)}><X size={18} /></button>
    </aside>
  );
}
