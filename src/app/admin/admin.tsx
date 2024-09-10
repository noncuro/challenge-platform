'use client';

import React, { useState, useEffect } from "react";
import { CreateChallengeForm } from "./createChallenge";
import { Card, CardContent, CardHeader, CardTitle, Button, Input } from '@/components/ui';
import ReactMarkdown from 'react-markdown';
import { TemplateManager } from "./TemplateManager";

interface CandidateData {
    email: string;
    submission: string | null;
    submissionTime: number | null;
    isStarted: boolean;
    startTime: number | null;
    endTime: number | null;
    duration: number;
}

type ActiveForm = 'none' | 'createChallenge' | 'manageTemplates';

const calculateLateness = (startTime: number, endTime: number, submissionTime: number | null, duration: number) => {
    if (!submissionTime) return null;
    const expectedEndTime = startTime + duration * 1000; // Convert duration to milliseconds
    return submissionTime - expectedEndTime;
};

const formatLateness = (lateness: number) => {
    const seconds = Math.floor(lateness / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
        return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
        return `${minutes}m ${seconds % 60}s`;
    } else {
        return `${seconds}s`;
    }
};

export default function Admin() {
    const [candidates, setCandidates] = useState<CandidateData[]>([]);
    const [activeForm, setActiveForm] = useState<ActiveForm>('none');
    const [searchTerm, setSearchTerm] = useState('');

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

    useEffect(() => {
        fetchCandidates();
        const interval = setInterval(fetchCandidates, 30000); // Refresh every 30 seconds
        return () => clearInterval(interval);
    }, []);

    const filteredCandidates = candidates.filter(candidate =>
        candidate.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                <div className="space-x-2">
                    <Button onClick={() => setActiveForm(activeForm === 'createChallenge' ? 'none' : 'createChallenge')}>
                        {activeForm === 'createChallenge' ? 'Cancel' : 'Create Challenge'}
                    </Button>
                    {activeForm !== 'createChallenge' && (
                        <Button onClick={() => setActiveForm('manageTemplates')}>
                            Manage Templates
                        </Button>
                    )}
                </div>
            </div>

            {activeForm === 'createChallenge' && (
                <Card className="mb-4">
                    <CardHeader>
                        <CardTitle>Create New Challenge</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CreateChallengeForm onSuccess={() => setActiveForm('none')} />
                    </CardContent>
                </Card>
            )}

            {activeForm === 'manageTemplates' && (
                <TemplateManager />
            )}

            {activeForm === 'none' && (
                <>
                    <div className="flex justify-between items-center mb-4">
                        <Input
                            type="text"
                            placeholder="Search candidates..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-64"
                        />
                        <Button onClick={fetchCandidates}>
                            Refresh
                        </Button>
                    </div>

                    <div className="space-y-4">
                        {filteredCandidates.map((candidate, index) => {
                            const lateness = candidate.startTime && candidate.endTime && candidate.submissionTime
                                ? calculateLateness(candidate.startTime, candidate.endTime, candidate.submissionTime, candidate.duration)
                                : null;

                            return (
                                <Card key={index}>
                                    <CardHeader>
                                        <CardTitle>{candidate.email}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p><strong>Status:</strong> {candidate.isStarted ? 'Started' : 'Not Started'}</p>
                                                {candidate.startTime && (
                                                    <p><strong>Started:</strong> {new Date(candidate.startTime).toLocaleString()}</p>
                                                )}
                                                {candidate.endTime && (
                                                    <p><strong>End Time:</strong> {new Date(candidate.endTime).toLocaleString()}</p>
                                                )}
                                                {candidate.submission && (
                                                    <p><strong>Submitted:</strong> {new Date(candidate.submissionTime!).toLocaleString()}</p>
                                                )}
                                                {lateness !== null && lateness > 0 && (
                                                    <p className="text-red-500"><strong>Late by:</strong> {formatLateness(lateness)}</p>
                                                )}
                                            </div>
                                            <div>
                                                {candidate.submission ? (
                                                    <div className="bg-gray-100 p-4 rounded mt-2 max-h-60 overflow-y-auto">
                                                        <ReactMarkdown>{candidate.submission}</ReactMarkdown>
                                                    </div>
                                                ) : (
                                                    <p>No submission yet</p>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
}