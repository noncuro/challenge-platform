"use client";
import {Alert, AlertDescription, Button, Card, CardContent, CardHeader, CardTitle, Textarea} from '@/components/ui';
import {useEffect, useMemo, useRef, useState} from 'react';
import {useParams} from 'next/navigation';
import {useQuery, useMutation, useQueryClient, QueryClient, QueryClientProvider} from '@tanstack/react-query';




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
    // Check if challenge is already started
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
} & ChallengeStatus> => {
    const response = await fetch(`/api/challenge/submit`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({submission})
    });
    return response.json();
};


const saveSubmissionLocally = async (submission: string) => {
    // Simulate saving the submission to a backend
    localStorage.setItem(`submission`, submission);
};

const loadSubmissionLocally = async (): Promise<string | null> => {
    return localStorage.getItem(`submission`);
}

const queryClient = new QueryClient()

export const TimedSubmissionPlatform = () => {
    const queryClient = useQueryClient();
    const [submission, setSubmission] = useState(""); // Submission text
    const [timeLeft, setTimeLeft] = useState(0);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const challengeStatusRef = useRef<ChallengeStatus | null>(null);


    const clearLocalStorageDEV = () => {
        localStorage.clear();
        queryClient.invalidateQueries({queryKey: ['challengeStatus', ]});
        alert('LocalStorage cleared!');
    };

    useEffect(() => {
        loadSubmissionLocally()
            .then(local => {
                setSubmission(s => local || s);
            });
    }, []);

    const {
        data: challengeStatus,
        isLoading,
        error
    } = useQuery({
        queryKey: ['challengeStatus', ],
        queryFn: async () => {
            const res = await getChallengeStatus()
            challengeStatusRef.current = res;
            return res;
        },
    });

    const startChallengeMutation = useMutation(
        {
            mutationFn: () => startChallenge(),
            onSuccess: (data) => {
                queryClient.setQueryData(['challengeStatus', ], data.status);
                queryClient.invalidateQueries({
                    queryKey: ['challengeStatus', ]
                });
            },
        }
    );

    const submitChallengeMutation = useMutation({
        mutationFn: () => submitChallenge(submission),
        onSuccess: (data) => {
            queryClient.setQueryData(['challengeStatus', ], data);
            queryClient.invalidateQueries({queryKey: ['challengeStatus', ]});
            if (data.success) {
                alert(data.isOvertime ? 'Overtime submission successful!' : 'Submission successful!');
                if (data.isOvertime) {
                    const timer = timerRef.current
                    timer && clearInterval(timer);
                }
            } else {
                alert('Submission failed! An overtime submission has already been made.');
            }
        },
    });


    const formatTime = (seconds: number): string => {
        const absSeconds = Math.abs(seconds);
        const sign = seconds < 0 ? '-' : '';
        return `${sign}${Math.floor(absSeconds / 60)}:${(absSeconds % 60).toString().padStart(2, '0')}`;
    };

    const isOvertime = useMemo(() => challengeStatus?.isStarted && timeLeft <= 0, [challengeStatus?.isStarted, timeLeft])
    const canSubmit = useMemo(() => !isOvertime || !challengeStatus?.submission, [isOvertime, challengeStatus?.submission]);

    const getTimerColor = () => {
        if (isOvertime) return 'text-red-500';
        if (timeLeft <= 5) return 'text-yellow-400';
        return 'text-green-400';
    };

    useEffect(() => {
        if (challengeStatus?.isStarted) {
            saveSubmissionLocally(submission);
        }
    }, [submission, challengeStatus?.isStarted, ]);

    useEffect(() => {
        const status = challengeStatusRef.current
        if (status?.isStarted && status?.endTime) {
            const updateTimer = () => {
                const now = new Date().getTime();
                const remaining = status.endTime! - now;

                // Allow negative time if in overtime and not submitted
                if (remaining <= 0 && status.submission) {
                    setTimeLeft(0);
                    clearInterval(timerRef.current!);
                } else {
                    setTimeLeft(Math.ceil(remaining / 1000));
                }
            };

            updateTimer(); // Initial update
            timerRef.current = setInterval(updateTimer, 1000);

            return () => {
                const timer = timerRef.current
                timer && clearInterval(timer);
            };
        }
    }, [challengeStatus?.isStarted]);

    if (isLoading) {
        return (
            <div className="bg-black min-h-screen flex items-center justify-center p-4 font-mono">
                <Card className="w-full max-w-md mx-auto bg-black border-green-500 border-2">
                    <CardContent className="flex items-center justify-center h-64">
                        <div className="text-green-400 animate-pulse">Loading simulation...</div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-black min-h-screen flex items-center justify-center p-4 font-mono">
                <Card className="w-full max-w-md mx-auto bg-black border-red-500 border-2">
                    <CardContent className="flex items-center justify-center h-64">
                        <div className="text-red-400">Error: Unable to connect to the mainframe</div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="bg-black min-h-screen flex items-center justify-center p-4 font-mono">
            <Card
                className={`w-full max-w-md mx-auto bg-black border-green-500 border-2 ${isOvertime ? 'animate-[alert_1s_ease-in-out_infinite]' : ''}`}>
                <CardHeader>
                    <CardTitle className="text-2xl text-green-400 animate-[glow_1.5s_ease-in-out_infinite]">
                        Slingshot Challenge Interface
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Button
                        onClick={clearLocalStorageDEV}
                        className="w-full mb-4 bg-red-900 hover:bg-red-700 text-red-300 border-red-500 border"
                    >
                        Clear LocalStorage (Dev Only)
                    </Button>

                    {!challengeStatus?.isStarted ? (
                        <Button
                            onClick={() => startChallengeMutation.mutate()}
                            className="w-full mb-4 bg-green-900 hover:bg-green-700 text-green-300 border-green-500 border animate-pulse"
                            disabled={startChallengeMutation.isPending}
                        >
                            {startChallengeMutation.isPending ? 'Initializing...' : 'Initialize Simulation'}
                        </Button>
                    ) : (
                        <>
                            <div className="text-center mb-4">
                                <div
                                    className={`text-4xl font-bold ${getTimerColor()} animate-[glow_1.5s_ease-in-out_infinite]`}>
                                    {formatTime(timeLeft)}
                                </div>
                                <div className={`text-sm ${timeLeft <= 0 ? 'text-red-500' : 'text-green-600'}`}>
                                    {timeLeft <= 0 ? 'OVERTIME' : 'Time Remaining'}
                                </div>
                            </div>
                            <Alert className="mb-4 bg-black border-green-700 border">
                                <AlertDescription>
                                    <div dangerouslySetInnerHTML={{__html: challengeStatus.challengeDescription || ""}}
                                         className="text-green-400"/>
                                </AlertDescription>
                            </Alert>
                            {challengeStatus.submission && (
                                <Alert
                                    className={`mb-4 ${challengeStatus.submissionTime! > challengeStatus.endTime! ? 'bg-red-900 border-red-500' : 'bg-green-900 border-green-500'} border`}>
                                    <AlertDescription className="text-green-300">
                                        {challengeStatus.submissionTime! > challengeStatus.endTime! ? 'Overtime submission' : 'Last submission'}: {new Date(challengeStatus.submissionTime!).toLocaleTimeString()} ({formatDuration((challengeStatus.submissionTime! - challengeStatus.startTime!) / 1000)})
                                    </AlertDescription>
                                </Alert>
                            )}
                            <Textarea
                                placeholder="Enter your submission here..."
                                value={submission}
                                onChange={(e) => !isOvertime || !challengeStatus.submission ? setSubmission(e.target.value) : null}
                                className={`w-full h-40 mb-4 bg-black text-green-400 border-green-700 focus:border-green-500 placeholder-green-700 ${isOvertime && challengeStatus.submission ? 'opacity-50 cursor-not-allowed' : ''}`}
                                disabled={isOvertime && challengeStatus.submission ? true : false}
                            />
                            <Button
                                onClick={() => submitChallengeMutation.mutate()}
                                className={`w-full ${isOvertime ? 'bg-red-900 hover:bg-red-700 text-red-300 border-red-500' : 'bg-green-900 hover:bg-green-700 text-green-300 border-green-500'} border`}
                                disabled={submitChallengeMutation.isPending || !canSubmit}
                            >
                                {submitChallengeMutation.isPending
                                    ? 'Uploading...'
                                    : !canSubmit
                                        ? 'Submission Closed'
                                        : isOvertime
                                            ? 'Submit Overtime Entry'
                                            : challengeStatus.submission
                                                ? 'Update Submission'
                                                : 'Submit Challenge'}
                            </Button>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

const Wrapper = () => {
    return (
        <QueryClientProvider client={queryClient}>
            <TimedSubmissionPlatform/>
        </QueryClientProvider>
    );
}

export default Wrapper;
