import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface UserFiltersProps {
    filters: {
        name: string;
        email: string;
        status: string;
        is_verified: string;
    };
    onFilterChange: (filters: UserFiltersProps['filters']) => void;
}

export default function UserFilters({ filters, onFilterChange }: UserFiltersProps) {
    return (
        <div className="space-y-4">
            <div className="grid gap-6 md:grid-cols-4 lg:grid-cols-4">
                <div className="space-y-2">
                    <Label htmlFor="name">User Name</Label>
                    <div className="relative">
                        <Input
                            id="name"
                            placeholder="Search users..."
                            className="pl-3"
                            value={filters.name}
                            onChange={(e) => onFilterChange({ ...filters, name: e.target.value })}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                        <Input
                            id="email"
                            placeholder="Search by email..."
                            className="pl-3"
                            value={filters.email}
                            onChange={(e) => onFilterChange({ ...filters, email: e.target.value })}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="status">User Status</Label>
                    <Select
                        value={filters.status || ''}
                        onValueChange={(value) =>
                            onFilterChange({ ...filters, status: value === '__ALL__' ? '' : value })
                        }
                    >
                        <SelectTrigger id="status" aria-label="Filter by user status">
                            <SelectValue placeholder="All statuses" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="__ALL__">All statuses</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                            <SelectItem value="suspended">Suspended</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="is_verified">Is Verified</Label>
                    <Select
                        value={filters.is_verified || ''}
                        onValueChange={(value) =>
                            onFilterChange({ ...filters, is_verified: value === '__ALL__' ? '' : value })
                        }
                    >
                        <SelectTrigger id="is_verified" aria-label="Filter by verification status">
                            <SelectValue placeholder="All users" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="__ALL__">All users</SelectItem>
                            <SelectItem value="1">Verified</SelectItem>
                            <SelectItem value="0">Not Verified</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
    );
}
