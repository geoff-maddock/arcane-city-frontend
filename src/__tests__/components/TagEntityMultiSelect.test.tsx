import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import TagEntityMultiSelect, { OptionItem } from '@/components/TagEntityMultiSelect';
import React from 'react';

const options: OptionItem[] = [
    { id: 1, name: 'Alpha' },
    { id: 2, name: 'Beta' },
];

describe('TagEntityMultiSelect', () => {
    it('adds an item on blur when exact match', () => {
        const Wrapper = () => {
            const [query, setQuery] = React.useState('');
            const [ids, setIds] = React.useState<number[]>([]);
            const [selected, setSelected] = React.useState<OptionItem[]>([]);
            return (
                <TagEntityMultiSelect
                    label="Test"
                    datalistId="test-options"
                    query={query}
                    setQuery={setQuery}
                    options={options}
                    valueIds={ids}
                    setValueIds={setIds}
                    selected={selected}
                    setSelected={setSelected}
                />
            );
        };
        render(<Wrapper />);
        const input = screen.getByLabelText('Test');
        fireEvent.change(input, { target: { value: 'Alpha' } });
        fireEvent.blur(input);
        expect(screen.getByText('Alpha')).toBeInTheDocument();
    });

    it('removes an item when clicking remove', () => {
        const Wrapper = () => {
            const [query, setQuery] = React.useState('');
            const [ids, setIds] = React.useState<number[]>([1]);
            const [selected, setSelected] = React.useState<OptionItem[]>([{ id: 1, name: 'Alpha' }]);
            return (
                <TagEntityMultiSelect
                    label="Test"
                    datalistId="test-options"
                    query={query}
                    setQuery={setQuery}
                    options={options}
                    valueIds={ids}
                    setValueIds={setIds}
                    selected={selected}
                    setSelected={setSelected}
                />
            );
        };
        render(<Wrapper />);
        const removeBtn = screen.getByRole('button', { name: /Remove.*Alpha/i });
        fireEvent.click(removeBtn);
        expect(screen.queryByText('Alpha')).not.toBeInTheDocument();
    });
});
