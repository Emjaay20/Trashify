import { Suspense, type ReactNode } from 'react';
import { DemoModeProvider } from '@/components/demo-mode';
import { requireWorkspace } from '@/lib/auth';

async function Workspace({ children }: { children: ReactNode }) {
  const account = await requireWorkspace(['resident']);
  return <DemoModeProvider demo={Boolean(account.demoGroup)}>{children}</DemoModeProvider>;
}

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<p className="mx-auto max-w-5xl p-6">Loading workspace…</p>}>
      <Workspace>{children}</Workspace>
    </Suspense>
  );
}
