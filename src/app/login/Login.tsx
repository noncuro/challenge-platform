'use client';

import React, { useState } from 'react';
import { Button, Input } from "@/components/ui";

export const Login = () => {
  const [authKey, setAuthKey] = useState('');

  const handleLogin = async () => {
    try {
      const response = await fetch('/api/auth/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ authKey }),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      alert('Login successful');
      // Redirect or update state as needed
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed');
    }
  };

  return (
    <div className="p-4 max-w-sm mx-auto flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Admin Login</h1>
      <Input
        type="text"
        placeholder="Admin Auth Key"
        value={authKey}
        onChange={(e) => setAuthKey(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            handleLogin();
          }
        }}
      />
      <Button onClick={handleLogin}>Login</Button>
    </div>
  );
};