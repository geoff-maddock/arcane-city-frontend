import React from 'react';
import { Input } from '@/components/ui/input';

export interface OptionItem { id: number; name: string }

interface TagEntityMultiSelectProps {
    label: string;
    datalistId: string; // unique id for the datalist
    query: string;
    setQuery: (v: string) => void;
    options?: OptionItem[];
    valueIds: number[]; // underlying id list bound to form state
    setValueIds: React.Dispatch<React.SetStateAction<number[]>>;
    selected: OptionItem[]; // selected option objects for chip display
    setSelected: React.Dispatch<React.SetStateAction<OptionItem[]>>;
    placeholder?: string;
    ariaLabelRemove?: string; // accessible label prefix for remove button
}

/**
 * Reusable multiselect built on native datalist for lightweight fuzzy picking.
 * Commits selection on blur or Enter if exact name match found.
 */
export const TagEntityMultiSelect: React.FC<TagEntityMultiSelectProps> = ({
    label,
    datalistId,
    query,
    setQuery,
    options,
    valueIds,
    setValueIds,
    selected,
    setSelected,
    placeholder,
    ariaLabelRemove = 'Remove'
}) => {
    const commit = (value: string) => {
        if (!value) return;
        const opt = options?.find(o => o.name === value);
        if (opt && !valueIds.includes(opt.id)) {
            setValueIds(prev => [...prev, opt.id]);
            setSelected(prev => [...prev, opt]);
        }
        setQuery('');
    };

    return (
        <div className="space-y-2">
            <label htmlFor={`${datalistId}_input`} className="font-medium text-sm">{label}</label>
            <Input
                id={`${datalistId}_input`}
                list={datalistId}
                value={query}
                placeholder={placeholder}
                onChange={e => setQuery(e.target.value)}
                onBlur={e => commit(e.target.value)}
                onKeyDown={e => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        commit((e.target as HTMLInputElement).value);
                    }
                }}
            />
            <datalist id={datalistId}>
                {options?.map(o => (
                    <option key={o.id} value={o.name} />
                ))}
            </datalist>
            <div className="flex flex-wrap gap-2">
                {selected.map(item => (
                    <span key={item.id} className="px-2 py-1 bg-gray-200 rounded text-sm flex items-center">
                        {item.name}
                        <button
                            type="button"
                            aria-label={`${ariaLabelRemove} ${item.name}`}
                            className="ml-1 text-red-500 focus:outline-none focus:ring-2 focus:ring-red-400 rounded"
                            onClick={() => {
                                setSelected(p => p.filter(t => t.id !== item.id));
                                setValueIds(p => p.filter(id => id !== item.id));
                            }}
                        >×</button>
                    </span>
                ))}
            </div>
        </div>
    );
};

export default TagEntityMultiSelect;
