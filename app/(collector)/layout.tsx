import { Suspense, type ReactNode } from 'react';
import { requireWorkspace } from '@/lib/auth';

async function Workspace({ children }: { children: ReactNode }) {
  await requireWorkspace(['collector']);
  return children;
}

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<p className="mx-auto max-w-5xl p-6">Loading workspace…</p>}>
      <Workspace>{children}</Workspace>
    </Suspense>
  );
}
