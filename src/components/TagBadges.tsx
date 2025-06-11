import React from 'react';
import { Badge } from '@/components/ui/badge';

interface TagBadgesProps {
  tags: Array<{ id: number; name: string }> | undefined;
  onClick?: (name: string) => void;
}

export const TagBadges: React.FC<TagBadgesProps> = ({ tags, onClick }) => {
  if (!tags || tags.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map(tag => (
        <Badge
          key={tag.id}
          variant="secondary"
          className="bg-gray-100 text-gray-800 hover:bg-gray-200 cursor-pointer"
          onClick={onClick ? () => onClick(tag.name) : undefined}
        >
          {tag.name}
        </Badge>
      ))}
    </div>
  );
};
