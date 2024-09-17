'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button } from '@/components/ui';
import { useQuery } from '@tanstack/react-query';
import ReactMarkdown from 'react-markdown';

interface Challenge {
  id: string;
  email: string;
  duration: number;
  description: string;
  candidateCount: number;
  createdAt: string;
  token: string;
}

const fetchChallenges = async (): Promise<Challenge[]> => {
  const response = await fetch('/api/challenges');
  if (!response.ok) {
    throw new Error('Failed to fetch challenges');
  }
  return response.json();
};

// Helper function to format duration
const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
};

export function AllChallenges() {
  const { data: challenges = [], isLoading, error } = useQuery({
    queryKey: ['challenges'],
    queryFn: fetchChallenges,
  });

  if (isLoading) return <div>Loading challenges...</div>;
  if (error) return <div>Error loading challenges: {error.message}</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">All Challenges</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {challenges.map((challenge) => (
          <Card key={challenge.id} className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-blue-600">{challenge.email}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-2">
                <ReactMarkdown className="prose prose-sm max-h-40 overflow-y-auto">
                  {challenge.description}
                </ReactMarkdown>
              </div>
              <div className="text-sm text-gray-600">
                <p>Duration: {formatDuration(challenge.duration)}</p>
                <p>Candidates: {challenge.candidateCount}</p>
                <p>Created: {new Date(challenge.createdAt).toLocaleDateString()}</p>
              </div>
              <Button className="mt-2 w-full" variant="outline">
                View Details
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
