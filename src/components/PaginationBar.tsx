import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { formatPaginationRange } from '@/lib/utils';

interface PaginationBarProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    itemsPerPage: number;
    totalItems: number;
    className?: string;
}

export function PaginationBar({ currentPage, totalPages, onPageChange, itemsPerPage, totalItems, className }: PaginationBarProps) {
    const startIndex = (currentPage - 1) * itemsPerPage + 1;
    const endIndex = Math.min(currentPage * itemsPerPage, totalItems);

    const showPage = (page: number) => (
        <Button
            key={page}
            variant={page === currentPage ? 'default' : 'outline'}
            onClick={() => onPageChange(page)}
            size="sm"
            className="w-9 h-9 p-0"
        >
            {page}
        </Button>
    );

    const renderPages = () => {
        if (totalPages <= 7) {
            return Array.from({ length: totalPages }, (_, i) => showPage(i + 1));
        }
        const pages: (number | 'ellipsis')[] = [];
        pages.push(1);
        const windowStart = Math.max(2, currentPage - 1);
        const windowEnd = Math.min(totalPages - 1, currentPage + 1);
        if (windowStart > 2) pages.push('ellipsis');
        for (let p = windowStart; p <= windowEnd; p++) pages.push(p);
        if (windowEnd < totalPages - 1) pages.push('ellipsis');
        pages.push(totalPages);
        return pages.map((p, idx) => p === 'ellipsis' ? <span key={idx} className="mx-1">...</span> : showPage(p));
    };

    return (
        <div className={className || 'flex flex-col gap-3 border-t py-3 md:px-6'}>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <p className="text-sm text-gray-700 hidden md:block">
                    {formatPaginationRange(startIndex, endIndex, totalItems)}
                </p>
                <div className="flex items-center justify-between gap-4 w-full md:w-auto">
                    <Button
                        variant="outline"
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        size="sm"
                        className="flex items-center gap-1"
                    >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                    </Button>
                    <div className="hidden md:flex items-center gap-1">
                        {renderPages()}
                    </div>
                    <div className="flex md:hidden items-center">
                        <span className="text-sm text-gray-700 mx-2">
                            Page {currentPage} of {totalPages}
                        </span>
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        size="sm"
                        className="flex items-center gap-1"
                    >
                        Next
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
