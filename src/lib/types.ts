export interface EventDocument {
  name: string;
  date: any;
  currentRound: string;
  submissionDeadline: any;
  checkinCloses: any;
  judgingCutoff: any;
  status: string; // ROUND_ACTIVE | SCORING_IN_PROGRESS | LEADERBOARD_LIVE
}

export interface Participant {
  name: string;
  email: string;
  skills: string[];
  role: string;
  teamId: string | null;
  status: string; // REGISTERED | CHECKED_IN | NO_SHOW | LATE_ARRIVAL
  checkedInAt: any | null;
  registrationCode: string;
}

export interface Team {
  name: string;
  memberIds: string[];
  status: string; // SOLO | TEAM_FORMING | TEAM_CONFIRMED | UNTEAMED
  projectLink: string | null;
  submissionStatus: string; // DRAFT | SUBMITTED | UNDER_REVIEW | SCORED | LATE_SUBMISSION
}

export interface Judge {
  name: string;
  assignedTeams: string[];
  scoredTeams: string[];
  status: string; // EVALUATION_COMPLETE | JUDGE_OVERDUE
}

export interface Score {
  teamId: string;
  judgeId: string;
  criteria: {
    functionality: number;
    innovation: number;
    presentation: number;
    implementation: number;
  };
  total: number;
  feedback: string;
  judgeSummary?: string; // our Gemini summary extension
  submittedAt: any;
}
