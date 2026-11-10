import { DatabaseSync } from 'node:sqlite';
import { closeSync, mkdirSync, openSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

let database;

export function storage() {
  if (database) return database;
  const path = resolve(/*turbopackIgnore: true*/ process.env.TRASHIFY_DB_PATH || '.data/trashify.sqlite');
  mkdirSync(dirname(path), { recursive: true, mode: 0o700 });
  closeSync(openSync(path, 'a', 0o600));
  const db = new DatabaseSync(path);
  db.exec(`
    PRAGMA busy_timeout = 5000;
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;
    CREATE TABLE IF NOT EXISTS accounts (
      id TEXT PRIMARY KEY, email TEXT NOT NULL UNIQUE, name TEXT NOT NULL,
      password TEXT NOT NULL, role TEXT NOT NULL, scope TEXT NOT NULL,
      active INTEGER NOT NULL, collector TEXT
    );
    CREATE TABLE IF NOT EXISTS demo_groups (
      id TEXT PRIMARY KEY, expires INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS demo_accounts (
      account_id TEXT PRIMARY KEY REFERENCES accounts(id),
      group_id TEXT NOT NULL REFERENCES demo_groups(id),
      role TEXT NOT NULL,
      UNIQUE(group_id, role)
    );
    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY, account_id TEXT NOT NULL REFERENCES accounts(id), expires INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS password_resets (
      account_id TEXT PRIMARY KEY REFERENCES accounts(id), token TEXT NOT NULL UNIQUE, expires INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS invitations (
      token TEXT PRIMARY KEY, email TEXT NOT NULL, role TEXT NOT NULL, scope TEXT NOT NULL, expires INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS jobs (
      id TEXT PRIMARY KEY, owner_id TEXT NOT NULL REFERENCES accounts(id), estate TEXT NOT NULL,
      zone TEXT NOT NULL, collector_id TEXT REFERENCES accounts(id), created TEXT NOT NULL, data TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS booking_requests (
      account_id TEXT NOT NULL REFERENCES accounts(id), request_id TEXT NOT NULL,
      job_id TEXT NOT NULL REFERENCES jobs(id), PRIMARY KEY (account_id, request_id)
    );
    CREATE INDEX IF NOT EXISTS jobs_owner ON jobs(owner_id, created);
    CREATE INDEX IF NOT EXISTS jobs_collector ON jobs(collector_id, created);
    CREATE INDEX IF NOT EXISTS jobs_estate ON jobs(estate, created);
    CREATE INDEX IF NOT EXISTS jobs_zone ON jobs(zone, created);
    CREATE TABLE IF NOT EXISTS reports (
      id TEXT PRIMARY KEY, job_id TEXT NOT NULL REFERENCES jobs(id), kind TEXT NOT NULL,
      created TEXT NOT NULL, closed TEXT, closed_by TEXT REFERENCES accounts(id),
      UNIQUE(job_id, kind)
    );
    CREATE TABLE IF NOT EXISTS report_location (
      report_id TEXT PRIMARY KEY REFERENCES reports(id)
    );
    CREATE TABLE IF NOT EXISTS throttle (
      key TEXT PRIMARY KEY, attempts INTEGER NOT NULL, expires INTEGER NOT NULL
    );
  `);
  database = db;
  return database;
}

export function transaction(work) {
  const db = storage();
  db.exec('BEGIN IMMEDIATE');
  try {
    const result = work(db);
    db.exec('COMMIT');
    return result;
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}
