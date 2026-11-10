import type { DatabaseSync } from 'node:sqlite';

export function storage(): DatabaseSync;
export function transaction<T>(work: (database: DatabaseSync) => T): T;
