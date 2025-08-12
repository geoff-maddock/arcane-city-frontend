import React from 'react';

interface FieldErrorProps {
    name: string;
    errors: Record<string, string[] | string | undefined> | undefined;
}

export const FieldError: React.FC<FieldErrorProps> = ({ name, errors }) => {
    if (!errors) return null;
    const val = errors[name];
    if (!val) return null;
    const messages = Array.isArray(val) ? val : [val];
    return <div className="text-red-500 text-sm mt-1">{messages.join(' ')}</div>;
};
