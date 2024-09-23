'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, Input } from '@/components/ui';
import dynamic from 'next/dynamic';
import ReactMarkdown from 'react-markdown';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MarkdownViewer } from '@/components/MarkdownViewer';

const MdEditor = dynamic(() => import('react-markdown-editor-lite'), {
  ssr: false
});

interface Template {
  id: string;
  name: string;
  content: string;
}

const fetchTemplates = async (): Promise<Template[]> => {
    const response = await fetch('/api/templates');
    if (!response.ok) {
        throw new Error('Failed to fetch templates');
    }
    return response.json();
};

const updateTemplate = async (template: Template): Promise<Template> => {
    const response = await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(template),
    });
    if (!response.ok) {
        throw new Error('Failed to update template');
    }
    return response.json();
};

const createTemplate = async (newTemplate: Template): Promise<Template> => {
    const response = await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTemplate),
    });
    if (!response.ok) {
        throw new Error('Failed to create template');
    }
    return response.json();
};

export function TemplateManager() {
    const queryClient = useQueryClient();
    const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newTemplateName, setNewTemplateName] = useState('');
    const [newTemplateContent, setNewTemplateContent] = useState('');

    const { data: templates = [], isLoading, error } = useQuery({
        queryKey: ['templates'],
        queryFn: fetchTemplates,
    });

    const updateTemplateMutation = useMutation({
        mutationFn: updateTemplate,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['templates'] });
            setIsEditing(false);
        },
    });

    const createTemplateMutation = useMutation({
        mutationFn: createTemplate,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['templates'] });
            setIsAddModalOpen(false);
            setNewTemplateName('');
            setNewTemplateContent('');
        },
    });

    const handleSave = async () => {
        if (!selectedTemplate) return;

        const updatedTemplate = {
            id: selectedTemplate.id,
            name: selectedTemplate.name,
            content: selectedTemplate.content,
        };

        try {
            const response = await fetch('/api/templates', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedTemplate),
            });

            if (!response.ok) {
                throw new Error('Failed to update template');
            }

            const updatedData = await response.json();
            queryClient.setQueryData(['templates'], (oldData: Template[]) =>
                oldData.map((template) => (template.id === updatedData.id ? updatedData : template))
            );

            setIsEditing(false);
        } catch (error) {
            console.error('Error updating template:', error);
            // Handle error (e.g., show an error message to the user)
        }
    };

    const handleEditorChange = ({ text }: { text: string }) => {
        if (selectedTemplate) {
            setSelectedTemplate({ ...selectedTemplate, content: text });
        }
    };

    const handleAddTemplate = () => {
        const newTemplate = {
            id: Date.now().toString(),
            name: newTemplateName,
            content: newTemplateContent,
        };
        createTemplateMutation.mutate(newTemplate);
    };

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error.message}</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Manage Templates</h1>
                <div className="space-x-4">
                    <Button onClick={() => window.location.href = '/admin/challenges'}>
                        All Submissions
                    </Button>
                </div>
            </div>
            <div className="grid grid-cols-3 gap-8">
                <Card className="col-span-1">
                    <CardHeader className="flex justify-between items-center">
                        <CardTitle>Templates</CardTitle>
                        <Button onClick={() => setIsAddModalOpen(true)} size="sm">Add New Template</Button>
                    </CardHeader>
                    <CardContent>
                        {templates.map(template => (
                            <Button
                                key={template.id}
                                onClick={() => {
                                    setSelectedTemplate(template);
                                    setIsEditing(false);
                                }}
                                variant={selectedTemplate?.id === template.id ? "default" : "outline"}
                                className="w-full mb-2 justify-start"
                            >
                                {template.name}
                            </Button>
                        ))}
                    </CardContent>
                </Card>
                <Card className="col-span-2">
                    <CardHeader>
                        <CardTitle>{selectedTemplate ? selectedTemplate.name : 'Select a template'}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {selectedTemplate && (
                            isEditing ? (
                                <>
                                    <MdEditor
                                        style={{ height: '400px' }}
                                        renderHTML={text => <MarkdownViewer content={text} />}
                                        onChange={handleEditorChange}
                                        value={selectedTemplate.content}
                                    />
                                    <div className="mt-4 flex justify-end">
                                        <Button onClick={handleSave} className="mr-2">Save</Button>
                                        <Button onClick={() => setIsEditing(false)} variant="outline">Cancel</Button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="bg-gray-100 p-6 rounded-md overflow-auto max-h-96 mb-4 text-lg">
                                        <MarkdownViewer content={selectedTemplate.content} />
                                    </div>
                                    <div className="flex justify-end">
                                        <Button onClick={() => setIsEditing(true)}>
                                            Edit
                                        </Button>
                                    </div>
                                </>
                            )
                        )}
                    </CardContent>
                </Card>
            </div>

            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                    <Card className="w-1/2">
                        <CardHeader>
                            <CardTitle>Add New Template</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Input
                                type="text"
                                placeholder="Template Name"
                                value={newTemplateName}
                                onChange={(e) => setNewTemplateName(e.target.value)}
                                className="mb-4"
                            />
                            <MdEditor
                                style={{ height: '300px' }}
                                renderHTML={text => <ReactMarkdown>{text}</ReactMarkdown>}
                                onChange={({ text }) => setNewTemplateContent(text)}
                                value={newTemplateContent}
                            />
                            <div className="mt-4">
                                <Button onClick={handleAddTemplate} className="mr-2">Add Template</Button>
                                <Button onClick={() => setIsAddModalOpen(false)} variant="outline">Cancel</Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}

export default TemplateManager;