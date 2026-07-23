export type ElectionStatus = "open" | "upcoming" | "closed";

export interface Candidate {
  id: string;
  name: string;
  avatar?: string;
}

export interface ElectionDoc {
  _id: string;
  title: string;
  position: string;
  description?: string;
  candidates: Candidate[];
  eligibleVoters: number;
  rollNumberFrom?: string;
  rollNumberTo?: string;
  startDate: string;
  endDate: string;
  createdBy: string;
  createdByName: string;
  createdAt: string;
}

export interface ElectionWithStats extends ElectionDoc {
  status: ElectionStatus;
  votesCast: number;
  hasVoted: boolean;
  candidateVotes: Record<string, number>;
}

export interface ActivityDoc {
  _id: string;
  uid: string;
  text: string;
  createdAt: string;
}

export interface Profile {
  uid: string;
  email: string;
  displayName: string;
  rollNumber: string;
  department: string;
  year: string;
  role: string;
}
