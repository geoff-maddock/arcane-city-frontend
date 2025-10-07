import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchOptions } from '../hooks/useSearchOptions';
import { ChevronDown, X } from 'lucide-react';

export interface Option {
  id: number;
  name: string;
}

interface AjaxMultiSelectProps {
  label: string;
  endpoint: string;
  value: number[]; // Array of selected IDs
  onChange: (selectedIds: number[]) => void;
  placeholder?: string;
  debounceMs?: number;
  extraParams?: Record<string, string | number>;
  className?: string;
  disabled?: boolean;
}

/**
 * Select2-style AJAX autocomplete multi-select component.
 * Features debounced search, inline tag display, and dropdown selection.
 */
export const AjaxMultiSelect: React.FC<AjaxMultiSelectProps> = ({
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
  const [selectedOptions, setSelectedOptions] = useState<Option[]>([]);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const prevValueRef = useRef<number[]>(value);

  // Fetch options using the existing hook, including selected IDs
  // This ensures that when the component loads with pre-selected items,
  // their names are fetched from the API
  const { data: options = [] } = useSearchOptions(
    endpoint, 
    debouncedQuery, 
    extraParams,
    {},
    value // Pass selected IDs to fetch their names
  );

  // Filter out already selected options
  const availableOptions = options.filter(option => !value.includes(option.id));

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, debounceMs]);

  // Sync selectedOptions when value prop changes
  useEffect(() => {
    // Only update if value actually changed
    if (JSON.stringify(prevValueRef.current) !== JSON.stringify(value)) {
      prevValueRef.current = value;
      
      if (value.length === 0) {
        setSelectedOptions([]);
      } else {
        // Keep existing selectedOptions that are still in value array
        setSelectedOptions(prev => {
          const stillSelected = prev.filter(opt => value.includes(opt.id));
          
          // For new IDs not in selectedOptions, create placeholder entries
          const newIds = value.filter(id => !stillSelected.some(opt => opt.id === id));
          const newOptions = newIds.map(id => {
            // Try to find the option in available options first
            const foundOption = options.find(opt => opt.id === id);
            return foundOption || { id, name: `Selected Item ${id}` };
          });
          
          return [...stillSelected, ...newOptions];
        });
      }
    }
  }, [value, options]);

  // Update option names when they become available in search results
  useEffect(() => {
    if (options.length > 0) {
      setSelectedOptions(prev => 
        prev.map(selected => {
          const foundOption = options.find(opt => opt.id === selected.id);
          // Only update if we found a better name (not a placeholder)
          if (foundOption && selected.name.startsWith('Selected Item')) {
            return foundOption;
          }
          return selected;
        })
      );
    }
  }, [options]);

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
    if (!value.includes(option.id)) {
      const newSelectedOptions = [...selectedOptions, option];
      const newValue = [...value, option.id];
      
      setSelectedOptions(newSelectedOptions);
      onChange(newValue);
      setQuery('');
      setFocusedIndex(-1);
      
      // Keep focus on input
      inputRef.current?.focus();
    }
  }, [value, selectedOptions, onChange]);

  const handleRemoveTag = useCallback((optionId: number) => {
    const newSelectedOptions = selectedOptions.filter(opt => opt.id !== optionId);
    const newValue = value.filter(id => id !== optionId);
    
    setSelectedOptions(newSelectedOptions);
    onChange(newValue);
    
    // Keep focus on input
    inputRef.current?.focus();
  }, [selectedOptions, value, onChange]);

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
        if (query === '' && selectedOptions.length > 0) {
          e.preventDefault();
          const lastOption = selectedOptions[selectedOptions.length - 1];
          handleRemoveTag(lastOption.id);
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
            flex flex-wrap items-center gap-1 p-2 border rounded-md bg-white dark:bg-slate-800 
            border-gray-300 dark:border-slate-600 min-h-[2.5rem] cursor-text
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-400 dark:hover:border-slate-500'}
            ${isOpen ? 'ring-2 ring-blue-500 border-blue-500' : ''}
          `}
          onClick={() => inputRef.current?.focus()}
        >
          {/* Selected tags */}
          {selectedOptions.map((option) => (
            <span
              key={option.id}
              className="inline-flex items-center px-2 py-1 rounded text-sm bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
            >
              {option.name}
              {!disabled && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveTag(option.id);
                  }}
                  className="ml-1 hover:text-red-600 dark:hover:text-red-400 focus:outline-none"
                  aria-label={`Remove ${option.name}`}
                >
                  <X size={14} />
                </button>
              )}
            </span>
          ))}

          {/* Input field */}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onKeyDown={handleKeyDown}
            placeholder={selectedOptions.length === 0 ? placeholder : ''}
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

export default AjaxMultiSelect;