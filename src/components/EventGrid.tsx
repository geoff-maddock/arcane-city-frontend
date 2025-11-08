import EventCardGrid from './EventCardGrid';
import { Event } from '../types/api';

interface EventGridProps {
    events: Event[];
    allImages: Array<{ src: string; alt: string }>;
}

/**
 * EventGrid component that displays events in a responsive grid layout
 * using the compact EventCardGrid components.
 * 
 * This is ideal for:
 * - Grid view layouts
 * - Dashboard displays
 * - Compact event listings
 * - Mobile-friendly layouts
 */
const EventGrid = ({ events, allImages }: EventGridProps) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
            {events.map((event, index) => (
                <div key={event.id} className="h-full">
                    <EventCardGrid
                        event={event}
                        allImages={allImages}
                        imageIndex={index}
                    />
                </div>
            ))}
        </div>
    );
};

export default EventGrid;
