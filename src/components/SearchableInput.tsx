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
}

export const SearchableInput: React.FC<SearchableInputProps> = ({
  id,
  endpoint,
  value,
  onValueChange,
  placeholder,
  extraParams = {},
}) => {
  const [query, setQuery] = useState('');
  const [selectedName, setSelectedName] = useState('');
  const { data: options } = useSearchOptions(endpoint, query, extraParams);

  useEffect(() => {
    if (value && options) {
      const opt = options.find((o) => o.id === value);
      if (opt) {
        setSelectedName(opt.name);
      }
    } else if (!value) {
      setSelectedName('');
    }
  }, [value, options]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSelectedName(val);
    setQuery(val);
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
      setSelectedName(opt.name);
    } else {
      onValueChange('');
      setSelectedName('');
    }
    setQuery('');
  };

  return (
    <>
      <Input
        id={id}
        list={`${id}-options`}
        value={selectedName}
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
