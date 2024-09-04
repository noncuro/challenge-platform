'use client';

import { Textarea, Button, Input } from "@/components/ui";
import { useState } from "react";
import { formatDuration } from "../candidate/TimedSubmissionPlatform";

export const CreateChallengeForm = () => {
    const [email, setEmail] = useState('');
    const [duration, setDuration] = useState(0);
    const [challengeDescription, setChallengeDescription] = useState('');
    const [token, setToken] = useState('');
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const response = await fetch('/api/challenge/create', {
            method: 'POST',
            body: JSON.stringify({ email, duration, challengeDescription }),
        });
        const data = await response.json();
        setToken(data.token);
    }
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