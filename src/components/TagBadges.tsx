import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Link, useNavigate } from '@tanstack/react-router';
import { Link as LinkIcon } from 'lucide-react';

interface TagBadgesProps {
  tags: Array<{ id: number; name: string; slug?: string }> | undefined;
  onClick?: (name: string) => void;
}

export const TagBadges: React.FC<TagBadgesProps> = ({ tags, onClick }) => {
  const navigate = useNavigate();
  if (!tags || tags.length === 0) return null;

  const handleNameClick = (name: string) => {
    if (onClick) {
      onClick(name);
    } else {
      navigate({ to: '/events', search: { tag: name } });
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map(tag => (
        <Badge
          key={tag.id}
          variant="secondary"
          className="bg-gray-100 text-gray-800 hover:bg-gray-200 cursor-pointer flex items-center gap-1"
        >
          <span onClick={() => handleNameClick(tag.name)}>{tag.name}</span>
          <Link
            to="/tags/$slug"
            params={{ slug: tag.slug ?? tag.name }}
            className="ml-1 text-gray-500 hover:text-gray-700"
            onClick={e => e.stopPropagation()}
          >
            <LinkIcon className="h-3 w-3" />
          </Link>
        </Badge>
      ))}
    </div>
  );
};
