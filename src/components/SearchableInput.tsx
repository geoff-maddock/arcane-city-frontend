import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { useSearchOptions } from '../hooks/useSearchOptions';

interface SearchableInputProps {
  id: string;
  endpoint: string;
  value: number | '';
  onValueChange: (value: number | '') => void;
  placeholder?: string;
  extraParams?: Record<string, string | number>;
  debounceMs?: number;
}

export const SearchableInput: React.FC<SearchableInputProps> = ({
  id,
  endpoint,
  value,
  onValueChange,
  placeholder,
  extraParams = {},
  debounceMs = 300,
}) => {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [displayValue, setDisplayValue] = useState('');
  const { data: options } = useSearchOptions(endpoint, debouncedQuery, extraParams);

  // Debounce the query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, debounceMs]);

  useEffect(() => {
    if (value && options) {
      const opt = options.find((o) => o.id === value);
      if (opt) {
        // Only update display value if it's not currently being typed in
        if (query === '') {
          setDisplayValue(opt.name);
        }
      }
    } else if (!value) {
      if (query === '') {
        setDisplayValue('');
      }
    }
  }, [value, options, query]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setDisplayValue(val);
    setQuery(val);

    // Only update the selected value if we find an exact match
    const opt = options?.find((o) => o.name === val);
    if (opt) {
      onValueChange(opt.id);
    } else {
      onValueChange('');
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const opt = options?.find((o) => o.name === e.target.value);
    if (opt) {
      onValueChange(opt.id);
      setDisplayValue(opt.name);
    } else {
      onValueChange('');
      setDisplayValue('');
    }
    setQuery('');
  };

  return (
    <>
      <Input
        id={id}
        list={`${id}-options`}
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
      />
      <datalist id={`${id}-options`}>
        {options?.map((o) => (
          <option key={o.id} value={o.name} />
        ))}
      </datalist>
    </>
  );
};

export default SearchableInput;
