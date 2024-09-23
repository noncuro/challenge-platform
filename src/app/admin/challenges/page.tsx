'use client';

import React from 'react';
import { CandidateResponses } from '../CandidateResponses';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorProvider } from '@/contexts/ErrorContext';

const queryClient = new QueryClient();

export default function ChallengesPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorProvider>
        <div className="p-4">
          <CandidateResponses />
        </div>
      </ErrorProvider>
    </QueryClientProvider>
  );
}