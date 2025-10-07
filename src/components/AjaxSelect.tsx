import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchOptions } from '../hooks/useSearchOptions';
import { ChevronDown, X } from 'lucide-react';

export interface Option {
  id: number;
  name: string;
}

interface AjaxSelectProps {
  label: string;
  endpoint: string;
  value: number | ''; // Single selected ID or empty
  onChange: (selectedId: number | '') => void;
  placeholder?: string;
  debounceMs?: number;
  extraParams?: Record<string, string | number>;
  className?: string;
  disabled?: boolean;
}

/**
 * Select2-style AJAX autocomplete single-select component.
 * Features debounced search, inline display of selected item, and dropdown selection.
 */
export const AjaxSelect: React.FC<AjaxSelectProps> = ({
  label,
  endpoint,
  value,
  onChange,
  placeholder = 'Type to search...',
  debounceMs = 300,
  extraParams = {},
  className = '',
  disabled = false,
}) => {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<Option | null>(null);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const prevValueRef = useRef<number | ''>(value);

  // Fetch options using the existing hook, including selected ID if present
  // This ensures that when the component loads with a pre-selected item,
  // its name is fetched from the API
  const { data: options = [] } = useSearchOptions(
    endpoint, 
    debouncedQuery, 
    extraParams,
    {},
    value ? [value] : [] // Pass selected ID to fetch its name
  );

  // Filter out the already selected option
  const availableOptions = selectedOption 
    ? options.filter(option => option.id !== selectedOption.id)
    : options;

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, debounceMs]);

  // Sync selectedOption when value prop changes
  useEffect(() => {
    // Only update if value actually changed
    if (prevValueRef.current !== value) {
      prevValueRef.current = value;
      
      if (!value) {
        setSelectedOption(null);
      } else {
        // Try to find the option in current options first
        const foundOption = options.find(opt => opt.id === value);
        if (foundOption) {
          setSelectedOption(foundOption);
        } else if (!selectedOption || selectedOption.id !== value) {
          // Create placeholder if option not found
          setSelectedOption({ id: value, name: `Selected Item ${value}` });
        }
      }
    }
  }, [value, options, selectedOption]);

  // Update option name when it becomes available in search results
  useEffect(() => {
    if (options.length > 0 && selectedOption && selectedOption.name.startsWith('Selected Item')) {
      const foundOption = options.find(opt => opt.id === selectedOption.id);
      if (foundOption) {
        setSelectedOption(foundOption);
      }
    }
  }, [options, selectedOption]);

  // Handle clicking outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setFocusedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    setIsOpen(true);
    setFocusedIndex(-1);
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const handleOptionSelect = useCallback((option: Option) => {
    setSelectedOption(option);
    onChange(option.id);
    setQuery('');
    setFocusedIndex(-1);
    setIsOpen(false);
    
    // Keep focus on input
    inputRef.current?.focus();
  }, [onChange]);

  const handleClear = useCallback(() => {
    setSelectedOption(null);
    onChange('');
    setQuery('');
    
    // Keep focus on input
    inputRef.current?.focus();
  }, [onChange]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        }
        setFocusedIndex(prev => 
          prev < availableOptions.length - 1 ? prev + 1 : 0
        );
        break;

      case 'ArrowUp':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        }
        setFocusedIndex(prev => 
          prev > 0 ? prev - 1 : availableOptions.length - 1
        );
        break;

      case 'Enter':
        e.preventDefault();
        if (isOpen && focusedIndex >= 0 && availableOptions[focusedIndex]) {
          handleOptionSelect(availableOptions[focusedIndex]);
        }
        break;

      case 'Escape':
        setIsOpen(false);
        setFocusedIndex(-1);
        break;

      case 'Backspace':
        if (query === '' && selectedOption) {
          e.preventDefault();
          handleClear();
        }
        break;
    }
  };

  const toggleDropdown = () => {
    if (disabled) return;
    setIsOpen(!isOpen);
    if (!isOpen) {
      inputRef.current?.focus();
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      
      <div
        ref={containerRef}
        className={`relative ${className}`}
      >
        {/* Main input container */}
        <div
          className={`
            flex items-center gap-1 p-2 border rounded-md bg-white dark:bg-slate-800 
            border-gray-300 dark:border-slate-600 min-h-[2.5rem] cursor-text
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-400 dark:hover:border-slate-500'}
            ${isOpen ? 'ring-2 ring-blue-500 border-blue-500' : ''}
          `}
          onClick={() => inputRef.current?.focus()}
        >
          {/* Selected item */}
          {selectedOption && !query && (
            <span className="inline-flex items-center px-2 py-1 rounded text-sm bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              {selectedOption.name}
              {!disabled && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClear();
                  }}
                  className="ml-1 hover:text-red-600 dark:hover:text-red-400 focus:outline-none"
                  aria-label={`Clear ${selectedOption.name}`}
                >
                  <X size={14} />
                </button>
              )}
            </span>
          )}

          {/* Input field */}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onKeyDown={handleKeyDown}
            placeholder={!selectedOption || query ? placeholder : ''}
            disabled={disabled}
            className="flex-1 min-w-[120px] outline-none bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
          />

          {/* Dropdown indicator */}
          <button
            type="button"
            onClick={toggleDropdown}
            disabled={disabled}
            className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded focus:outline-none"
            aria-label="Toggle dropdown"
          >
            <ChevronDown 
              size={16} 
              className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} 
            />
          </button>
        </div>

        {/* Dropdown */}
        {isOpen && (
          <div
            ref={dropdownRef}
            className="absolute top-full left-0 right-0 z-50 mt-1 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-md shadow-lg max-h-60 overflow-y-auto"
          >
            {availableOptions.length > 0 ? (
              availableOptions.map((option, index) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleOptionSelect(option)}
                  className={`
                    w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-slate-700
                    text-gray-900 dark:text-gray-100 focus:outline-none
                    ${index === focusedIndex ? 'bg-blue-100 dark:bg-blue-900' : ''}
                  `}
                >
                  {option.name}
                </button>
              ))
            ) : query && debouncedQuery ? (
              <div className="px-3 py-2 text-gray-500 dark:text-gray-400 text-sm">
                No results found for "{query}"
              </div>
            ) : !query ? (
              <div className="px-3 py-2 text-gray-500 dark:text-gray-400 text-sm">
                Type to search...
              </div>
            ) : (
              <div className="px-3 py-2 text-gray-500 dark:text-gray-400 text-sm">
                Searching...
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AjaxSelect;
