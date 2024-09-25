'use client';

import {Button, Input, Select} from "@/components/ui";
import React, {useMemo, useState} from "react";
import dynamic from 'next/dynamic';
import ReactMarkdown from 'react-markdown';
import 'react-markdown-editor-lite/lib/index.css';
import {useRouter} from 'next/navigation';
import {useMutation} from '@tanstack/react-query';
import {CreateChallengeRequest} from "@/app/api/challenge/create/route";
import {useTemplates} from "@/state";
import {formatDuration} from "@/utils";
import {SuccessModal} from "@/app/admin/create-challenge/ChallengeCreatedModal";

const MdEditor = dynamic(() => import('react-markdown-editor-lite'), {
  ssr: false
});

interface Template {
  id: string;
  name: string;
  content: string;
}


const validateEmail = (email: string) => {
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(String(email).toLowerCase());
};

export const CreateChallengeForm = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [duration, setDuration] = useState("0");
  const [challengeDescription, setChallengeDescription] = useState('');
  const [token, setToken] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const { data: templates = [] } = useTemplates();

  const createChallengeMutation = useMutation({
    mutationFn: async (challengeData: CreateChallengeRequest) => {
      const response = await fetch('/api/admin/challenge/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(challengeData),
      });
      if (!response.ok) {
        throw new Error('Failed to create challenge');
      }
      return await response.json() as { token: string }; // TODO
    },
    onSuccess: (data) => {
      setToken(data.token);
      setIsSuccessModalOpen(true);
    },
  });
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isFormValid && durationParsed) {
      createChallengeMutation.mutate({
        email,
        duration: durationParsed,
        challengeDescription: selectedTemplate ? selectedTemplate.content : challengeDescription,
      });
    }
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
    setDuration("0");
    setChallengeDescription('');
    setSelectedTemplate(null);
    setToken('');
  };

  const handleCloseModal = () => {
    setIsSuccessModalOpen(false);
    resetForm();
    router.push('/admin/challenges');
  };

  const [durationParsed, durationError] = useMemo(() => {
    // If duration starts with =, it's a formula
    if (duration.startsWith("=")){
      const formula = duration.slice(1);
      try {
        const parsed = eval(formula);
        if(typeof parsed === 'number' && !isNaN(parsed) && parsed > 0 && parsed === Math.floor(parsed))
          return [parsed, null];

        return [null, "Error: Invalid formula"];
      } catch (error: any) {
        return [null, "Error: Invalid formula"];
      }
    }
    const parsedDuration = parseInt(duration);
    if (isNaN(parsedDuration)) {
      return [null, 'Duration must be a number'];
    }
    if (parsedDuration < 0) {
      return [null, 'Duration must be greater than 0'];
    }
    return [parsedDuration, null]
  }, [duration]);

  const emailIsValid = !email || validateEmail(email)
  const emailError = !emailIsValid && "Please enter a valid email address"
  const isFormValid = email && emailIsValid && !durationError && !!challengeDescription

  const challengeUrl = `http://localhost:3000/?token=${token}&email=${email}`;

  return (
    <div className="max-w-3xl mx-auto">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <Input 
            type="text" 
            name="email" 
            placeholder="Email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            className={emailError ? 'border-red-500' : ''}
          />
          {emailError && <p className="text-red-500 text-sm mt-1">Please enter a valid email address</p>}
        </div>
        <div>
          <div className="flex gap-2 items-center">
            <Input 
              type="text"
              name="duration" 
              placeholder="Duration" 
              value={duration} 
              onChange={(e) => setDuration(e.target.value)}
              className={durationError ? 'border-red-500' : ''}
            />
            <span>{formatDuration(durationParsed)}</span>
          </div>
          {durationError && <p className="text-red-500 text-sm mt-1">{durationError}</p>}
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
        <Button type="submit" disabled={createChallengeMutation.isPending || !isFormValid}>
          {createChallengeMutation.isPending ? 'Creating...' : 'Create Challenge'}
        </Button>
      </form>
      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={handleCloseModal}
        challengeUrl={challengeUrl}
      />
    </div>
  );
};