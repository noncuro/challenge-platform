import React from 'react';
import TemplateManager from './TemplateManager';

export default function TemplatesPage() {
    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Challenge Templates</h1>
            <TemplateManager />
        </div>
    );
}