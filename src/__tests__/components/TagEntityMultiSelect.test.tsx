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

    it('adds an item immediately when input value matches option exactly (simulates datalist click)', async () => {
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
        // Simulate clicking on a datalist option by changing the value to an exact match
        fireEvent.change(input, { target: { value: 'Alpha' } });
        
        // Wait for the async commit to happen
        await screen.findByText('Alpha');
        
        // Input should be cleared after selection
        expect(input).toHaveValue('');
    });

    it('does not auto-commit when typing partial matches', () => {
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
        // Type partial match - should not auto-commit
        fireEvent.change(input, { target: { value: 'Alph' } });
        
        // Should not be added to selected items
        expect(screen.queryByText('Alpha')).not.toBeInTheDocument();
        // Input should still have the typed value
        expect(input).toHaveValue('Alph');
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
