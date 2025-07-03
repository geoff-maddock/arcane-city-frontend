import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { authService } from '../services/auth.service';

const Account: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate({ to: '/login' });
    }
  }, [navigate]);

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
      <h2 className="text-xl font-bold">Account</h2>

      <section className="grid grid-cols-[150px_1fr] gap-2">
        <span className="font-semibold text-gray-600">Name:</span>
        <span>{user.name}</span>

        <span className="font-semibold text-gray-600">Email:</span>
        <span>{user.email}</span>

        <span className="font-semibold text-gray-600">Status:</span>
        <span>{user.status.name}</span>

        <span className="font-semibold text-gray-600">Last Active:</span>
        <span>{user.last_active ?? 'N/A'}</span>

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

      {user.followed_tags.length > 0 && (
        <section className="space-y-2">
          <h3 className="text-lg font-semibold">Followed Tags</h3>
          <div className="flex flex-wrap gap-2">
            {user.followed_tags.map(tag => (
              <span key={tag.id} className="bg-gray-100 px-2 py-1 rounded">
                {tag.name}
              </span>
            ))}
          </div>
        </section>
      )}

      {user.followed_entities.length > 0 && (
        <section className="space-y-2">
          <h3 className="text-lg font-semibold">Followed Entities</h3>
          <div className="flex flex-wrap gap-2">
            {user.followed_entities.map(entity => (
              <span key={entity.id} className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                {entity.name}
              </span>
            ))}
          </div>
        </section>
      )}

      {user.followed_series.length > 0 && (
        <section className="space-y-2">
          <h3 className="text-lg font-semibold">Followed Series</h3>
          <div className="flex flex-wrap gap-2">
            {user.followed_series.map(series => (
              <span key={series.id} className="bg-green-100 text-green-800 px-2 py-1 rounded">
                {series.name}
              </span>
            ))}
          </div>
        </section>
      )}

      {user.followed_threads.length > 0 && (
        <section className="space-y-2">
          <h3 className="text-lg font-semibold">Followed Threads</h3>
          <div className="flex flex-wrap gap-2">
            {user.followed_threads.map(thread => (
              <span key={thread.id} className="bg-purple-100 text-purple-800 px-2 py-1 rounded">
                {thread.name}
              </span>
            ))}
          </div>
        </section>
      )}

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

    </div>
  );
};

export default Account;
