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
    isWeekend?: boolean;
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
    dateLabel = '',
    isWeekend = false
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
            {/* Date bar or placeholder to maintain alignment */}
            {showDateBar && dateLabel ? (
                <div className={`text-xs font-medium px-2 py-1 text-center mb-1 ${
                    isWeekend 
                        ? 'bg-amber-500 text-white' 
                        : 'bg-primary text-primary-foreground'
                }`}>
                    {dateLabel}
                </div>
            ) : (
                <div className="bg-background text-xs font-medium px-2 py-1 text-center mb-1 invisible">
                    Placeholder
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
