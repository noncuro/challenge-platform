import React from 'react';

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => {
  return <input {...props} className={`px-2 py-1 border rounded ${props.className || ''}`} />;
};