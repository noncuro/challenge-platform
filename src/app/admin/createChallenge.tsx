'use client';

import { Button, Input } from "@/components/ui";
import React ,{ useState, useEffect } from "react";
import dynamic from 'next/dynamic';
import ReactMarkdown from 'react-markdown';
import 'react-markdown-editor-lite/lib/index.css';

const MdEditor = dynamic(() => import('react-markdown-editor-lite'), {
  ssr: false
});

interface CreateChallengeFormProps {
    onSuccess?: () => void;
}

interface Template {
    id: string;
    name: string;
    content: string;
}

export const CreateChallengeForm: React.FC<CreateChallengeFormProps> = ({ onSuccess }) => {
    const [templates, setTemplates] = useState<Template[]>([]);
    const [selectedTemplate, setSelectedTemplate] = useState<string>('');
    const [challengeDescription, setChallengeDescription] = useState('');
    const [duration, setDuration] = useState(60); // Default duration in minutes
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

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

    const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const templateId = e.target.value;
        setSelectedTemplate(templateId);
        const template = templates.find(t => t.id === templateId);
        if (template) {
            setChallengeDescription(template.content);
        }
    };

    const handleEditorChange = ({ text }: { text: string }) => {
        setChallengeDescription(text);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            const response = await fetch('/api/challenge/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    templateId: selectedTemplate,
                    description: challengeDescription,
                    duration,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Challenge created:', data);
                if (onSuccess) onSuccess();
            } else {
                const errorData = await response.json();
                setError(errorData.message || 'Failed to create challenge');
            }
        } catch (error) {
            console.error('Error creating challenge:', error);
            setError('An unexpected error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="text-red-500">{error}</div>}
            <div>
                <label htmlFor="email" className="block mb-2">Candidate Email:</label>
                <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
            </div>
            <div>
                <label htmlFor="template" className="block mb-2">Select Template:</label>
                <select
                    id="template"
                    value={selectedTemplate}
                    onChange={handleTemplateChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                >
                    <option value="">Select a template</option>
                    {templates.map(template => (
                        <option key={template.id} value={template.id}>{template.name}</option>
                    ))}
                </select>
            </div>
            <div>
                <label htmlFor="description" className="block mb-2">Challenge Description:</label>
                <MdEditor
                    value={challengeDescription}
                    onChange={handleEditorChange}
                    renderHTML={(text) => <ReactMarkdown>{text}</ReactMarkdown>}
                    style={{ height: '300px' }}
                />
            </div>
            <div>
                <label htmlFor="duration" className="block mb-2">Duration (minutes):</label>
                <Input
                    id="duration"
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    min={1}
                    required
                />
            </div>
            <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create Challenge'}
            </Button>
        </form>
    );
};