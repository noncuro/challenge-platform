interface ChallengeStatus {
    isStarted: boolean;
    startTime: number | null;
    endTime: number | null;
    duration: number | null; // seconds
    challengeDescription: string | null;
    submission: string | null; // Candidate's submission. Null if not submitted.
    submissionTime: number | null; // Submission time. Null if not submitted.
    emailAddress: string;
    hashedAuthToken: string;
}