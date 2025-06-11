import React from 'react';
import { Badge } from '@/components/ui/badge';

interface EntityBadgesProps {
  entities: Array<{ id: number; name: string }> | undefined;
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
          className="bg-blue-100 text-blue-800 hover:bg-blue-200 px-3 py-1"
          onClick={onClick ? () => onClick(entity.name) : undefined}
        >
          {entity.name}
        </Badge>
      ))}
    </div>
  );
};
