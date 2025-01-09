import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

interface SortControlsProps {
    sort: string;
    setSort: (value: string) => void;
    direction: 'asc' | 'desc';
    setDirection: (value: 'asc' | 'desc') => void;
    sortOptions: { value: string; label: string }[];
}

const SortControls: React.FC<SortControlsProps> = ({ sort, setSort, direction, setDirection, sortOptions }) => {
    return (
        <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Sort by:</span>
                <Select
                    value={sort}
                    onValueChange={(value) => setSort(value)}
                >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {sortOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDirection(direction === 'asc' ? 'desc' : 'asc')}
                    className="text-gray-500"
                >
                    {direction === 'asc' ? '↑' : '↓'}
                </Button>
            </div>
        </div>
    );
};

export default SortControls;