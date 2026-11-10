export const workspaces = {
  resident: { label: 'Resident', description: 'Book a pickup and report a collection problem.', path: '/pickups' },
  collector: { label: 'Collector', description: 'Manage assigned pickups and confirm collections.', path: '/jobs' },
  estate: { label: 'Estate manager', description: 'See collection reliability across your estate.', path: '/dashboard' },
  municipal: { label: 'Municipal team', description: 'Monitor sanitation services across your service districts.', path: '/dashboard' },
} as const;

export type Role = keyof typeof workspaces;

export function isRole(role: unknown): role is Role {
  return typeof role === 'string' && Object.hasOwn(workspaces, role);
}
