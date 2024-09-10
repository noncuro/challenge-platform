'use client';

import { Textarea, Button, Input } from "@/components/ui";
import { useState } from "react";
import { formatDuration } from "../candidate/TimedSubmissionPlatform";
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
    onChallengeCreated?: () => void;
}

interface Template {
    id: string;
    name: string;
    content: string;
}

export const CreateChallengeForm: React.FC<CreateChallengeFormProps> = ({ onSuccess, onChallengeCreated }) => {
    const [templates, setTemplates] = useState<Template[]>([]);
    const [selectedTemplate, setSelectedTemplate] = useState<string>('');
    const [challengeDescription, setChallengeDescription] = useState('');
    const [token, setToken] = useState('');
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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
                if (onChallengeCreated) onChallengeCreated();
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
        <div>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-md">
            <Input type="text" name="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <div className="flex gap-2">
                <Input type="number" name="duration" placeholder="Duration" value={duration} onChange={(e) => setDuration(parseInt(e.target.value))} />
                <span>{formatDuration(duration)}</span>
            </div>
            <Textarea name="challengeDescription" placeholder="Challenge Description" className="h-40" value={challengeDescription} onChange={(e) => setChallengeDescription(e.target.value)} />
            <Button type="submit">Create Challenge</Button>
        </form><div>
                {token && <p>Token: http://localhost:3000/candidate?token={token}</p>}
            </div>
            </div>
    )
}