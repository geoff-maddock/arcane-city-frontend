import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Link as RouterLink } from '@tanstack/react-router';
import { Link as LinkIcon } from 'lucide-react';

interface EntityBadgesProps {
  entities: Array<{ id: number; name: string; slug?: string }> | undefined;
  onClick?: (name: string) => void;
}

export const EntityBadges: React.FC<EntityBadgesProps> = ({ entities, onClick }) => {
  if (!entities || entities.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {entities.map(entity => (
        <Badge
          key={entity.id}
          variant="default"
          className="bg-blue-100 text-blue-800 hover:bg-blue-200 px-3 py-1 flex items-center gap-1"
        >
          {onClick ? (
            <span onClick={() => onClick(entity.name)} className="hover:underline">
              {entity.name}
            </span>
          ) : (
            <RouterLink
              to="/events"
              search={{ entity: entity.slug ?? entity.name }}
              className="hover:underline"
            >
              {entity.name}
            </RouterLink>
          )}
          <RouterLink
            to="/entities/$entitySlug"
            params={{ entitySlug: entity.slug ?? entity.name }}
            className="ml-1 text-blue-500 hover:text-blue-800"
          >
            <LinkIcon className="h-3 w-3" />
          </RouterLink>
        </Badge>
      ))}
    </div>
  );
};
