'use client';

import React, { useState } from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from '@/components/ui';
import ReactMarkdown from 'react-markdown';
import dynamic from 'next/dynamic';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { X } from 'lucide-react'; // For close icon

const MdEditor = dynamic(() => import('react-markdown-editor-lite'), {
  ssr: false
});

interface Template {
    id: string;
    name: string;
    content: string;
}

interface TemplateModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const TemplateModal: React.FC<TemplateModalProps> = ({ isOpen, onClose }) => {
    const queryClient = useQueryClient();
    const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [newTemplateName, setNewTemplateName] = useState('');
    const [newTemplateContent, setNewTemplateContent] = useState('');

    const { data: templates = [], isLoading, error } = useQuery({
        queryKey: ['templates'],
        queryFn: async () => {
            const response = await fetch('/api/templates');
            if (!response.ok) {
                throw new Error('Failed to fetch templates');
            }
            return response.json();
        },
    });

    const updateTemplateMutation = useMutation({
        mutationFn: async (template: Template) => {
            const response = await fetch('/api/templates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(template),
            });
            if (!response.ok) {
                throw new Error('Failed to update template');
            }
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['templates'] });
            setIsEditing(false);
        },
    });

    const createTemplateMutation = useMutation({
        mutationFn: async (newTemplate: Template) => {
            const response = await fetch('/api/templates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newTemplate),
            });
            if (!response.ok) {
                throw new Error('Failed to create template');
            }
            return response.json();
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['templates'] });
            setNewTemplateName('');
            setSelectedTemplate(data);
            setIsEditing(true);
        },
    });

    const handleSaveTemplate = () => {
        if (!selectedTemplate) return;
        updateTemplateMutation.mutate(selectedTemplate);
    };

    const handleCreateTemplate = () => {
        if (!newTemplateName) return;
        const newTemplate: Template = {
            id: Date.now().toString(),
            name: newTemplateName,
            content: '',
        };
        createTemplateMutation.mutate(newTemplate);
    };

    const handleEditorChange = ({ text }: { text: string }) => {
        if (selectedTemplate) {
            setSelectedTemplate({ ...selectedTemplate, content: text });
        }
    };

    if (!isOpen) return null;

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error.message}</div>;
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4">
            <Card className="w-full max-w-4xl"> {/* Increased max-width here */}
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-xl font-bold">Add New Template</CardTitle>
                    <Button onClick={onClose} variant="ghost" className="h-8 w-8 p-0">
                        <X className="h-4 w-4" />
                    </Button>
                </CardHeader>
                <CardContent>
                    <Input
                        type="text"
                        placeholder="Template Name"
                        value={newTemplateName}
                        onChange={(e) => setNewTemplateName(e.target.value)}
                        className="mb-4 text-lg"
                    />
                    <MdEditor
                        style={{ height: '400px', border: '1px solid #e2e8f0' }}
                        renderHTML={text => <ReactMarkdown>{text}</ReactMarkdown>}
                        onChange={({ text }) => setNewTemplateContent(text)}
                        value={newTemplateContent}
                        config={{
                            view: { menu: true, md: true, html: true },
                            canView: { menu: true, md: true, html: true, fullScreen: false, hideMenu: false },
                        }}
                    />
                    <div className="mt-6 flex justify-end space-x-2">
                        <Button onClick={onClose} variant="outline">Cancel</Button>
                        <Button onClick={handleAddTemplate}>Add Template</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};