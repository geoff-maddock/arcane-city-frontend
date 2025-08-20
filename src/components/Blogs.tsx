import { useBlogs } from '../hooks/useBlogs';
import { Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { formatDateTime } from '../lib/utils';
import { sanitizeHTML } from '../lib/sanitize';

export default function Blogs() {
    const { data, isLoading, error } = useBlogs();

    if (error) {
        return (
            <div className="bg-background text-foreground min-h-screen p-4">
                <div className="mx-auto px-6 py-8 max-w-[2400px]">
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
        <div className="bg-background text-foreground min-h-screen p-4">
            <div className="mx-auto px-6 py-8 max-w-[2400px] space-y-8">
                <div className="flex flex-col space-y-2">
                    <h1 className="text-4xl font-bold tracking-tight text-gray-900">Blogs</h1>
                    <p className="text-lg text-gray-500">Latest posts</p>
                </div>

                {data?.data && data.data.length > 0 ? (
                    data.data.map((blog) => (
                        <Card key={blog.id} className="border-gray-100">
                            <CardContent className="prose max-w-none p-6">
                                <h2 className="mb-2">{blog.name}</h2>
                                <p className="text-sm text-gray-500 mb-4">{formatDateTime(blog.created_at)}</p>
                                <div
                                    dangerouslySetInnerHTML={{
                                        __html: sanitizeHTML(blog.body ? blog.body.replace(/\n/g, '<br />') : ''),
                                    }}
                                />
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <Card className="border-gray-100">
                        <CardContent className="flex h-96 items-center justify-center text-gray-500">
                            No blogs found.
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
