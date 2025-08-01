import { useNavigate } from '@tanstack/react-router';
import type { User } from '../types/auth';
import { Card, CardContent } from '@/components/ui/card';

interface UserCardProps {
    user: User;
}

export default function UserCard({ user }: UserCardProps) {
    const navigate = useNavigate();
    const placeholder = `${window.location.origin}/event-placeholder.png`;
    const photo = user.photos && user.photos.length > 0 ? user.photos[0].thumbnail_path : null;

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        navigate({
            to: '/users/$id',
            params: { id: String(user.id) }
        });
    };

    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 flex flex-col items-center space-y-2">
                <div className="h-24 w-full bg-gray-200 rounded overflow-hidden">
                    <img
                        src={photo || placeholder}
                        alt={user.name}
                        className="h-24 w-full object-cover"
                    />
                </div>
                <h2 className="text-lg font-semibold text-center">
                    <a href={`/users/${user.id}`} onClick={handleClick} className="hover:text-primary transition-colors">
                        {user.name}
                    </a>
                </h2>
                <p className="text-sm text-gray-600">{user.email}</p>
            </CardContent>
        </Card>
    );
}
