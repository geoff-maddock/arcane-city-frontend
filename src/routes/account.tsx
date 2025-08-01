import React, { useEffect, useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, Link } from '@tanstack/react-router';
import { authService } from '../services/auth.service';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Edit } from 'lucide-react';

const Account: React.FC = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate({ to: '/login' });
    }
  }, [navigate]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const { data: user, isLoading, error } = useQuery({
    queryKey: ['currentUser'],
    queryFn: authService.getCurrentUser,
    enabled: authService.isAuthenticated(),
  });

  if (isLoading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">Failed to load user data.</div>;
  if (!user) return null;

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Account</h2>
        <div className="relative" ref={menuRef}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-10">
              <div className="py-1">
                <Link
                  to="/account/edit"
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Edit className="h-4 w-4" />
                  Edit Account
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
      {user.photos.length > 0 && (
        <section className="space-y-2">
          <h3 className="text-lg font-semibold">Photos</h3>
          <div className="flex flex-wrap gap-2">
            {user.photos.map(photo => (
              <img
                key={photo.id}
                src={photo.thumbnail_path}
                alt="user photo"
                className="h-20 w-20 object-cover rounded"
              />
            ))}
          </div>
        </section>
      )}

      <section className="grid grid-cols-[150px_1fr] gap-2">
        <span className="font-semibold text-gray-600">Name:</span>
        <span>{user.name}</span>

        <span className="font-semibold text-gray-600">Email:</span>
        <span>{user.email}</span>

        <span className="font-semibold text-gray-600">Status:</span>
        <span>{user.status.name}</span>

        <span className="font-semibold text-gray-600">Last Active:</span>
        <span>{user.last_active ? new Date(user.last_active.created_at).toLocaleDateString() : 'N/A'}</span>

        <span className="font-semibold text-gray-600">Joined:</span>
        <span>{new Date(user.created_at).toLocaleDateString()}</span>
      </section>

      {user.profile && (
        <section className="space-y-2">
          <h3 className="text-lg font-semibold">Profile</h3>
          <div className="grid grid-cols-[150px_1fr] gap-2">
            <span className="font-semibold text-gray-600">Alias:</span>
            <span>{user.profile.alias ?? 'N/A'}</span>

            <span className="font-semibold text-gray-600">Location:</span>
            <span>{user.profile.location ?? 'N/A'}</span>

            <span className="font-semibold text-gray-600">Bio:</span>
            <span>{user.profile.bio ?? 'N/A'}</span>
          </div>
        </section>
      )}

      {user.profile && (
        <section className="space-y-2">
          <h3 className="text-lg font-semibold">Settings</h3>
          <div className="grid grid-cols-[200px_1fr] gap-2">
            <span className="font-semibold text-gray-600">Receive Weekly Updates:</span>
            <span>{user.profile.setting_weekly_update ? 'Yes' : 'No'}</span>

            <span className="font-semibold text-gray-600">Receive Daily Updates:</span>
            <span>{user.profile.setting_daily_update ? 'Yes' : 'No'}</span>

            <span className="font-semibold text-gray-600">Receive Instant Updates:</span>
            <span>{user.profile.setting_instant_update ? 'Yes' : 'No'}</span>

            <span className="font-semibold text-gray-600">Receive Forum Updates:</span>
            <span>{user.profile.setting_forum_update ? 'Yes' : 'No'}</span>

            <span className="font-semibold text-gray-600">Public Profile:</span>
            <span>{user.profile.setting_public_profile ? 'Yes' : 'No'}</span>
          </div>
        </section>
      )}

      {user.followed_tags.length > 0 && (
        <section className="space-y-2">
          <h3 className="text-lg font-semibold">Followed Tags</h3>
          <div className="flex flex-wrap gap-2">
            {user.followed_tags.map(tag => (
              <Link
                key={tag.id}
                to="/tags/$slug"
                params={{ slug: tag.slug }}
                className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                {tag.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {user.followed_entities.length > 0 && (
        <section className="space-y-2">
          <h3 className="text-lg font-semibold">Followed Entities</h3>
          <div className="flex flex-wrap gap-2">
            {user.followed_entities.map(entity => (
              <Link
                key={entity.id}
                to="/entities/$entitySlug"
                params={{ entitySlug: entity.slug }}
                className="bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 px-2 py-1 rounded hover:bg-blue-200 dark:hover:bg-blue-700"
              >
                {entity.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {user.followed_series.length > 0 && (
        <section className="space-y-2">
          <h3 className="text-lg font-semibold">Followed Series</h3>
          <div className="flex flex-wrap gap-2">
            {user.followed_series.map(series => (
              <Link
                key={series.id}
                to="/series/$slug"
                params={{ slug: series.slug }}
                className="bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 px-2 py-1 rounded hover:bg-green-200 dark:hover:bg-green-700"
              >
                {series.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {user.followed_threads.length > 0 && (
        <section className="space-y-2">
          <h3 className="text-lg font-semibold">Followed Threads</h3>
          <div className="flex flex-wrap gap-2">
            {user.followed_threads.map(thread => (
              <span key={thread.id} className="bg-purple-100 dark:bg-purple-800 text-purple-800 dark:text-purple-200 px-2 py-1 rounded">
                {thread.name}
              </span>
            ))}
          </div>
        </section>
      )}


    </div>
  );
};

export default Account;
