'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button } from '@/components/ui';
import ReactMarkdown from 'react-markdown';
import { formatDuration } from '../candidate/TimedSubmissionPlatform';
import { useQuery } from '@tanstack/react-query';

interface CandidateData {
    email: string;
    submission: string | null;
    submissionTime: number | null;
    isStarted: boolean;
    startTime: number | null;
    endTime: number | null;
    challengeDescription?: string;
}

interface ChallengeModalProps {
    isOpen: boolean;
    onClose: () => void;
    challengeDescription: string;
}

const ChallengeModal: React.FC<ChallengeModalProps> = ({ isOpen, onClose, challengeDescription }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg max-w-3xl w-full max-h-[80vh] overflow-auto relative">
                <button 
                    onClick={onClose}
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                    aria-label="Close"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                <h2 className="text-2xl font-bold mb-4">Challenge Description</h2>
                <div className="prose max-w-none">
                    <ReactMarkdown>{challengeDescription}</ReactMarkdown>
                </div>
            </div>
        </div>
    );
};

const fetchCandidates = async (): Promise<CandidateData[]> => {
    const response = await fetch('/api/candidate/all');
    if (!response.ok) {
        throw new Error('Failed to fetch candidates');
    }
    return response.json();
};

export const CandidateResponses = () => {
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedChallenge, setSelectedChallenge] = useState('');

    const { data: candidates, error, isLoading, refetch, isFetching } = useQuery<CandidateData[], Error>({
        queryKey: ['candidates'],
        queryFn: fetchCandidates,
    });

    const openChallengeModal = (description: string) => {
        setSelectedChallenge(description);
        setModalOpen(true);
    };

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error: {error.message}</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Candidate Responses</h2>
                <Button onClick={() => refetch()} disabled={isFetching}>
                    {isFetching ? 'Refreshing...' : 'Refresh'}
                </Button>
            </div>
            {candidates?.map((candidate) => (
                <Card key={candidate.email} className="overflow-hidden">
                    <CardHeader className="bg-gray-100">
                        <CardTitle className="flex justify-between items-center">
                            <span>{candidate.email}</span>
                            <Button onClick={() => openChallengeModal(candidate.challengeDescription || '')}>
                                View Challenge
                            </Button>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-4">
                            <p>Status: {candidate.isStarted ? 'Started' : 'Not Started'}</p>
                            {candidate.startTime && (
                                <p>Started: {new Date(candidate.startTime).toLocaleString()}</p>
                            )}
                            {candidate.endTime && (
                                <p>End Time: {new Date(candidate.endTime).toLocaleString()}</p>
                            )}
                            {candidate.startTime && candidate.endTime && (
                                <p>Duration: {formatDuration((candidate.endTime - candidate.startTime) / 1000)}</p>
                            )}
                            {candidate.submissionTime && (
                                <p>Submitted: {new Date(candidate.submissionTime).toLocaleString()}</p>
                            )}
                        </div>
                        <div className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
                            <h3 className="text-lg font-semibold mb-2">Submission</h3>
                            {candidate.submission ? (
                                <ReactMarkdown>{candidate.submission}</ReactMarkdown>
                            ) : (
                                <p>No submission yet</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            ))}
            <ChallengeModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                challengeDescription={selectedChallenge}
            />
        </div>
    );
};