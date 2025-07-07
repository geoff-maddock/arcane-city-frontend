import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Link, useNavigate } from '@tanstack/react-router';
import { Link as LinkIcon } from 'lucide-react';

interface EntityBadgesProps {
  entities: Array<{ id: number; name: string; slug?: string }> | undefined;
  onClick?: (name: string) => void;
}

export const EntityBadges: React.FC<EntityBadgesProps> = ({ entities, onClick }) => {
  const navigate = useNavigate();
  if (!entities || entities.length === 0) return null;

  const handleNameClick = (name: string) => {
    if (onClick) {
      onClick(name);
    } else {
      navigate({ to: '/events', search: { entity: name } });
    }
  };

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {entities.map(entity => (
        <Badge
          key={entity.id}
          variant="default"
          className="bg-blue-100 text-blue-800 hover:bg-blue-200 px-3 py-1 flex items-center gap-1 cursor-pointer"
        >
          <span onClick={() => handleNameClick(entity.name)}>{entity.name}</span>
          <Link
            to="/entities/$entitySlug"
            params={{ entitySlug: entity.slug ?? entity.name }}
            className="ml-1 text-blue-600 hover:text-blue-800"
            onClick={e => e.stopPropagation()}
          >
            <LinkIcon className="h-3 w-3" />
          </Link>
        </Badge>
      ))}
    </div>
  );
};
