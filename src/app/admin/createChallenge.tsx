'use client';

import { Button, Input, Select } from "@/components/ui";
import { useState } from "react";
import { formatDuration } from "../candidate/TimedSubmissionPlatform";
import dynamic from 'next/dynamic';
import ReactMarkdown from 'react-markdown';
import React from 'react';
import 'react-markdown-editor-lite/lib/index.css';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const MdEditor = dynamic(() => import('react-markdown-editor-lite'), {
  ssr: false
});

interface Template {
  id: string;
  name: string;
  content: string;
}

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  challengeUrl: string;
}

const SuccessModal: React.FC<SuccessModalProps> = ({ isOpen, onClose, challengeUrl }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(challengeUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">Challenge Created Successfully!</h2>
        <p className="mb-4">Your challenge URL:</p>
        <div className="flex items-center mb-4">
          <input
            type="text"
            value={challengeUrl}
            readOnly
            className="flex-grow border rounded-l px-2 py-1"
          />
          <button
            onClick={copyToClipboard}
            className="bg-blue-500 text-white px-4 py-1 rounded-r hover:bg-blue-600"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <Button onClick={onClose}>Close</Button>
      </div>
    </div>
  );
};

const fetchTemplates = async (): Promise<Template[]> => {
  const response = await fetch('/api/templates');
  if (!response.ok) {
    throw new Error('Failed to fetch templates');
  }
  return response.json();
};

const createChallenge = async (challengeData: { email: string; duration: number; challengeDescription: string }) => {
  const response = await fetch('/api/challenge/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(challengeData),
  });
  if (!response.ok) {
    throw new Error('Failed to create challenge');
  }
  return response.json();
};

export const CreateChallengeForm = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState('');
  const [duration, setDuration] = useState(0);
  const [challengeDescription, setChallengeDescription] = useState('');
  const [token, setToken] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: templates = [] } = useQuery({
    queryKey: ['templates'],
    queryFn: fetchTemplates,
  });

  const createChallengeMutation = useMutation({
    mutationFn: createChallenge,
    onSuccess: (data) => {
      setToken(data.token);
      setIsModalOpen(true);
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    createChallengeMutation.mutate({
      email,
      duration,
      challengeDescription: selectedTemplate ? selectedTemplate.content : challengeDescription,
    });
  };

  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const templateId = e.target.value;
    const template = templates.find(t => t.id === templateId);
    setSelectedTemplate(template || null);
    if (template) {
      setChallengeDescription(template.content);
    } else {
      setChallengeDescription('');
    }
  };

  const handleTemplateEdit = ({ text }: { text: string }) => {
    if (selectedTemplate) {
      setSelectedTemplate({ ...selectedTemplate, content: text });
      setChallengeDescription(text);
    } else {
      setChallengeDescription(text);
    }
  };

  const resetForm = () => {
    setEmail('');
    setDuration(0);
    setChallengeDescription('');
    setSelectedTemplate(null);
    setToken('');
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    resetForm();
    router.push('/admin/challenges');
  };

  const challengeUrl = `http://localhost:3000/candidate?token=${token}&email=${email}`;

  return (
    <div className="max-w-3xl mx-auto">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input type="text" name="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <div className="flex gap-2 items-center">
          <Input type="number" name="duration" placeholder="Duration" value={duration} onChange={(e) => setDuration(parseInt(e.target.value))} />
          <span>{formatDuration(duration)}</span>
        </div>
        <Select 
          onChange={handleTemplateChange}
          value={selectedTemplate?.id || ''}
          className="w-full p-2 border rounded"
        >
          <option value="">Select a template</option>
          {templates.map(template => (
            <option key={template.id} value={template.id}>{template.name}</option>
          ))}
        </Select>
        <div>
          <h3 className="font-bold mb-2">Challenge Description:</h3>
          <MdEditor
            style={{ height: '400px' }}
            renderHTML={text => <ReactMarkdown>{text}</ReactMarkdown>}
            onChange={handleTemplateEdit}
            value={selectedTemplate ? selectedTemplate.content : challengeDescription}
          />
        </div>
        <Button type="submit" disabled={createChallengeMutation.isPending}>
          {createChallengeMutation.isPending ? 'Creating...' : 'Create Challenge'}
        </Button>
      </form>
      <SuccessModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        challengeUrl={challengeUrl}
      />
    </div>
  );
};