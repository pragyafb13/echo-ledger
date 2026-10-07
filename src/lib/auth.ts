import { FREE_LIMITS, PRO_LIMITS, Plan, Session, UserAccount } from "./types";

const USERS_KEY = "echo-ledger-users";
const SESSION_KEY = "echo-ledger-session";

function monthKey() {
  return new Date().toISOString().slice(0, 7);
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
    return JSON.parse(raw) as Session;
  } catch {
    return null;
  }
}

export function setSession(session: Session | null) {
  if (typeof window === "undefined") return;
  if (!session) localStorage.removeItem(SESSION_KEY);
  else localStorage.setItem(SESSION_KEY, JSON.stringify(session));
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
  };
  users.push(account);
  saveUsers(users);
  const session: Session = {
    email: account.email,
    name: account.name,
    plan: account.plan,
  };
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
  const session: Session = {
    email: refreshed.email,
    name: refreshed.name,
    plan: refreshed.plan,
  };
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

export function getUsage(email: string | null): {
  plan: Plan;
  used: number;
  limit: number;
  remaining: number;
  maxFileBytes: number;
} {
  if (!email) {
    // anonymous guest: still enforce free limits via local key
    const guestKey = "echo-ledger-guest-usage";
    let used = 0;
    try {
      const raw = localStorage.getItem(guestKey);
      if (raw) {
        const data = JSON.parse(raw) as { month: string; count: number };
        if (data.month === monthKey()) used = data.count;
      }
    } catch {
      /* ignore */
    }
    return {
      plan: "free",
      used,
      limit: FREE_LIMITS.extractionsPerMonth,
      remaining: Math.max(0, FREE_LIMITS.extractionsPerMonth - used),
      maxFileBytes: FREE_LIMITS.maxFileBytes,
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
    };
  }
  const plan = account.plan;
  const limits = plan === "pro" ? PRO_LIMITS : FREE_LIMITS;
  const used = account.extractionCount;
  const limit = limits.extractionsPerMonth;
  return {
    plan,
    used,
    limit: limit === Infinity ? 9999 : limit,
    remaining: limit === Infinity ? 9999 : Math.max(0, limit - used),
    maxFileBytes: limits.maxFileBytes,
  };
}

export function canExtract(email: string | null): { ok: true } | { ok: false; error: string } {
  const u = getUsage(email);
  if (u.plan === "pro") return { ok: true };
  if (u.remaining <= 0) {
    return {
      ok: false,
      error: `Free limit reached (${u.limit}/month). Upgrade to Pro for unlimited extractions.`,
    };
  }
  return { ok: true };
}

export function recordExtraction(email: string | null) {
  if (!email) {
    const guestKey = "echo-ledger-guest-usage";
    const m = monthKey();
    let count = 0;
    try {
      const raw = localStorage.getItem(guestKey);
      if (raw) {
        const data = JSON.parse(raw) as { month: string; count: number };
        count = data.month === m ? data.count : 0;
      }
    } catch {
      /* ignore */
    }
    localStorage.setItem(guestKey, JSON.stringify({ month: m, count: count + 1 }));
    return;
  }
  const users = loadUsers().map(ensureUsageMonth);
  const next = users.map((u) =>
    u.email === email ? { ...u, extractionCount: u.extractionCount + 1 } : u
  );
  saveUsers(next);
  const session = getSession();
  if (session) setSession({ ...session });
}

export function upgradeToPro(email: string) {
  const users = loadUsers();
  const next = users.map((u) => (u.email === email ? { ...u, plan: "pro" as Plan } : u));
  saveUsers(next);
  const session = getSession();
  if (session && session.email === email) {
    setSession({ ...session, plan: "pro" });
  }
}

export function canUploadFile(email: string | null, sizeBytes: number): {
  ok: true;
} | { ok: false; error: string } {
  const u = getUsage(email);
  if (sizeBytes > u.maxFileBytes) {
    const mb = (u.maxFileBytes / (1024 * 1024)).toFixed(0);
    return {
      ok: false,
      error: `File too large. Free plan max is ${mb} MB. Upgrade to Pro for 25 MB.`,
    };
  }
  return { ok: true };
}
