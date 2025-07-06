import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Link } from '@tanstack/react-router';

interface EntityBadgesProps {
  entities: Array<{ id: number; name: string; slug?: string }> | undefined;
  onClick?: (name: string) => void;
}

export const EntityBadges: React.FC<EntityBadgesProps> = ({ entities, onClick }) => {
  if (!entities || entities.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {entities.map(entity => (
        onClick ? (
          <Badge
            key={entity.id}
            variant="default"
            className="bg-blue-100 text-blue-800 hover:bg-blue-200 px-3 py-1 cursor-pointer"
            onClick={() => onClick(entity.name)}
          >
            {entity.name}
          </Badge>
        ) : (
          <Link key={entity.id} to="/entities/$entitySlug" params={{ entitySlug: entity.slug ?? entity.name }}>
            <Badge
              variant="default"
              className="bg-blue-100 text-blue-800 hover:bg-blue-200 px-3 py-1"
            >
              {entity.name}
            </Badge>
          </Link>
        )
      ))}
    </div>
  );
};
