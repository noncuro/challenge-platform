'use client';

import { CreateChallengeForm } from "./createChallenge";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

const queryClient = new QueryClient();

export default function Admin() {
    return (
        <QueryClientProvider client={queryClient}>
            <div className="p-6">
                <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
                <CreateChallengeForm />
            </div>
        </QueryClientProvider>
    );
}