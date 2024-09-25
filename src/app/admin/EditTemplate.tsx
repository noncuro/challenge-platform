'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, Input } from '@/components/ui';
import dynamic from 'next/dynamic';
import 'react-markdown-editor-lite/lib/index.css';
import ReactMarkdown from 'react-markdown';
import { useTemplate } from '@/state';

const MdEditor = dynamic(() => import('react-markdown-editor-lite'), {
  ssr: false
});

interface Template {
    id: string;
    name: string;
    content: string;
}


const updateTemplate = async (template: Template): Promise<void> => {
    const response = await fetch(`/api/admin/templates`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(template),
    });
    if (!response.ok) throw new Error('Failed to update template');
};

const EditTemplate = () => {
    const searchParams = useSearchParams();
    const id = searchParams?.get('id') || '';
    const queryClient = useQueryClient();
    const router = useRouter();

    const { data: template, isLoading, error } = useTemplate({templateId: id})

    const mutation = useMutation({
        mutationFn: updateTemplate,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['template', id] });
            router.push('/admin');
        },
    });

    const handleSave = () => {
        if (template) {
            mutation.mutate(template);
        }
    };

    const handleEditorChange = ({ text }: { text: string }) => {
        if (template) {
            queryClient.setQueryData(['template', id], (oldData: Template | undefined) => {
                return oldData ? { ...oldData, content: text } : undefined;
            });
        }
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (template) {
            queryClient.setQueryData(['template', id], (oldData: Template | undefined) => {
                return oldData ? { ...oldData, name: e.target.value } : undefined;
            });
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
                onChange={handleNameChange}
                placeholder="Template Name"
                className="mb-4"
            />
            <MdEditor
                value={template.content}
                onChange={handleEditorChange}
                style={{ height: '500px' }}
                renderHTML={(text) => <ReactMarkdown>{text}</ReactMarkdown>}
            />
            <Button onClick={handleSave} disabled={mutation.isPending} className="mt-4">
                {mutation.isPending ? 'Saving...' : 'Save'}
            </Button>
        </div>
    );
};

export default EditTemplate;