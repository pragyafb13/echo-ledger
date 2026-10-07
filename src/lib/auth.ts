import {
  FREE_LIMITS,
  PASSES,
  PRO_LIMITS,
  PassKind,
  Plan,
  Session,
  UserAccount,
} from "./types";

const USERS_KEY = "echo-ledger-users";
const SESSION_KEY = "echo-ledger-session";

function monthKey() {
  return new Date().toISOString().slice(0, 7);
}

export function isProActive(user: { plan: Plan; proUntil?: string | null }): boolean {
  if (user.proUntil) {
    return new Date(user.proUntil).getTime() > Date.now();
  }
  return user.plan === "pro";
}

function effectivePlan(user: { plan: Plan; proUntil?: string | null }): Plan {
  return isProActive(user) ? "pro" : "free";
}

async function hashPassword(password: string): Promise<string> {
  const data = new TextEncoder().encode(password);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function loadUsers(): UserAccount[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || "[]") as UserAccount[];
  } catch {
    return [];
  }
}

function saveUsers(users: UserAccount[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function ensureUsageMonth(user: UserAccount): UserAccount {
  const m = monthKey();
  if (user.usageMonth !== m) {
    return { ...user, usageMonth: m, extractionCount: 0 };
  }
  return user;
}

export function getSession(): Session | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as Session;
    return { ...session, plan: effectivePlan(session) };
  } catch {
    return null;
  }
}

export function setSession(session: Session | null) {
  if (typeof window === "undefined") return;
  if (!session) localStorage.removeItem(SESSION_KEY);
  else localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

function toSession(account: UserAccount): Session {
  return {
    email: account.email,
    name: account.name,
    plan: effectivePlan(account),
    proUntil: account.proUntil || null,
  };
}

export async function register(
  email: string,
  name: string,
  password: string
): Promise<{ ok: true; session: Session } | { ok: false; error: string }> {
  const normalized = email.trim().toLowerCase();
  if (!normalized || !password || password.length < 6) {
    return { ok: false, error: "Email and password (min 6 chars) required" };
  }
  const users = loadUsers();
  if (users.some((u) => u.email === normalized)) {
    return { ok: false, error: "Account already exists — try logging in" };
  }
  const passwordHash = await hashPassword(password);
  const account: UserAccount = {
    email: normalized,
    name: name.trim() || normalized.split("@")[0],
    passwordHash,
    plan: "free",
    createdAt: new Date().toISOString(),
    usageMonth: monthKey(),
    extractionCount: 0,
    proUntil: null,
  };
  users.push(account);
  saveUsers(users);
  const session = toSession(account);
  setSession(session);
  return { ok: true, session };
}

export async function login(
  email: string,
  password: string
): Promise<{ ok: true; session: Session } | { ok: false; error: string }> {
  const normalized = email.trim().toLowerCase();
  const users = loadUsers();
  const user = users.find((u) => u.email === normalized);
  if (!user) return { ok: false, error: "No account found — register first" };
  const hash = await hashPassword(password);
  if (hash !== user.passwordHash) return { ok: false, error: "Wrong password" };
  const refreshed = ensureUsageMonth(user);
  if (refreshed !== user) {
    const next = users.map((u) => (u.email === normalized ? refreshed : u));
    saveUsers(next);
  }
  const session = toSession(refreshed);
  setSession(session);
  return { ok: true, session };
}

export function logout() {
  setSession(null);
}

export function getAccount(email: string): UserAccount | null {
  const users = loadUsers().map(ensureUsageMonth);
  return users.find((u) => u.email === email) || null;
}

export function premiumEndsAt(email: string | null): string | null {
  if (!email) return null;
  const account = getAccount(email);
  if (!account?.proUntil) return null;
  return isProActive(account) ? account.proUntil : null;
}

export function getUsage(email: string | null): {
  plan: Plan;
  used: number;
  limit: number;
  remaining: number;
  maxFileBytes: number;
  proUntil: string | null;
} {
  if (!email) {
    const guestKey = "echo-ledger-guest-trial";
    let used = 0;
    try {
      used = Number(localStorage.getItem(guestKey) || "0") || 0;
    } catch {
      /* ignore */
    }
    const limit = 1;
    return {
      plan: "free",
      used,
      limit,
      remaining: Math.max(0, limit - used),
      maxFileBytes: FREE_LIMITS.maxFileBytes,
      proUntil: null,
    };
  }
  const account = getAccount(email);
  if (!account) {
    return {
      plan: "free",
      used: 0,
      limit: FREE_LIMITS.extractionsPerMonth,
      remaining: FREE_LIMITS.extractionsPerMonth,
      maxFileBytes: FREE_LIMITS.maxFileBytes,
      proUntil: null,
    };
  }
  const plan = effectivePlan(account);
  const limits = plan === "pro" ? PRO_LIMITS : FREE_LIMITS;
  const used = account.extractionCount;
  const limit = limits.extractionsPerMonth;
  return {
    plan,
    used,
    limit: limit === Infinity ? 9999 : limit,
    remaining: limit === Infinity ? 9999 : Math.max(0, limit - used),
    maxFileBytes: limits.maxFileBytes,
    proUntil: plan === "pro" ? account.proUntil || null : null,
  };
}

export function canExtract(email: string | null): { ok: true } | { ok: false; error: string } {
  const u = getUsage(email);
  if (u.plan === "pro") return { ok: true };
  if (u.remaining <= 0) {
    return {
      ok: false,
      error: "Free limit reached (5/month). Get a \u20b949 day pass for 24 hours of unlimited extractions.",
    };
  }
  return { ok: true };
}

export function recordExtraction(email: string | null) {
  if (!email) {
    const guestKey = "echo-ledger-guest-trial";
    const count = Number(localStorage.getItem(guestKey) || "0") || 0;
    localStorage.setItem(guestKey, String(count + 1));
    return;
  }
  const users = loadUsers().map(ensureUsageMonth);
  const next = users.map((u) =>
    u.email === email ? { ...u, extractionCount: u.extractionCount + 1 } : u
  );
  saveUsers(next);
}

/** Demo unlock. Extends from now, or from the current expiry if still active. */
export function buyPass(email: string, kind: PassKind): { proUntil: string } {
  const hours = PASSES[kind].hours;
  const account = getAccount(email);
  const base =
    account?.proUntil && new Date(account.proUntil).getTime() > Date.now()
      ? new Date(account.proUntil).getTime()
      : Date.now();
  const until = new Date(base + hours * 60 * 60 * 1000).toISOString();
  const users = loadUsers();
  const next = users.map((u) =>
    u.email === email ? { ...u, plan: "pro" as Plan, proUntil: until } : u
  );
  saveUsers(next);
  const session = getSession();
  if (session && session.email === email) {
    setSession({ ...session, plan: "pro", proUntil: until });
  }
  return { proUntil: until };
}

export function buyDayPass(email: string) {
  return buyPass(email, "day");
}

export function upgradeToPro(email: string) {
  return buyPass(email, "month");
}

export function canUploadFile(email: string | null, sizeBytes: number): {
  ok: true;
} | { ok: false; error: string } {
  const u = getUsage(email);
  if (sizeBytes > u.maxFileBytes) {
    const mb = (u.maxFileBytes / (1024 * 1024)).toFixed(0);
    return {
      ok: false,
      error: `File too large for Free (${mb} MB). A \u20b949 day pass unlocks 25 MB for 24 hours.`,
    };
  }
  return { ok: true };
}
