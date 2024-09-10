'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';

interface CandidateData {
    email: string;
    submission: string | null;
    submissionTime: number | null;
    isStarted: boolean;
    startTime: number | null;
    endTime: number | null;
}

const fetchCandidates = async (): Promise<CandidateData[]> => {
    const response = await fetch('/api/candidate/all');
    if (!response.ok) {
        throw new Error('Failed to fetch candidates');
    }
    return response.json();
};

export const CandidateResponses = () => {
    const { data: candidates, isLoading, error } = useQuery({
        queryKey: ['candidates'],
        queryFn: fetchCandidates,
        refetchInterval: 30000, // Refetch every 30 seconds
    });

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error fetching candidates</div>;

    return (
        <div>
            <h2 className="text-xl font-bold mb-4">Candidate Responses</h2>
            {candidates?.map((candidate, index) => (
                <Card key={index} className="mb-4">
                    <CardHeader>
                        <CardTitle>{candidate.email}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>Status: {candidate.isStarted ? 'Started' : 'Not Started'}</p>
                        {candidate.startTime && (
                            <p>Started: {new Date(candidate.startTime).toLocaleString()}</p>
                        )}
                        {candidate.endTime && (
                            <p>End Time: {new Date(candidate.endTime).toLocaleString()}</p>
                        )}
                        {candidate.submission ? (
                            <>
                                <p>Submitted: {new Date(candidate.submissionTime!).toLocaleString()}</p>
                                <div className="bg-gray-100 p-4 rounded mt-2">
                                    <pre>{candidate.submission}</pre>
                                </div>
                            </>
                        ) : (
                            <p>No submission yet</p>
                        )}
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};