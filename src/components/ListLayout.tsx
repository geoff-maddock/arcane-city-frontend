import React from 'react';
import { Button } from '@/components/ui/button';
import { PaginationBar } from './PaginationBar';
import { SortControls } from './SortControls';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X } from 'lucide-react';

interface SortingConfig {
    sort: string;
    direction: 'asc' | 'desc';
    setSort: (v: string) => void;
    setDirection: (v: 'asc' | 'desc') => void;
    options: { value: string; label: string }[];
}

interface PaginationConfig {
    page: number;
    totalPages: number;
    onPageChange: (p: number) => void;
    itemsPerPage: number;
    totalItems: number;
    onItemsPerPageChange: (n: number) => void;
    itemsPerPageOptions?: Array<number | 'all'>;
}

interface CreateRoute { to: string; label: string }

interface ListLayoutProps {
    title: string;
    subtitle?: string;
    createRoute?: CreateRoute;
    filtersVisible: boolean;
    onToggleFilters: () => void;
    renderFilters?: () => React.ReactNode;
    renderActiveFilters?: () => React.ReactNode;
    hasActiveFilters: boolean;
    onClearAllFilters?: () => void;
    sorting?: SortingConfig;
    pagination?: PaginationConfig;
    children: React.ReactNode;
    className?: string;
    headerExtras?: React.ReactNode; // e.g., create button override
}

export const ListLayout: React.FC<ListLayoutProps> = ({
    title,
    subtitle,
    createRoute,
    filtersVisible,
    onToggleFilters,
    renderFilters,
    renderActiveFilters,
    hasActiveFilters,
    onClearAllFilters,
    sorting,
    pagination,
    children,
    className,
    headerExtras
}) => {
    const itemsPerPageOptions = pagination?.itemsPerPageOptions || [10, 25, 50, 100, 'all'];

    const TopControls = () => (
        pagination || sorting ? (
            <div className="flex flex-col gap-4 border-t pt-4">
                <div className="flex items-center gap-4 flex-wrap">
                    {pagination && (
                        <Select
                            value={pagination.itemsPerPage >= pagination.totalItems ? 'all' : pagination.itemsPerPage.toString()}
                            onValueChange={(v) => {
                                if (v === 'all') pagination.onItemsPerPageChange(pagination.totalItems); else pagination.onItemsPerPageChange(Number(v));
                                pagination.onPageChange(1);
                            }}
                        >
                            <SelectTrigger className="w-[140px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {itemsPerPageOptions.map(opt => {
                                    const val = opt === 'all' ? 'all' : String(opt);
                                    return <SelectItem key={val} value={val}>{val === 'all' ? 'All' : val + ' per page'}</SelectItem>;
                                })}
                            </SelectContent>
                        </Select>
                    )}
                    {sorting && (
                        <SortControls
                            sort={sorting.sort}
                            setSort={sorting.setSort}
                            direction={sorting.direction}
                            setDirection={sorting.setDirection}
                            sortOptions={sorting.options}
                        />
                    )}
                </div>
                {pagination && (
                    <PaginationBar
                        currentPage={pagination.page}
                        totalPages={pagination.totalPages}
                        onPageChange={pagination.onPageChange}
                        itemsPerPage={pagination.itemsPerPage}
                        totalItems={pagination.totalItems}
                    />
                )}
            </div>
        ) : null
    );

    return (
        <div className={className || 'bg-background text-foreground min-h-screen p-4'}>
            <div className="mx-auto px-6 py-8 max-w-[2400px]">
                <div className="space-y-8">
                    <div className="flex flex-col space-y-2">
                        <h1 className="text-4xl font-bold tracking-tight text-gray-900">{title}</h1>
                        {subtitle && <p className="text-lg text-gray-500">{subtitle}</p>}
                        {createRoute && (
                            <Button asChild className="self-start">
                                <a href={createRoute.to}>{createRoute.label}</a>
                            </Button>
                        )}
                        {headerExtras}
                    </div>

                    <div className="relative">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={onToggleFilters}
                                    className="mb-4 flex items-center border rounded-t-md px-4 py-2 shadow-sm"
                                >
                                    {filtersVisible ? 'Hide Filters' : 'Show Filters'}
                                </button>

                                {!filtersVisible && renderActiveFilters && renderActiveFilters()}

                                {hasActiveFilters && onClearAllFilters && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={onClearAllFilters}
                                        className="mb-4 text-gray-500 hover:text-gray-900"
                                    >
                                        Clear All
                                        <X className="ml-2 h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        </div>

                        {filtersVisible && renderFilters && (
                            <div className="border-gray-100 shadow-sm border rounded-b-md">
                                <div className="p-6 space-y-4">
                                    {renderFilters()}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Top controls */}
                    <TopControls />

                    {/* List content */}
                    {children}

                    {/* Bottom controls */}
                    <TopControls />
                </div>
            </div>
        </div>
    );
};
