import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight } from "lucide-react";
import SortControls from './SortControls';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    itemCount: number;
    totalItems: number;
    itemsPerPage: number;
    onItemsPerPageChange: (count: number) => void;
    sort: string;
    setSort: (value: string) => void;
    direction: 'asc' | 'desc';
    setDirection: (value: 'asc' | 'desc') => void;
    sortOptions: { value: string; label: string }[];
}

const itemsPerPageOptions = [
    { value: "10", label: "10 per page" },
    { value: "25", label: "25 per page" },
    { value: "50", label: "50 per page" },
    { value: "100", label: "100 per page" },
    { value: "1000", label: "All" },
];

export function Pagination({
    currentPage,
    totalPages,
    onPageChange,
    totalItems,
    itemsPerPage,
    onItemsPerPageChange,
    sort,
    setSort,
    direction,
    setDirection,
    sortOptions
}: PaginationProps) {

    return (
        <div className="flex flex-col gap-4 md:gap-0 border-t py-3 md:px-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="flex items-center justify-between md:justify-start gap-4">

                    <p className="text-sm text-gray-700 hidden md:block">
                        Showing{' '}
                        <span className="font-medium">{((currentPage - 1) * itemsPerPage) + 1}</span>{' '}
                        to{' '}
                        <span className="font-medium">
                            {Math.min(currentPage * itemsPerPage, totalItems)}
                        </span>{' '}
                        of{' '}
                        <span className="font-medium">{totalItems}</span>{' '}
                        results
                    </p>

                    <Select
                        value={itemsPerPage.toString()}
                        onValueChange={(value) => onItemsPerPageChange(Number(value))}
                    >
                        <SelectTrigger className="w-[140px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {itemsPerPageOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <SortControls
                        sort={sort}
                        setSort={setSort}
                        direction={direction}
                        setDirection={setDirection}
                        sortOptions={sortOptions}
                    />
                </div>

                <div className="flex items-center justify-between md:justify-end gap-6 mt-4 md:mt-0">
                    <div className="flex items-center justify-between w-full">
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
                            {currentPage > 2 && (
                                <>
                                    <Button
                                        variant="outline"
                                        onClick={() => onPageChange(1)}
                                        size="sm"
                                        className="w-9 h-9 p-0"
                                    >
                                        1
                                    </Button>
                                    {currentPage > 3 && <span className="mx-1">...</span>}
                                </>
                            )}

                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                                .filter(page => {
                                    if (totalPages <= 7) return true;
                                    if (page >= currentPage - 1 && page <= currentPage + 1) return true;
                                    return false;
                                })
                                .map(page => (
                                    <Button
                                        key={page}
                                        variant={page === currentPage ? "default" : "outline"}
                                        onClick={() => onPageChange(page)}
                                        size="sm"
                                        className="w-9 h-9 p-0"
                                    >
                                        {page}
                                    </Button>
                                ))}

                            {currentPage < totalPages - 1 && (
                                <>
                                    {currentPage < totalPages - 2 && <span className="mx-1">...</span>}
                                    <Button
                                        variant="outline"
                                        onClick={() => onPageChange(totalPages)}
                                        size="sm"
                                        className="w-9 h-9 p-0"
                                    >
                                        {totalPages}
                                    </Button>
                                </>
                            )}
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
        </div>
    );
}