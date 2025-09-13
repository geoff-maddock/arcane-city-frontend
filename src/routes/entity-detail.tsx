// src/routes/event-detail.tsx
import { createRoute } from '@tanstack/react-router';
import { rootRoute } from './root';
import EntityDetail from '../components/EntityDetail';
import { api } from '../lib/api';
import type { Entity } from '../types/api';
import { truncate, SITE_NAME, DEFAULT_IMAGE } from '../lib/seo';

async function loadEntity(slug: string): Promise<Entity> {
    const { data } = await api.get<Entity>(`/entities/${slug}`);
    return data;
}

export const EntityDetailRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/entities/$entitySlug',
    loader: async ({ params }) => loadEntity(params.entitySlug),
    head: ({ loaderData }) => {
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