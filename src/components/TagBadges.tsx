import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Link } from '@tanstack/react-router';

interface TagBadgesProps {
  tags: Array<{ id: number; name: string; slug?: string }> | undefined;
  onClick?: (name: string) => void;
}

export const TagBadges: React.FC<TagBadgesProps> = ({ tags, onClick }) => {
  if (!tags || tags.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map(tag => (
        onClick ? (
          <Badge
            key={tag.id}
            variant="secondary"
            className="bg-gray-100 text-gray-800 hover:bg-gray-200 cursor-pointer"
            onClick={() => onClick(tag.name)}
          >
            {tag.name}
          </Badge>
        ) : (
          <Link key={tag.id} to="/tags/$slug" params={{ slug: tag.slug ?? tag.name }}>
            <Badge
              variant="secondary"
              className="bg-gray-100 text-gray-800 hover:bg-gray-200 cursor-pointer"
            >
              {tag.name}
            </Badge>
          </Link>
        )
      ))}
    </div>
  );
};
