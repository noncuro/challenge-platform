import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  disabled?: boolean;
}

export const Textarea: React.FC<TextareaProps> = ({ className = '', disabled = false, ...props }) => {
  return (
    <textarea
      className={`w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:border-blue-500 ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''} ${className}`}
      disabled={disabled}
      {...props}
    />
  );
};