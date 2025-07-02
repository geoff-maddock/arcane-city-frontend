import { Link } from '@tanstack/react-router';
import { Tag } from '../types/api';
import { Card, CardContent } from '@/components/ui/card';
import { useTagImage } from '../hooks/useTagImage';

interface TagCardProps {
    tag: Tag;
}

export default function TagCard({ tag }: TagCardProps) {
    const { url, alt } = useTagImage(tag.slug);
    const placeholder = `${window.location.origin}/event-placeholder.png`;

    return (
        <Link to="/tags/$slug" params={{ slug: tag.slug }} className="block">
            <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex flex-col items-center space-y-2">
                    <div className="h-24 w-full bg-gray-200 rounded overflow-hidden">
                        <img
                            src={url || placeholder}
                            alt={alt}
                            className="h-24 w-full object-cover"
                        />
                    </div>
                    <h2 className="text-lg font-semibold text-center">{tag.name}</h2>
                </CardContent>
            </Card>
        </Link>
    );
}
