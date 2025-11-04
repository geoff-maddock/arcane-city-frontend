import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageSquare, User, FileText, Activity as ActivityIcon } from 'lucide-react';
import { useUsers } from '../hooks/useUsers';
import { useMemo } from 'react';

interface ActivityFiltersProps {
    filters: {
        action: string;
        message: string;
        object_table: string;
        user_id: string;
    };
    onFilterChange: (filters: ActivityFiltersProps['filters']) => void;
}

export default function ActivityFilters({ filters, onFilterChange }: ActivityFiltersProps) {
    // Fetch all users for the dropdown, sorted alphabetically
    const { data: usersData } = useUsers({
        itemsPerPage: 1000,
        sort: 'name',
        direction: 'asc',
    });

    // Memoize sorted users list
    const sortedUsers = useMemo(() => {
        if (!usersData?.data) return [];
        return [...usersData.data].sort((a, b) => a.name.localeCompare(b.name));
    }, [usersData?.data]);

    return (
        <div className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                <div className="space-y-2">
                    <Label htmlFor="action">Action</Label>
                    <div className="relative">
                        <ActivityIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <Input
                            id="action"
                            placeholder="Filter by action..."
                            className="pl-9"
                            value={filters.action}
                            onChange={(e) => onFilterChange({ ...filters, action: e.target.value })}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <div className="relative">
                        <MessageSquare className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <Input
                            id="message"
                            placeholder="Filter by message..."
                            className="pl-9"
                            value={filters.message}
                            onChange={(e) => onFilterChange({ ...filters, message: e.target.value })}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="object_table">Type</Label>
                    <div className="relative">
                        <FileText className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <Input
                            id="object_table"
                            placeholder="Filter by type..."
                            className="pl-9"
                            value={filters.object_table}
                            onChange={(e) => onFilterChange({ ...filters, object_table: e.target.value })}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="user_id">User</Label>
                    <div className="relative">
                        <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none z-10" />
                        <Select
                            value={filters.user_id || undefined}
                            onValueChange={(value) => onFilterChange({ ...filters, user_id: value === '__all__' ? '' : value })}
                        >
                            <SelectTrigger id="user_id" className="pl-9">
                                <SelectValue placeholder="All Users" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="__all__">All Users</SelectItem>
                                {sortedUsers.map((user) => (
                                    <SelectItem key={user.id} value={user.id.toString()}>
                                        {user.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>
        </div>
    );
}
