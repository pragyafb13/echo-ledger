import { Commitment } from "./types";
import { getSession } from "./auth";

const STORAGE_KEY = "echo-ledger-commitments";

function scopeKey(email?: string | null) {
  return email ? `${STORAGE_KEY}:${email}` : STORAGE_KEY;
}

export function loadCommitments(email?: string | null): Commitment[] {
  if (typeof window === "undefined") return [];
  const session = email === undefined ? getSession() : null;
  const key = scopeKey(email ?? session?.email);
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    return JSON.parse(raw) as Commitment[];
  } catch {
    return [];
  }
}

export function saveCommitments(items: Commitment[], email?: string | null): void {
  if (typeof window === "undefined") return;
  const session = email === undefined ? getSession() : null;
  const key = scopeKey(email ?? session?.email);
  localStorage.setItem(key, JSON.stringify(items));
}

export function addCommitments(newItems: Commitment[], email?: string | null): Commitment[] {
  const existing = loadCommitments(email);
  const merged = [...newItems, ...existing];
  saveCommitments(merged, email);
  return merged;
}

export function updateCommitment(
  id: string,
  patch: Partial<Commitment>,
  email?: string | null
): Commitment[] {
  const items = loadCommitments(email);
  const next = items.map((c) =>
    c.id === id ? { ...c, ...patch, updatedAt: new Date().toISOString() } : c
  );
  saveCommitments(next, email);
  return next;
}

export function deleteCommitment(id: string, email?: string | null): Commitment[] {
  const items = loadCommitments(email).filter((c) => c.id !== id);
  saveCommitments(items, email);
  return items;
}

export function clearAll(email?: string | null): void {
  if (typeof window === "undefined") return;
  const session = email === undefined ? getSession() : null;
  const key = scopeKey(email ?? session?.email);
  localStorage.removeItem(key);
}
