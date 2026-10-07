export type CommitmentStatus = "waiting" | "overdue" | "fulfilled" | "cancelled";

export interface Commitment {
  id: string;
  person: string;
  commitment: string;
  deadline: string | null; // ISO date or relative string
  deadlineDate: string | null; // parsed ISO if possible
  context: string;
  source: string; // filename or "recording"
  status: CommitmentStatus;
  createdAt: string;
  updatedAt: string;
  notes?: string;
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
