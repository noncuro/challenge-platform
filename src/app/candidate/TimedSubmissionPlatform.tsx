"use client";
import { Alert, AlertDescription, Button, Card, CardContent, CardHeader, CardTitle, Textarea } from '@/components/ui';
import { useEffect, useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from "react";
import { MarkdownViewer } from '@/components/MarkdownViewer';
import { FiClock, FiCheckCircle, FiAlertTriangle, FiAlertCircle, FiSend } from 'react-icons/fi';

export const formatDuration = (durationInSeconds: number): string => {
    const days = Math.floor(durationInSeconds / (24 * 60 * 60));
    const hours = Math.floor((durationInSeconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((durationInSeconds % (60 * 60)) / 60);
    const seconds = Math.floor(durationInSeconds % 60);

    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`);

    return parts.join(' ');
};

const startChallenge = async (): Promise<{ success: boolean; status: ChallengeStatus }> => {
    const response = await fetch(`/api/challenge/start`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }
    });
    return response.json();
};

const getChallengeStatus = async (): Promise<ChallengeStatus> => {
    const response = await fetch(`/api/challenge/status`);
    return response.json();
};

const submitChallenge = async (submission: string): Promise<{
    success: boolean;
    isOvertime: boolean;
    submissionTime: number;
} & ChallengeStatus> => {
    const response = await fetch(`/api/challenge/submit`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ submission })
    });
    return response.json();
};

const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    const pad = (num: number): string => num.toString().padStart(2, '0');

    if (hours > 0) {
        return `${pad(hours)}:${pad(minutes)}:${pad(remainingSeconds)}`;
    } else {
        return `${pad(minutes)}:${pad(remainingSeconds)}`;
    }
};

const StickyHeader: React.FC<{
    timeLeft: number;
    isOvertime: boolean;
    clearLocalStorageDEV: () => void;
    challengeStatus: ChallengeStatus | undefined;
    startChallengeMutation: any;
}> = ({ timeLeft, isOvertime, clearLocalStorageDEV, challengeStatus, startChallengeMutation }) => {
    return (
        <div className="sticky top-0 z-10 bg-gray-900 shadow-lg">
            <div className="container mx-auto px-6 py-4">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-white">Coding Challenge</h1>
                    {!challengeStatus?.isStarted ? (
                        <Button
                            onClick={() => startChallengeMutation.mutate()}
                            className="w-full mb-4 bg-green-900 hover:bg-green-700 text-green-300 border-green-500 border animate-pulse"
                            disabled={startChallengeMutation.isPending}
                        >
                            {startChallengeMutation.isPending ? 'Initializing...' : 'Initialize Simulation'}
                        </Button>
                    ) : (
                        <div className="flex items-center space-x-6">
                            <div className="flex items-center space-x-2">
                                <FiClock className="text-2xl text-blue-400" />
                                <span className="text-lg font-medium text-gray-300">
                                    Time Remaining:
                                </span>
                                <span className={`text-2xl font-bold ${isOvertime ? 'text-red-400' : 'text-green-400'}`}>
                                    {formatTime(Math.abs(timeLeft))}
                                </span>
                            </div>
                            {process.env.NODE_ENV === 'development' && (
                                <Button
                                    onClick={clearLocalStorageDEV}
                                    className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-md transition duration-300 ease-in-out"
                                >
                                    Clear Storage (Dev)
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const SubmissionArea: React.FC<{
    submission: string;
    setSubmission: (value: string) => void;
    onSubmit: () => void;
    isSubmitting: boolean;
    timeLeft: number;
    canSubmit: boolean;
    submissionStatus: 'idle' | 'success' | 'error';
}> = ({ submission, setSubmission, onSubmit, isSubmitting, timeLeft, canSubmit, submissionStatus }) => {
    const [showWarning, setShowWarning] = useState(false);

    const handleSubmit = () => {
        if (submission.trim().length < 10) {
            setShowWarning(true);
            return;
        }
        onSubmit();
    };

    return (
        <div className="mt-8 bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-700">
            <h2 className="text-2xl font-bold text-white mb-4">Your Solution</h2>
            <Textarea
                value={submission}
                onChange={(e) => setSubmission(e.target.value)}
                placeholder="Enter your solution here..."
                className={`w-full h-64 mb-4 bg-gray-700 text-white border-gray-600 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 rounded-md resize-none ${
                    submissionStatus === 'success' ? 'border-green-500' : ''
                }`}
            />
            {submissionStatus === 'success' && (
                <div className="text-green-400 mb-4">Submission successful!</div>
            )}
            <div className="flex justify-between items-center">
                <div className="text-gray-400">
                    {timeLeft > 0 ? `${Math.floor(timeLeft / 60)} minutes remaining` : 'Time\'s up!'}
                </div>
                <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting || !canSubmit}
                    className={`px-6 py-3 flex items-center ${isSubmitting || !canSubmit
                        ? 'bg-gray-600 cursor-not-allowed'
                        : 'bg-green-600 hover:bg-green-700'
                        } text-white rounded-md transition duration-300 ease-in-out`}
                >
                    <FiSend className="mr-2" />
                    {isSubmitting ? 'Submitting...' : 'Submit Challenge'}
                </Button>
            </div>
        </div>
    );
};

const queryClient = new QueryClient();

export const TimedSubmissionPlatform: React.FC = () => {
    const [submission, setSubmission] = useState(() => {
        // Initialize submission from localStorage if available
        if (typeof window !== 'undefined') {
            return localStorage.getItem('submission') || "";
        }
        return "";
    });
    const [timeLeft, setTimeLeft] = useState(0);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const clearLocalStorageDEV = () => {
        if (typeof window !== 'undefined') {
            const currentSubmission = localStorage.getItem('submission');
            localStorage.clear();
            if (currentSubmission) {
                localStorage.setItem('submission', currentSubmission);
            }
        }
        queryClient.invalidateQueries({ queryKey: ['challengeStatus'] });
        alert('LocalStorage cleared (except submission)!');
    };

    useEffect(() => {
        // Save submission to localStorage whenever it changes
        if (typeof window !== 'undefined') {
            localStorage.setItem('submission', submission);
        }
    }, [submission]);

    const { data: challengeStatus, refetch } = useQuery({
        queryKey: ['challengeStatus'],
        queryFn: getChallengeStatus,
        refetchInterval: 1000,
    });

    const startChallengeMutation = useMutation({
        mutationFn: startChallenge,
        onSuccess: (data) => {
            if (data.success) {
                queryClient.setQueryData(['challengeStatus'], data.status);
                queryClient.invalidateQueries({ queryKey: ['challengeStatus'] });
            } else {
                alert('Failed to start challenge');
            }
        },
        onError: () => {
            alert('Failed to start challenge');
        }
    });

    const submitChallengeMutation = useMutation({
        mutationFn: submitChallenge,
        onSuccess: (data) => {
            if (data.success) {
                queryClient.setQueryData(['challengeStatus'], data);
                queryClient.invalidateQueries({ queryKey: ['challengeStatus'] });
                setSubmissionStatus('success');
                setTimeout(() => setSubmissionStatus('idle'), 3000); // Reset after 3 seconds
            } else {
                setSubmissionStatus('error');
                alert('Submission failed! An overtime submission has already been made.');
            }
        },
        onError: () => {
            setSubmissionStatus('error');
            alert('Failed to submit challenge');
        }
    });

    useEffect(() => {
        if (challengeStatus?.isStarted) {
            if (challengeStatus.endTime === null) {
                console.error('Challenge end time is null for a started challenge');
                // You might want to handle this case, e.g., by setting a default duration
                return;
            }

            const updateTimer = () => {
                const now = Date.now();
                const endTime = challengeStatus.endTime ?? now; // Use nullish coalescing
                const remaining = endTime - now;

                if (remaining <= 0) {
                    setTimeLeft(0);
                    if (timerRef.current) {
                        clearInterval(timerRef.current);
                    }
                } else {
                    setTimeLeft(Math.ceil(remaining / 1000));
                }
            };

            updateTimer();
            timerRef.current = setInterval(updateTimer, 1000);

            return () => {
                if (timerRef.current) {
                    clearInterval(timerRef.current);
                }
            };
        }
    }, [challengeStatus]);

    const isOvertime = timeLeft <= 0;
    const canSubmit = !isOvertime || !challengeStatus?.submission;

    const handleSubmit = () => {
        if (submission.trim() === "") {
            alert('Submission cannot be empty');
            return;
        }
        submitChallengeMutation.mutate(submission);
    };

    if (!challengeStatus?.isStarted) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-white mb-8">Coding Challenge</h1>
                    <Button
                        onClick={() => startChallengeMutation.mutate()}
                        className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white text-xl font-bold rounded-lg transition duration-300 ease-in-out transform hover:scale-105"
                        disabled={startChallengeMutation.isPending}
                    >
                        {startChallengeMutation.isPending ? 'Initializing...' : 'Initialize Simulation'}
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900">
            <StickyHeader
                timeLeft={timeLeft}
                isOvertime={isOvertime}
                clearLocalStorageDEV={clearLocalStorageDEV}
                challengeStatus={challengeStatus}
                startChallengeMutation={startChallengeMutation}
            />
            <div className="container mx-auto px-6 py-8">
                <Card className="w-full max-w-4xl mx-auto bg-gray-800 text-white shadow-xl border border-gray-700 rounded-lg overflow-hidden">
                    <CardHeader className="bg-gray-700 border-b border-gray-600 p-6">
                        <CardTitle className="text-2xl font-bold text-blue-300">Challenge Description</CardTitle>
                    </CardHeader>
                    <CardContent className="prose prose-invert max-w-none bg-gray-800 text-gray-200 p-6">
                        <MarkdownViewer content={challengeStatus?.challengeDescription || ''} />
                    </CardContent>
                </Card>
                <SubmissionArea
                    submission={submission}
                    setSubmission={setSubmission}
                    onSubmit={handleSubmit}
                    isSubmitting={submitChallengeMutation.isPending}
                    timeLeft={timeLeft}
                    canSubmit={canSubmit}
                    submissionStatus={submissionStatus}
                />
                {challengeStatus?.submission && (
                    <Alert
                        className={`mt-8 flex items-center ${challengeStatus.submissionTime! > challengeStatus.endTime!
                            ? 'bg-red-900 border-red-700'
                            : 'bg-green-900 border-green-700'
                            } border rounded-lg p-4`}
                    >
                        <FiCheckCircle className="text-2xl mr-3 text-green-400" />
                        <AlertDescription className="text-white">
                            {challengeStatus.submissionTime! > challengeStatus.endTime!
                                ? 'Overtime submission'
                                : 'Last submission'}:{' '}
                            {challengeStatus.submissionTime ? new Date(challengeStatus.submissionTime).toLocaleTimeString() : 'N/A'} (
                            {formatDuration((challengeStatus.submissionTime! - challengeStatus.startTime!) / 1000)}
                            )
                        </AlertDescription>
                    </Alert>
                )}
            </div>
        </div>
    );
};

const Wrapper = () => {
    return (
        <QueryClientProvider client={queryClient}>
            <TimedSubmissionPlatform />
        </QueryClientProvider>
    );
}

export default Wrapper;