import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

interface SortControlsProps {
    sort: string;
    setSort: (value: string) => void;
    direction: 'asc' | 'desc';
    setDirection: (value: 'asc' | 'desc') => void;
    sortOptions: { value: string; label: string }[];
}

const SortControls = ({ sort, setSort, direction, setDirection, sortOptions }: SortControlsProps) => {
    return (

        <div className="flex items-center gap-1 sm:gap-2">
            <span className="text-sm text-gray-500 hidden sm:inline">Sort by:</span>
            <Select
                value={sort}
                onValueChange={(value) => setSort(value)}
            >
                <SelectTrigger className="w-[120px] sm:w-[180px]" aria-label="Sort by">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent position="popper" align="end" sideOffset={5}>
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
                className="text-gray-500 min-w-[32px]"
                aria-label={`Sort ${direction === 'asc' ? 'ascending' : 'descending'}`}
            >
                {direction === 'asc' ? '↑' : '↓'}
            </Button>
        </div>

    );
};

export default SortControls;