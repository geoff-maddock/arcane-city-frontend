import { useNavigate } from '@tanstack/react-router';
import { Event } from '../types/api';
import { ImageLightbox } from './ImageLightbox';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface EventCardGridCompactProps {
    event: Event;
    allImages: Array<{ src: string; alt: string }>;
    imageIndex: number;
    showDateBar?: boolean;
    dateLabel?: string;
    isWeekend?: boolean;
}

/**
 * A compact event card for grid layout displaying 120px x 120px images
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
    const [isHovered, setIsHovered] = useState(false);

    const handleDetailsClick = (e: React.MouseEvent) => {
        e.preventDefault();
        navigate({
            to: '/events/$slug',
            params: { slug: event.slug }
        });
    };

    const placeHolderImage = `${window.location.origin}/event-placeholder.png`;

    // Get top 2 tags
    const topTags = event.tags?.slice(0, 2) || [];

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
            
            {/* Image container - fixed 120px x 120px */}
            <div 
                className="w-[120px] h-[120px] overflow-hidden relative"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <div className="w-full h-full">
                    <ImageLightbox
                        thumbnailUrl={event.primary_photo_thumbnail || event.primary_photo || placeHolderImage}
                        alt={event.name}
                        allImages={allImages}
                        initialIndex={imageIndex}
                    />
                </div>
                
                {/* Hover overlay with event type and tags */}
                {isHovered && (
                    <div className="absolute inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center p-2 text-white text-center">
                        {event.event_type && (
                            <div className="text-xs font-bold mb-1">
                                {event.event_type.name}
                            </div>
                        )}
                        {topTags.length > 0 && (
                            <div className="flex flex-wrap gap-1 justify-center">
                                {topTags.map((tag) => (
                                    <span
                                        key={tag.id}
                                        className="text-[10px] bg-blue-600 px-1.5 py-0.5 rounded"
                                    >
                                        {tag.name}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Details button */}
            <Button
                variant="outline"
                size="sm"
                className="mt-1 w-[120px] text-xs"
                onClick={handleDetailsClick}
            >
                Details
            </Button>
        </div>
    );
};

export default EventCardGridCompact;
