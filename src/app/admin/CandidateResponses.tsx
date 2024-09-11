'use client';

import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import ReactMarkdown from 'react-markdown';
import { Input, Button, Card, CardHeader, CardContent, Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui';

interface ChallengeData {
    id: string;
    email: string;
    duration: number; // in seconds
    description: string;
    createdAt: number;
    response?: string;
    timeTaken?: number; // in seconds
}

const fetchChallenges = async (): Promise<ChallengeData[]> => {
    const response = await fetch('/api/challenge');
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
};

export const ChallengeResponses = () => {
    const { data: challenges = [], isLoading, error } = useQuery({
        queryKey: ['challenges'],
        queryFn: fetchChallenges,
    });

    const [search, setSearch] = useState('');
    const [selectedChallenge, setSelectedChallenge] = useState<ChallengeData | null>(null);

    const filteredChallenges = useMemo(() => {
        return challenges.filter(challenge => 
            (challenge.name?.toLowerCase().includes(search.toLowerCase()) || '') ||
            challenge.description.toLowerCase().includes(search.toLowerCase())
        );
    }, [challenges, search]);

    const formatDuration = (seconds: number): string => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = seconds % 60;
        return `${hours}h ${minutes}m ${remainingSeconds}s`;
    };

    if (isLoading) return <div className="text-center py-8">Loading challenges...</div>;
    if (error) return <div className="text-center py-8 text-red-500">Error loading challenges. Please try again.</div>;

    return (
        <div className="p-4 max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">All Challenges</h1>
            <Input
                type="text"
                placeholder="Search challenges..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="mb-4 max-w-md"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredChallenges.map((challenge) => (
                    <Card key={challenge.id} className="overflow-hidden">
                        <CardHeader>
                            <h2 className="text-xl font-semibold text-blue-600">{challenge.name}</h2>
                        </CardHeader>
                        <CardContent>
                            <div className="text-sm text-gray-600 mb-4">
                                <p>Duration: {formatDuration(challenge.duration)}</p>
                                {challenge.timeTaken !== undefined && (
                                    <p className={challenge.timeTaken > challenge.duration ? 'text-red-500 font-semibold' : ''}>
                                        Time Taken: {formatDuration(challenge.timeTaken)}
                                    </p>
                                )}
                                <p>Created: {new Date(challenge.createdAt).toLocaleDateString()}</p>
                            </div>
                            <Button 
                                onClick={() => setSelectedChallenge(challenge)}
                                className="w-full"
                            >
                                View Details
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Dialog open={!!selectedChallenge} onOpenChange={() => setSelectedChallenge(null)}>
                <DialogContent className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-blue-600">
                            {selectedChallenge?.email}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="mt-4 space-y-6">
                        <section>
                            <h3 className="text-lg font-semibold mb-2">Challenge Details:</h3>
                            <div className="bg-gray-100 p-4 rounded-md">
                                <p><span className="font-medium">Duration:</span> {selectedChallenge ? formatDuration(selectedChallenge.duration) : ''}</p>
                                {selectedChallenge?.timeTaken !== undefined && (
                                    <p className={selectedChallenge.timeTaken > selectedChallenge.duration ? 'text-red-500 font-semibold' : ''}>
                                        <span className="font-medium">Time Taken:</span> {formatDuration(selectedChallenge.timeTaken)}
                                    </p>
                                )}
                                <p><span className="font-medium">Created:</span> {selectedChallenge ? new Date(selectedChallenge.createdAt).toLocaleString() : ''}</p>
                            </div>
                        </section>
                        
                        <section>
                            <h3 className="text-lg font-semibold mb-2">Challenge Template:</h3>
                            <div className="bg-white border border-gray-200 rounded-md p-4 prose max-w-none">
                                <ReactMarkdown>{selectedChallenge?.description || ''}</ReactMarkdown>
                            </div>
                        </section>
                        
                        {selectedChallenge?.response && (
                            <section>
                                <h3 className="text-lg font-semibold mb-2">Submitted Response:</h3>
                                <div className="bg-white border border-gray-200 rounded-md p-4 prose max-w-none">
                                    <ReactMarkdown>{selectedChallenge.response}</ReactMarkdown>
                                </div>
                            </section>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};