export interface ChallengeStatus {
  isStarted: boolean;
  startTime: number | null;
  endTime: number | null;
  duration: number | null; // seconds
  challengeDescription: string | null;
  submissions: Submission[];
  latestSubmission: Submission | null;
  emailAddress: string;
  hashedAuthToken: string;
}

export interface Submission {
  content: string;
  timestamp: number;
}
