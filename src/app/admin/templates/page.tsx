import React from 'react';
import { TemplateManager } from './TemplateManager';
import QueryProvider from '@/app/QueryProvider';

export default function TemplatesPage() {
    return (
        <QueryProvider>
            <div className="p-4">
                {/* <h1 className="text-2xl font-bold mb-4">Challenge Templates</h1> */}
                <TemplateManager />
            </div>
        </QueryProvider>
    );
}