'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TimedSubmissionPlatform } from './TimedSubmissionPlatform';
import React from 'react';

const queryClient = new QueryClient();

export default function TimedSubmissionWrapper() {
  return (
    <QueryClientProvider client={queryClient}>
      <TimedSubmissionPlatform />
    </QueryClientProvider>
  );
}