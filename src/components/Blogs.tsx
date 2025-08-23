import { useBlogs } from '../hooks/useBlogs';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { formatDateTime } from '../lib/utils';
import { sanitizeHTML } from '../lib/sanitize';

export default function Blogs() {
    const { data, isLoading, error } = useBlogs();

    if (error) {
        return (
            <div className="min-h-[calc(100vh-4rem)] xl:min-h-screen w-full bg-white dark:bg-black transition-colors">
                <div className="max-w-3xl mx-auto p-6 xl:p-8 space-y-6">
                    <Alert variant="destructive">
                        <AlertDescription>
                            There was an error loading blogs. Please try again later.
                        </AlertDescription>
                    </Alert>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-4rem)] xl:min-h-screen w-full bg-white dark:bg-black transition-colors">
            <div className="max-w-3xl mx-auto p-6 xl:p-8 space-y-6">
                <h1 className="text-4xl font-bold tracking-tight">Blogs</h1>
                
                {data?.data && data.data.length > 0 ? (
                    data.data.map((blog) => (
                        <div key={blog.id} className="space-y-4">
                            <h2 className="text-2xl font-semibold">{blog.name}</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{formatDateTime(blog.created_at)}</p>
                            <div
                                className="prose dark:prose-invert max-w-none"
                                dangerouslySetInnerHTML={{
                                    __html: sanitizeHTML(blog.body ? blog.body.replace(/\n/g, '<br />') : ''),
                                }}
                            />
                        </div>
                    ))
                ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-12">
                        No blogs found.
                    </p>
                )}
            </div>
        </div>
    );
}
