'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';

interface CandidateData {
    email: string;
    submission: string | null;
    submissionTime: number | null;
    isStarted: boolean;
    startTime: number | null;
    endTime: number | null;
}

export const CandidateResponses = () => {
    const [candidates, setCandidates] = useState<CandidateData[]>([]);

    useEffect(() => {
        const fetchCandidates = async () => {
            try {
                const response = await fetch('/api/candidate/all');
                if (response.ok) {
                    const data = await response.json();
                    setCandidates(data);
                } else {
                    console.error('Failed to fetch candidates');
                }
            } catch (error) {
                console.error('Error fetching candidates:', error);
            }
        };

        fetchCandidates();
        const interval = setInterval(fetchCandidates, 30000); // Refresh every 30 seconds

        return () => clearInterval(interval);
    }, []);

    return (
        <div>
            <h2 className="text-xl font-bold mb-4">Candidate Responses</h2>
            {candidates.map((candidate, index) => (
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