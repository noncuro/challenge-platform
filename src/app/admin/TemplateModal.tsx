'use client';

import React, { useState, useEffect } from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from '@/components/ui';
import ReactMarkdown from 'react-markdown';
import dynamic from 'next/dynamic';

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
    const [templates, setTemplates] = useState<Template[]>([]);
    const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [newTemplateName, setNewTemplateName] = useState('');

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        try {
            const response = await fetch('/api/templates');
            if (response.ok) {
                const data = await response.json();
                setTemplates(data);
            } else {
                console.error('Failed to fetch templates');
            }
        } catch (error) {
            console.error('Error fetching templates:', error);
        }
    };

    const handleSaveTemplate = async () => {
        if (!selectedTemplate) return;

        try {
            const response = await fetch('/api/templates', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(selectedTemplate),
            });

            if (response.ok) {
                await fetchTemplates();
                setIsEditing(false);
            } else {
                console.error('Failed to save template');
            }
        } catch (error) {
            console.error('Error saving template:', error);
        }
    };

    const handleCreateTemplate = async () => {
        if (!newTemplateName) return;

        const newTemplate: Template = {
            id: Date.now().toString(),
            name: newTemplateName,
            content: '',
        };

        try {
            const response = await fetch('/api/templates', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newTemplate),
            });

            if (response.ok) {
                await fetchTemplates();
                setNewTemplateName('');
                setSelectedTemplate(newTemplate);
                setIsEditing(true);
            } else {
                console.error('Failed to create template');
            }
        } catch (error) {
            console.error('Error creating template:', error);
        }
    };

    const handleEditorChange = ({ text }: { text: string }) => {
        if (selectedTemplate) {
            setSelectedTemplate({ ...selectedTemplate, content: text });
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <Card className="w-3/4 h-3/4 overflow-auto">
                <CardHeader className="flex justify-between items-center">
                    <CardTitle className="text-2xl">Challenge Templates</CardTitle>
                    <Button onClick={onClose} variant="outline">Close</Button>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-3 gap-6">
                        <div className="col-span-1 space-y-4">
                            {templates.map(template => (
                                <Button
                                    key={template.id}
                                    onClick={() => {
                                        setSelectedTemplate(template);
                                        setIsEditing(false);
                                    }}
                                    variant={selectedTemplate?.id === template.id ? "default" : "outline"}
                                    className="w-full justify-start text-left"
                                >
                                    {template.name}
                                </Button>
                            ))}
                            <Input
                                type="text"
                                placeholder="New template name"
                                value={newTemplateName}
                                onChange={(e) => setNewTemplateName(e.target.value)}
                                className="mt-4"
                            />
                            <Button onClick={handleCreateTemplate} className="w-full">
                                Create New Template
                            </Button>
                        </div>
                        <div className="col-span-2">
                            {selectedTemplate && (
                                <div>
                                    <h3 className="text-xl font-bold mb-4">{selectedTemplate.name}</h3>
                                    {isEditing ? (
                                        <>
                                            <MdEditor
                                                style={{ height: '400px' }}
                                                renderHTML={text => <ReactMarkdown>{text}</ReactMarkdown>}
                                                onChange={handleEditorChange}
                                                value={selectedTemplate.content}
                                            />
                                            <Button onClick={handleSaveTemplate} className="mt-4">
                                                Save Changes
                                            </Button>
                                        </>
                                    ) : (
                                        <>
                                            <div className="bg-gray-100 p-4 rounded-md overflow-auto max-h-96 mb-4">
                                                <ReactMarkdown>{selectedTemplate.content}</ReactMarkdown>
                                            </div>
                                            <Button onClick={() => setIsEditing(true)}>
                                                Edit Template
                                            </Button>
                                        </>
                                    )}
                                </div>
                            )}
                            {!selectedTemplate && (
                                <p className="text-gray-500 italic">Select a template to view its content</p>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};