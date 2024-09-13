'use client';

import { CreateChallengeForm } from '../createChallenge';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import 'react-markdown-editor-lite/lib/index.css';
import React from 'react';

const queryClient = new QueryClient();

export default function CreateChallengePage() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Create Challenge</h1>
        <CreateChallengeForm />
      </div>
    </QueryClientProvider>
  );
}