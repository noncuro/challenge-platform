import { ChallengeResponses } from '../CandidateResponses';
import QueryProvider from '@/app/QueryProvider';
import React from 'react';

export default function ChallengesPage() {
  return (
    <QueryProvider>
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">All Challenges</h1>
        <ChallengeResponses />
      </div>
    </QueryProvider>
  );
}