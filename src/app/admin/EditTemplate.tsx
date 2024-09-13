'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, Input } from '@/components/ui';
import dynamic from 'next/dynamic';
import 'react-markdown-editor-lite/lib/index.css';
import ReactMarkdown from 'react-markdown';

const MdEditor = dynamic(() => import('react-markdown-editor-lite'), {
  ssr: false
});

interface Template {
    id: string;
    name: string;
    content: string;
}

const fetchTemplate = async (id: string): Promise<Template> => {
    const response = await fetch(`/api/templates/${id}`);
    if (!response.ok) throw new Error('Failed to fetch template');
    return response.json();
};

const updateTemplate = async (template: Template): Promise<void> => {
    const response = await fetch(`/api/templates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(template),
    });
    if (!response.ok) throw new Error('Failed to update template');
};

const EditTemplate: React.FC = () => {
    const searchParams = useSearchParams();
    const id = searchParams.get('id') || '';
    const queryClient = useQueryClient();

    const { data: template, isLoading, error } = useQuery({
        queryKey: ['template', id],
        queryFn: () => fetchTemplate(id),
        enabled: !!id,
    });

    const mutation = useMutation({
        mutationFn: updateTemplate,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['template', id] });
            window.location.href = '/admin';
        },
    });

    const handleSave = () => {
        if (template) {
            mutation.mutate(template);
        }
    };

    const handleEditorChange = ({ text }: { text: string }) => {
        if (template) {
            queryClient.setQueryData(['template', id], { ...template, content: text });
        }
    };

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error loading template</div>;
    if (!template) return <div>No template found</div>;

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Edit Template</h1>
            <Input
                type="text"
                value={template.name}
                onChange={(e) => queryClient.setQueryData(['template', id], { ...template, name: e.target.value })}
                placeholder="Template Name"
                className="mb-4"
            />
            <MdEditor
                value={template.content}
                onChange={handleEditorChange}
                style={{ height: '500px' }}
                renderHTML={(text) => <ReactMarkdown>{text}</ReactMarkdown>}
            />
            <Button onClick={handleSave} disabled={mutation.isLoading} className="mt-4">
                {mutation.isLoading ? 'Saving...' : 'Save'}
            </Button>
        </div>
    );
};

export default EditTemplate;