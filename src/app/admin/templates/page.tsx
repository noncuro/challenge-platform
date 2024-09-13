'use client';

import React from 'react';
import { TemplateManager } from './TemplateManager';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export default function TemplatesPage() {
    return (
        <QueryClientProvider client={queryClient}>
            <div className="p-4">
                <TemplateManager />
            </div>
        </QueryClientProvider>
    );
}