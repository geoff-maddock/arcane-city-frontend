import { useNavigate } from '@tanstack/react-router';
import { Event } from '../types/api';
import { ImageLightbox } from './ImageLightbox';
import { Button } from '@/components/ui/button';

interface EventCardGridCompactProps {
    event: Event;
    allImages: Array<{ src: string; alt: string }>;
    imageIndex: number;
    showDateBar?: boolean;
    dateLabel?: string;
}

/**
 * A compact event card for grid layout displaying 100px x 100px images
 * with optional date bars and navigation buttons
 */
const EventCardGridCompact = ({ 
    event, 
    allImages, 
    imageIndex,
    showDateBar = false,
    dateLabel = ''
}: EventCardGridCompactProps) => {
    const navigate = useNavigate();

    const handleDetailsClick = (e: React.MouseEvent) => {
        e.preventDefault();
        navigate({
            to: '/events/$slug',
            params: { slug: event.slug }
        });
    };

    const placeHolderImage = `${window.location.origin}/event-placeholder.png`;

    return (
        <div className="flex flex-col">
            {/* Date bar */}
            {showDateBar && dateLabel && (
                <div className="bg-primary text-primary-foreground text-xs font-medium px-2 py-1 text-center mb-1">
                    {dateLabel}
                </div>
            )}
            
            {/* Image container - fixed 100px x 100px */}
            <div className="w-[100px] h-[100px] overflow-hidden relative">
                <div className="w-full h-full">
                    <ImageLightbox
                        thumbnailUrl={event.primary_photo_thumbnail || event.primary_photo || placeHolderImage}
                        alt={event.name}
                        allImages={allImages}
                        initialIndex={imageIndex}
                    />
                </div>
            </div>

            {/* Details button */}
            <Button
                variant="outline"
                size="sm"
                className="mt-1 w-[100px] text-xs"
                onClick={handleDetailsClick}
            >
                Details
            </Button>
        </div>
    );
};

export default EventCardGridCompact;
