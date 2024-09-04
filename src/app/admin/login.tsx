"use client";
import { Button, Input } from "@/components/ui";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";

export const Login = () => {
    const [authKey, setAuthKey] = useState('');
  
    const handleLogin = () => {
      fetch('/api/auth/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ authKey }),
      }).then(res => {
        if (!res.ok) throw new Error('Login failed');
        alert('Login successful');
        return res.json();
      })
    }
  
      return (
        <div className="p-4 max-w-sm flex flex-col gap-4">
          <Input type="text" placeholder="Admin Auth Key" 
          value={authKey} onChange={(e) => setAuthKey(e.target.value)} 
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleLogin();
            }
          }}
          />
          <Button onClick={handleLogin}>Login</Button>
        </div>
      )
  }