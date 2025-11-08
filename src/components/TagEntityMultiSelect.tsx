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
 * Commits selection immediately on exact match (e.g., clicking datalist option),
 * or on blur/Enter if exact name match found.
 */
export const TagEntityMultiSelect = ({
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
}: TagEntityMultiSelectProps) => {
    const commit = (value: string) => {
        if (!value) return;
        const opt = options?.find(o => o.name === value);
        if (opt && !valueIds.includes(opt.id)) {
            setValueIds(prev => [...prev, opt.id]);
            setSelected(prev => [...prev, opt]);
        }
        setQuery('');
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setQuery(value);

        // Check if this is an exact match (likely from datalist selection)
        const exactMatch = options?.find(o => o.name === value);
        if (exactMatch && !valueIds.includes(exactMatch.id)) {
            // Use setTimeout to allow the state to update first
            setTimeout(() => commit(value), 0);
        }
    };

    return (
        <div className="space-y-2">
            <label htmlFor={`${datalistId}_input`} className="font-medium text-sm">{label}</label>
            <Input
                id={`${datalistId}_input`}
                list={datalistId}
                value={query}
                placeholder={placeholder}
                onChange={handleChange}
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
                    <span
                        key={item.id}
                        className="px-2 py-1 rounded text-sm flex items-center bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-slate-600 dark:hover:bg-slate-500 dark:text-slate-50 transition-colors border border-gray-300 dark:border-slate-500"
                    >
                        {item.name}
                        <button
                            type="button"
                            aria-label={`${ariaLabelRemove} ${item.name}`}
                            className="ml-1 text-red-500 hover:text-red-400 focus:outline-none focus:ring-2 focus:ring-red-400 rounded dark:text-red-400 dark:hover:text-red-300"
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
