import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '../lib/api';
import { PhotoResponse } from '../types/api';
import { Card, CardContent } from '@/components/ui/card';
import {
    Loader2,
    Image as ImageIcon,
    X,
    ChevronLeft,
    ChevronRight,
    Star,
    Trash2,
} from 'lucide-react';
import { authService } from '../services/auth.service';

interface PhotoGalleryProps {
    fetchUrl: string;
    onPrimaryUpdate?: () => void;
    openAtIndex?: number | null;
    onSlideshowClose?: () => void;
}

export default function PhotoGallery({ fetchUrl, onPrimaryUpdate, openAtIndex, onSlideshowClose }: PhotoGalleryProps) {
    const [photos, setPhotos] = useState<PhotoResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [showSlideshow, setShowSlideshow] = useState(false);
    const [slideshowIndex, setSlideshowIndex] = useState(0);
    const [requestedIndex, setRequestedIndex] = useState<number | null>(null);

    const { data: user } = useQuery({
        queryKey: ['currentUser'],
        queryFn: authService.getCurrentUser,
        enabled: authService.isAuthenticated(),
    });

    const fetchPhotos = useCallback(async () => {
        if (!fetchUrl) return;
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
    }, [fetchUrl]);

    const setPrimaryMutation = useMutation({
        mutationFn: (photoId: number) => api.post(`/photos/${photoId}/set-primary`),
        onSuccess: () => {
            fetchPhotos();
            onPrimaryUpdate?.();
        },
    });

    const unsetPrimaryMutation = useMutation({
        mutationFn: (photoId: number) => api.post(`/photos/${photoId}/unset-primary`),
        onSuccess: () => {
            fetchPhotos();
            onPrimaryUpdate?.();
        },
    });

    const deletePhotoMutation = useMutation({
        mutationFn: (photoId: number) => api.delete(`/photos/${photoId}`),
        onSuccess: fetchPhotos,
    });

    const handleTogglePrimary = (photo: PhotoResponse) => {
        if (photo.is_primary) {
            unsetPrimaryMutation.mutate(photo.id);
        } else {
            setPrimaryMutation.mutate(photo.id);
        }
    };

    const handleDelete = (photo: PhotoResponse) => {
        if (window.confirm('Are you sure you want to delete this photo?')) {
            deletePhotoMutation.mutate(photo.id);
        }
    };

    useEffect(() => {
        fetchPhotos();
    }, [fetchPhotos]);

    // Track when openAtIndex changes to trigger slideshow
    useEffect(() => {
        if (openAtIndex !== null && openAtIndex !== undefined && openAtIndex !== requestedIndex) {
            setRequestedIndex(openAtIndex);
        }
    }, [openAtIndex, requestedIndex]);

    // Handle external request to open slideshow at specific index
    // Use -1 to indicate "open at primary photo"
    useEffect(() => {
        if (requestedIndex !== null && photos.length > 0) {
            let targetIndex = requestedIndex;
            
            // Special case: -1 means find and open the primary photo
            if (requestedIndex === -1) {
                const primaryIndex = photos.findIndex(photo => photo.is_primary);
                targetIndex = primaryIndex >= 0 ? primaryIndex : 0;
            }
            
            // Ensure index is within bounds
            if (targetIndex >= 0 && targetIndex < photos.length) {
                setSlideshowIndex(targetIndex);
                setShowSlideshow(true);
            }
        }
    }, [requestedIndex, photos]);

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
                            <div key={photo.id} className="relative group">
                                <button
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
                                        loading="lazy"
                                        decoding="async"
                                    />
                                </button>
                                {user && photo.created_by === user.id && photo.direct === true && (

                                    <div className="absolute top-1 right-1 flex gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 md:focus-within:opacity-100">

                                        <button
                                            onClick={() => handleTogglePrimary(photo)}
                                            aria-label={photo.is_primary ? 'Unset Primary Photo' : 'Set Primary Photo'}
                                            className="bg-white/70 p-2 rounded hover:bg-white"
                                            type="button"
                                        >
                                            <Star
                                                className={`h-4 w-4 ${photo.is_primary ? 'text-yellow-500' : 'text-gray-400'}`}
                                                fill={photo.is_primary ? 'currentColor' : 'none'}
                                            />
                                        </button>

                                        <button
                                            onClick={() => handleDelete(photo)}
                                            aria-label="Delete Photo"
                                            className="bg-white/70 p-2 rounded hover:bg-white"
                                            type="button"
                                        >
                                            <Trash2 className="h-4 w-4 text-red-500" />
                                        </button>

                                    </div>
                                )}
                            </div>
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
                            onClick={() => {
                                setShowSlideshow(false);
                                onSlideshowClose?.();
                            }}
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
