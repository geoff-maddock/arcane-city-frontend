import React, { useState, useRef } from 'react';
import { X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface StringMultiInputProps {
  label: string;
  value: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export const StringMultiInput: React.FC<StringMultiInputProps> = ({
  label,
  value,
  onChange,
  placeholder = 'Type and press Enter...',
  className = '',
  disabled = false,
}) => {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      const newValue = inputValue.trim();
      // Only add if not already in the list
      if (!value.includes(newValue)) {
        onChange([...value, newValue]);
      }
      setInputValue('');
    } else if (e.key === 'Backspace' && inputValue === '' && value.length > 0) {
      e.preventDefault();
      const newValues = [...value];
      newValues.pop();
      onChange(newValues);
    }
  };

  const handleRemoveItem = (indexToRemove: number) => {
    if (disabled) return;
    const newValues = value.filter((_, index) => index !== indexToRemove);
    onChange(newValues);
    inputRef.current?.focus();
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor={`string-multi-input-${label}`}>{label}</Label>

      <div
        className={`
          flex flex-wrap items-center gap-1 p-2 border rounded-md bg-white dark:bg-slate-800 
          border-slate-300 dark:border-slate-600 min-h-[2.5rem] cursor-text
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-slate-400 dark:hover:border-slate-500'}
        `}
        onClick={() => inputRef.current?.focus()}
      >
        {/* Display selected values as tags */}
        {value.map((item, index) => (
          <span
            key={index}
            className="inline-flex items-center px-2 py-1 rounded text-sm bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
          >
            {item}
            {!disabled && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveItem(index);
                }}
                className="ml-1 hover:text-red-600 dark:hover:text-red-400 focus:outline-none"
                aria-label={`Remove ${item}`}
              >
                <X size={14} />
              </button>
            )}
          </span>
        ))}

        {/* Input field */}
        <Input
          ref={inputRef}
          id={`string-multi-input-${label}`}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={value.length === 0 ? placeholder : ''}
          disabled={disabled}
          className="flex-1 min-w-[120px] border-0 outline-none bg-transparent text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus-visible:ring-0 p-0 h-auto"
        />
      </div>
    </div>
  );
};

export default StringMultiInput;
