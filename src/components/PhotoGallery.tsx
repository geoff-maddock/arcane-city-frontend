import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { PhotoResponse } from '../types/api';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Image as ImageIcon, X, ChevronLeft, ChevronRight } from 'lucide-react';

interface PhotoGalleryProps {
    fetchUrl: string;
}

export default function PhotoGallery({ fetchUrl }: PhotoGalleryProps) {
    const [photos, setPhotos] = useState<PhotoResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [showSlideshow, setShowSlideshow] = useState(false);
    const [slideshowIndex, setSlideshowIndex] = useState(0);

    useEffect(() => {
        if (!fetchUrl) return;
        const fetchPhotos = async () => {
            setLoading(true);
            try {
                const response = await api.get<{ data: PhotoResponse[] }>(fetchUrl);
                const photoData = (response.data as { data: PhotoResponse[] }).data ?? response.data;
                setPhotos(photoData as PhotoResponse[]);
            } catch (err) {
                console.error('Error fetching photos:', err);
                setError(err instanceof Error ? err : new Error('Failed to load photos'));
            } finally {
                setLoading(false);
            }
        };
        fetchPhotos();
    }, [fetchUrl]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-6">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                <span className="ml-2 text-gray-600">Loading photos...</span>
            </div>
        );
    }

    if (error && !loading) {
        return <div className="text-red-500 text-sm">Error loading photos. Please try again later.</div>;
    }

    if (photos.length === 0) {
        return null;
    }

    return (
        <>
            <Card>
                <CardContent className="p-6 space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <ImageIcon className="h-5 w-5" />
                        <h2 className="text-xl font-semibold">Photos</h2>
                    </div>
                    <div className="flex flex-wrap gap-4">
                        {photos.map((photo: PhotoResponse, idx: number) => (
                            <button
                                key={idx}
                                className="focus:outline-none"
                                onClick={() => {
                                    setSlideshowIndex(idx);
                                    setShowSlideshow(true);
                                }}
                                type="button"
                            >
                                <img
                                    src={photo.path}
                                    alt={`Photo ${idx + 1}`}
                                    className="w-32 h-32 object-cover rounded shadow hover:scale-105 transition-transform"
                                />
                            </button>
                        ))}
                    </div>
                </CardContent>
            </Card>
            {showSlideshow && photos.length > 0 && (() => {
                const photosArray = photos;
                return (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
                        <button
                            className="absolute top-4 right-4 text-white hover:text-gray-300"
                            onClick={() => setShowSlideshow(false)}
                            aria-label="Close"
                        >
                            <X className="h-8 w-8" />
                        </button>
                        <button
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300"
                            onClick={() => setSlideshowIndex((slideshowIndex - 1 + photosArray.length) % photosArray.length)}
                            aria-label="Previous"
                        >
                            <ChevronLeft className="h-10 w-10" />
                        </button>
                        <img
                            src={photosArray[slideshowIndex].path}
                            alt={`Photo ${slideshowIndex + 1}`}
                            className="max-h-[80vh] max-w-[90vw] rounded shadow-lg"
                        />
                        <button
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300"
                            onClick={() => setSlideshowIndex((slideshowIndex + 1) % photosArray.length)}
                            aria-label="Next"
                        >
                            <ChevronRight className="h-10 w-10" />
                        </button>
                    </div>
                );
            })()}
        </>
    );
}
