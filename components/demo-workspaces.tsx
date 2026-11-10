'use client';

import { useState } from 'react';
import { ArrowRight, Building2, Home, Truck, Landmark } from 'lucide-react';
import { type Role, workspaces } from '@/lib/roles';

const icons = { resident: Home, collector: Truck, estate: Building2, municipal: Landmark };
const previews = {
  resident: 'Book at a sample address, find your pickup PIN and report a sanitation issue.',
  collector: 'Start an assigned pickup and try the PIN check with a simulated location.',
  estate: 'See overdue pickups, compare collection times and close a resident report.',
  municipal: 'Review district service metrics and download a sample aggregate CSV.',
};

export function DemoWorkspaces({ current }: { current?: Role }) {
  const [opening, setOpening] = useState<Role | null>(null);
  const [error, setError] = useState('');

  async function open(role: Role) {
    if (opening) return;
    setOpening(role);
    setError('');
    try {
      const response = await fetch('/api/demo', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ role }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      // A new document ensures the selected role's session drives all workspace reads.
      window.location.assign(data.path);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Could not open the demo.');
      setOpening(null);
    }
  }

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2">
        {(Object.keys(workspaces) as Role[]).map((role) => {
          const Icon = icons[role];
          return (
            <button type="button" key={role} disabled={Boolean(opening)} onClick={() => void open(role)}
              className="flex items-start gap-4 rounded-md border border-[var(--line-2)] bg-[var(--surface)] p-5 text-left hover:border-[var(--accent)] hover:bg-[var(--surface-2)] disabled:opacity-60">
              <Icon className="mt-1 shrink-0 text-[var(--accent)]" size={20} aria-hidden />
              <span className="flex-1">
                <span className="block font-semibold">{workspaces[role].label}{current === role ? ' · Current' : ''}</span>
                <span className="mt-1 block text-sm text-[var(--muted)]">{previews[role]}</span>
              </span>
              {opening === role ? <span className="text-xs">Opening…</span> : <ArrowRight size={16} className="mt-1 shrink-0" aria-hidden />}
            </button>
          );
        })}
      </div>
      {error && <p role="alert" className="mt-4 text-sm text-[var(--red-tx)]">{error}</p>}
    </>
  );
}
