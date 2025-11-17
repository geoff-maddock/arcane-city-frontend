// src/routes/event-detail.tsx
import { createRoute, Link } from '@tanstack/react-router';
import { rootRoute } from './root';
import EntityDetail from '../components/EntityDetail';
import { api } from '../lib/api';
import type { Entity } from '../types/api';
import { truncate, SITE_NAME, DEFAULT_IMAGE } from '../lib/seo';

async function loadEntity(slug: string): Promise<Entity> {
    const { data } = await api.get<Entity>(`/entities/${slug}`);
    return data;
}

// Error component for when entity is not found
const EntityNotFound = () => (
    <div className="min-h-[calc(100vh-4rem)] xl:min-h-screen w-full bg-white dark:bg-black transition-colors">
        <div className="max-w-3xl mx-auto p-6 xl:p-8 space-y-6">
            <h1 className="text-4xl font-bold tracking-tight">404 - Entity Not Found</h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
                Sorry, the entity you're looking for doesn't exist.
            </p>
            <div className="space-y-4">
                <p>
                    The entity you requested could not be found. This might be because:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400">
                    <li>The entity slug was typed incorrectly</li>
                    <li>The entity has been moved or deleted</li>
                    <li>The link you followed is outdated</li>
                </ul>
            </div>
            <div className="pt-4 flex gap-4">
                <Link 
                    to="/entities" 
                    className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                    Browse Entities
                </Link>
                <Link 
                    to="/" 
                    className="inline-block px-6 py-3 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 text-gray-900 dark:text-gray-100 font-medium rounded-lg transition-colors"
                >
                    Go to Homepage
                </Link>
            </div>
        </div>
    </div>
);

export const EntityDetailRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/entities/$entitySlug',
    loader: async ({ params }) => loadEntity(params.entitySlug),
    errorComponent: EntityNotFound,
    head: ({ loaderData }) => {
        if (!loaderData) return { meta: [] };
        
        const entity = loaderData as Entity;
        const baseTitle = entity.name; // Similar to getTitleFormat (could extend with type or city if desired)
        // get a comma separated list of role names if there are multiple, if there is one role just use it's name, otherwise empty string
        const role = entity.roles && entity.roles.length > 0 ? entity.roles.map(r => r.name).join(', ') : '';
        const description = truncate(entity.short || entity.description) || SITE_NAME;
        const ogImage = entity.primary_photo || DEFAULT_IMAGE;
        return {
            meta: [
                { title: `${baseTitle} - ${role} • ${SITE_NAME}` },
                { name: 'description', content: description },
                { property: 'og:title', content: baseTitle },
                { property: 'og:description', content: description },
                { property: 'og:image', content: ogImage },
                { name: 'twitter:title', content: baseTitle },
                { name: 'twitter:description', content: description },
                { name: 'twitter:image', content: ogImage },
            ],
        };
    },
    component: function EntityDetailWrapper() {
        const params = EntityDetailRoute.useParams();
        const entity = EntityDetailRoute.useLoaderData() as Entity;
        return <EntityDetail entitySlug={params.entitySlug} initialEntity={entity} />;
    },
});