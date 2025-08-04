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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto px-6 py-8 max-w-[2400px]">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            {user.photos.length > 0 && (
              <img
                src={user.photos[0].thumbnail_path}
                alt={user.name}
                className="h-16 w-16 object-cover rounded-full border-2 border-gray-200 dark:border-gray-700"
              />
            )}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{user.name}</h1>
              <p className="text-gray-600 dark:text-gray-400">{user.email}</p>
            </div>
          </div>
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

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Account Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Basic Info Card */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Account Information</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Status:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{user.status.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Joined:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{new Date(user.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Last Active:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{user.last_active ? new Date(user.last_active.created_at).toLocaleDateString() : 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Profile Info Card */}
            {user.profile && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Profile</h2>
                <div className="space-y-3">
                  {user.profile.alias && (
                    <div>
                      <span className="text-gray-600 dark:text-gray-400 text-sm">Alias</span>
                      <p className="font-medium text-gray-900 dark:text-white">{user.profile.alias}</p>
                    </div>
                  )}
                  {user.profile.location && (
                    <div>
                      <span className="text-gray-600 dark:text-gray-400 text-sm">Location</span>
                      <p className="font-medium text-gray-900 dark:text-white">{user.profile.location}</p>
                    </div>
                  )}
                  {user.profile.bio && (
                    <div>
                      <span className="text-gray-600 dark:text-gray-400 text-sm">Bio</span>
                      <p className="font-medium text-gray-900 dark:text-white">{user.profile.bio}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Settings Card */}
            {user.profile && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Notification Settings</h2>
                <div className="space-y-2">
                  <div className="flex justify-between items-center py-1">
                    <span className="text-gray-600 dark:text-gray-400 text-sm">Weekly Updates</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.profile.setting_weekly_update ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'}`}>
                      {user.profile.setting_weekly_update ? 'ON' : 'OFF'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-gray-600 dark:text-gray-400 text-sm">Daily Updates</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.profile.setting_daily_update ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'}`}>
                      {user.profile.setting_daily_update ? 'ON' : 'OFF'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-gray-600 dark:text-gray-400 text-sm">Instant Updates</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.profile.setting_instant_update ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'}`}>
                      {user.profile.setting_instant_update ? 'ON' : 'OFF'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-gray-600 dark:text-gray-400 text-sm">Forum Updates</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.profile.setting_forum_update ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'}`}>
                      {user.profile.setting_forum_update ? 'ON' : 'OFF'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-gray-600 dark:text-gray-400 text-sm">Public Profile</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.profile.setting_public_profile ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'}`}>
                      {user.profile.setting_public_profile ? 'ON' : 'OFF'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Following/Activity */}
          <div className="lg:col-span-2 space-y-6">
            {/* Photos Section */}
            {user.photos.length > 1 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Photos</h2>
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
                  {user.photos.map(photo => (
                    <img
                      key={photo.id}
                      src={photo.thumbnail_path}
                      alt="user photo"
                      className="aspect-square object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Following Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Followed Tags */}
              {user.followed_tags.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Followed Tags</h2>
                  <div className="flex flex-wrap gap-2">
                    {user.followed_tags.map(tag => (
                      <Link
                        key={tag.id}
                        to="/tags/$slug"
                        params={{ slug: tag.slug }}
                        className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-3 py-1 rounded-full text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      >
                        {tag.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Followed Entities */}
              {user.followed_entities.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Followed Entities</h2>
                  <div className="flex flex-wrap gap-2">
                    {user.followed_entities.map(entity => (
                      <Link
                        key={entity.id}
                        to="/entities/$entitySlug"
                        params={{ entitySlug: entity.slug }}
                        className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                      >
                        {entity.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Followed Series */}
              {user.followed_series.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Followed Series</h2>
                  <div className="flex flex-wrap gap-2">
                    {user.followed_series.map(series => (
                      <Link
                        key={series.id}
                        to="/series/$slug"
                        params={{ slug: series.slug }}
                        className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-3 py-1 rounded-full text-sm hover:bg-green-200 dark:hover:bg-green-800 transition-colors"
                      >
                        {series.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Followed Threads */}
              {user.followed_threads.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Followed Threads</h2>
                  <div className="flex flex-wrap gap-2">
                    {user.followed_threads.map(thread => (
                      <span
                        key={thread.id}
                        className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-3 py-1 rounded-full text-sm"
                      >
                        {thread.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;
