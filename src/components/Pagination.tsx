// src/components/Pagination.tsx
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    itemCount: number;
    totalItems: number;
    itemsPerPage: number;
    onItemsPerPageChange: (count: number) => void;
}

const itemsPerPageOptions = [
    { value: "10", label: "10 per page" },
    { value: "25", label: "25 per page" },
    { value: "50", label: "50 per page" },
    { value: "100", label: "100 per page" },
];

export function Pagination({
    currentPage,
    totalPages,
    onPageChange,
    itemCount,
    totalItems,
    itemsPerPage,
    onItemsPerPageChange,
}: PaginationProps) {
    return (
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
            <div className="flex flex-1 items-center justify-between">
                <div className="flex items-center gap-4">
                    <p className="text-sm text-gray-700">
                        Showing{' '}
                        <span className="font-medium">{((currentPage - 1) * itemsPerPage) + 1}</span>{' '}
                        to{' '}
                        <span className="font-medium">
                            {Math.min(currentPage * itemsPerPage, totalItems)}
                        </span>{' '}
                        of{' '}
                        <span className="font-medium">{totalItems}</span>{' '}
                        events
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
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
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

                        <div className="flex items-center gap-1">
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
