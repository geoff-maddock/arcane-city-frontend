import { createRoute } from '@tanstack/react-router';
import { rootRoute } from './root';
import UserDetail from '../components/UserDetail';
import { SITE_NAME, DEFAULT_IMAGE } from '../lib/seo';
import type { User } from '@/types/auth';
import { api } from '@/lib/api';


// Loader fetches user so head() can build meta tags.
async function loadUser(id: string): Promise<User> {
    const { data } = await api.get<User>(`/users/${id}`);
    return data;
}

export const UserDetailRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/users/$id',
    loader: async ({ params }) => {
        if (!params.id) throw new Error('Missing id');
        return loadUser(params.id);
    },
    component: function UserDetailWrapper() {
        const params = UserDetailRoute.useParams();
        const user = UserDetailRoute.useLoaderData() as User;
        return <UserDetail id={params.id} initialUser={user} />;
    },
    head: ({ loaderData }) => {
        const user = loaderData as User;
        const title = `User • ${user.name}`; // Similar to getTitleFormat
        const description = `Details about user ${user.name} on ${SITE_NAME}`;
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
