import { Commitment } from "./types";

const STORAGE_KEY = "echo-ledger-commitments";

export function loadCommitments(): Commitment[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Commitment[];
  } catch {
    return [];
  }
}

export function saveCommitments(items: Commitment[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function addCommitments(newItems: Commitment[]): Commitment[] {
  const existing = loadCommitments();
  const merged = [...newItems, ...existing];
  saveCommitments(merged);
  return merged;
}

export function updateCommitment(id: string, patch: Partial<Commitment>): Commitment[] {
  const items = loadCommitments();
  const next = items.map((c) =>
    c.id === id ? { ...c, ...patch, updatedAt: new Date().toISOString() } : c
  );
  saveCommitments(next);
  return next;
}

export function deleteCommitment(id: string): Commitment[] {
  const items = loadCommitments().filter((c) => c.id !== id);
  saveCommitments(items);
  return items;
}

export function clearAll(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}
