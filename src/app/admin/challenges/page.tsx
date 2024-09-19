'use client';

import React from 'react';
import { CandidateResponses } from '../CandidateResponses';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export default function ChallengesPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="p-4">
        <CandidateResponses />
      </div>
    </QueryClientProvider>
  );
}