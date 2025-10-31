import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Link, useNavigate } from '@tanstack/react-router';
import { Link as LinkIcon } from 'lucide-react';

interface TagBadgesProps {
  tags: Array<{ id: number; name: string; slug?: string }> | undefined;
  onClick?: (name: string) => void;
  /**
   * Path to the index page used when filtering by tag
   * e.g. `/events` or `/entities`
   */
  indexPath?: '/events' | '/entities';
}

export const TagBadges: React.FC<TagBadgesProps> = ({ tags, onClick, indexPath = '/events' }) => {
  const navigate = useNavigate();
  if (!tags || tags.length === 0) return null;

  const handleNameClick = (name: string) => {
    if (onClick) {
      onClick(name);
    } else {
      // Navigate to either the events or entities index with the tag filter applied
      navigate({ to: indexPath, search: { tag: name } });
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map(tag => (
        <Badge
          key={tag.id}
          variant="secondary"
          className="bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-100 cursor-pointer flex items-center gap-1 transition-colors border border-gray-200 dark:border-slate-600"
        >
          <span onClick={() => handleNameClick(tag.name)}>{tag.name}</span>
          <Link
            to="/tags/$slug"
            params={{ slug: tag.slug ?? tag.name }}
            className="ml-1 text-gray-500 hover:text-gray-700 dark:text-slate-300 dark:hover:text-white"
            onClick={e => e.stopPropagation()}
            aria-label={`View ${tag.name} tag details`}
          >
            <LinkIcon className="h-3 w-3" />
          </Link>
        </Badge>
      ))}
    </div>
  );
};
