export type CommitmentStatus = "waiting" | "overdue" | "fulfilled" | "cancelled";
export type Plan = "free" | "pro";

export interface Commitment {
  id: string;
  person: string;
  commitment: string;
  deadline: string | null;
  deadlineDate: string | null;
  context: string;
  source: string;
  status: CommitmentStatus;
  createdAt: string;
  updatedAt: string;
  notes?: string;
  ownerEmail?: string;
}

export interface ExtractionResult {
  commitments: Array<{
    person: string;
    commitment: string;
    deadline: string | null;
    context: string;
  }>;
  summary?: string;
}

export interface UserAccount {
  email: string;
  name: string;
  passwordHash: string;
  plan: Plan;
  createdAt: string;
  usageMonth: string; // YYYY-MM
  extractionCount: number;
  /** ISO time when a 24h day pass expires. Absent = not a day pass. */
  proUntil?: string | null;
}

export interface Session {
  email: string;
  name: string;
  plan: Plan;
  proUntil?: string | null;
}

export const FREE_LIMITS = {
  extractionsPerMonth: 5,
  maxFileBytes: 1 * 1024 * 1024, // 1 MB
} as const;

export const PRO_LIMITS = {
  extractionsPerMonth: Infinity,
  maxFileBytes: 25 * 1024 * 1024, // 25 MB
} as const;

export const DAY_PASS_PRICE_INR = 49;
export const DAY_PASS_HOURS = 24;
