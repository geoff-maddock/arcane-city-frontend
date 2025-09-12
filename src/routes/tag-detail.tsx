import { createRoute } from '@tanstack/react-router';
import { rootRoute } from './root';
import TagDetail from '../components/TagDetail';
import { truncate, SITE_NAME, DEFAULT_IMAGE } from '../lib/seo';
import { Tag } from '@/types/api';
import { api } from '@/lib/api';

// Loader fetches tag so head() can build meta tags.
async function loadTag(slug: string): Promise<Tag> {
    const { data } = await api.get<Tag>(`/tags/${slug}`);
    return data;
}

export const TagDetailRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/tags/$slug',
    loader: async ({ params }) => {
        if (!params.slug) throw new Error('Missing slug');
        return loadTag(params.slug);
    },
    component: function TagDetailWrapper() {
        const params = TagDetailRoute.useParams();
        return <TagDetail slug={params.slug} />;
    },
    head: ({ loaderData }) => {
        const tag = loaderData as Tag;
        const title = `Tag • ${tag.name}`; // Similar to getTitleFormat
        const description = truncate(tag.description) || SITE_NAME;
        return {
            meta: [
                { title: `${title} • ${SITE_NAME}` },
                { name: 'description', content: description },
                { property: 'og:title', content: title },
                { property: 'og:description', content: description },
                { property: 'og:image', content: DEFAULT_IMAGE },
                { name: 'twitter:title', content: title },
                { name: 'twitter:description', content: description },
                { name: 'twitter:image', content: DEFAULT_IMAGE },
            ],
        };
    },
});
