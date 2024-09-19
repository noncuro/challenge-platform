import React from 'react';

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'error' | 'warning' | 'success';
}

export const Alert: React.FC<AlertProps> = ({ children, className = '', variant = 'default', ...props }) => {
  const variantStyles = {
    default: 'bg-blue-100 border-blue-500 text-blue-700',
    error: 'bg-red-100 border-red-500 text-red-700',
    warning: 'bg-yellow-100 border-yellow-500 text-yellow-700',
    success: 'bg-green-100 border-green-500 text-green-700',
  };

  return (
    <div className={`border-l-4 p-4 ${variantStyles[variant]} ${className}`} role="alert" {...props}>
      {children}
    </div>
  );
};

export const AlertDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({ children, className = '', ...props }) => (
  <p className={`text-sm ${className}`} {...props}>
    {children}
  </p>
);