import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Link as RouterLink } from '@tanstack/react-router';
import { Link as LinkIcon } from 'lucide-react';

interface TagBadgesProps {
  tags: Array<{ id: number; name: string; slug?: string }> | undefined;
}

export const TagBadges: React.FC<TagBadgesProps> = ({ tags }) => {
  if (!tags || tags.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map(tag => (
        <Badge
          key={tag.id}
          variant="secondary"
          className="bg-gray-100 text-gray-800 hover:bg-gray-200 cursor-pointer flex items-center gap-1"
        >
          <RouterLink
            to="/events"
            search={{ tag: tag.slug ?? tag.name }}
            className="hover:underline"
          >
            {tag.name}
          </RouterLink>
          <RouterLink
            to="/tags/$slug"
            params={{ slug: tag.slug ?? tag.name }}
            className="ml-1 text-gray-500 hover:text-gray-900"
          >
            <LinkIcon className="h-3 w-3" />
          </RouterLink>
        </Badge>
      ))}
    </div>
  );
};
