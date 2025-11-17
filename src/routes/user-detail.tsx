import { createRoute, Link } from '@tanstack/react-router';
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

// Error component for when user is not found
const UserNotFound = () => (
    <div className="min-h-[calc(100vh-4rem)] xl:min-h-screen w-full bg-white dark:bg-black transition-colors">
        <div className="max-w-3xl mx-auto p-6 xl:p-8 space-y-6">
            <h1 className="text-4xl font-bold tracking-tight">404 - User Not Found</h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
                Sorry, the user you're looking for doesn't exist.
            </p>
            <div className="space-y-4">
                <p>
                    The user you requested could not be found. This might be because:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400">
                    <li>The user ID was typed incorrectly</li>
                    <li>The user account has been deleted</li>
                    <li>The link you followed is outdated</li>
                </ul>
            </div>
            <div className="pt-4 flex gap-4">
                <Link 
                    to="/users" 
                    className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                    Browse Users
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

export const UserDetailRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/users/$id',
    loader: async ({ params }) => {
        if (!params.id) throw new Error('Missing id');
        return loadUser(params.id);
    },
    errorComponent: UserNotFound,
    head: ({ loaderData }) => {
        if (!loaderData) return { meta: [] };
        
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
    component: function UserDetailWrapper() {
        const params = UserDetailRoute.useParams();
        const user = UserDetailRoute.useLoaderData() as User;
        return <UserDetail id={params.id} initialUser={user} />;
    },
});
