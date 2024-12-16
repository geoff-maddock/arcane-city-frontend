// src/components/EventCard.tsx
import { Event } from '../types/api';
import { formatDate } from '../lib/utils';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, MapPin, Users, DollarSign } from 'lucide-react';

interface EventCardProps {
    event: Event;
}

export default function EventCard({ event }: EventCardProps) {
    return (
        <Card className="group overflow-hidden transition-all hover:shadow-md">
            <CardHeader className="p-4 pb-2">
                <div className="space-y-1">
                    <h3 className="line-clamp-2 text-xl font-semibold leading-tight text-gray-900">
                        {event.name}
                    </h3>
                    {event.short && (
                        <p className="line-clamp-2 text-sm text-gray-500">{event.short}</p>
                    )}
                </div>
            </CardHeader>
            <CardContent className="p-4 pt-2">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <div className="flex items-center text-sm text-gray-500">
                            <CalendarDays className="mr-2 h-4 w-4" />
                            {formatDate(event.start_at)}
                        </div>

                        {event.venue && (
                            <div className="flex items-center text-sm text-gray-500">
                                <MapPin className="mr-2 h-4 w-4" />
                                {event.venue.name}
                            </div>
                        )}

                        {event.min_age && (
                            <div className="flex items-center text-sm text-gray-500">
                                <Users className="mr-2 h-4 w-4" />
                                {event.min_age}+ Only
                            </div>
                        )}

                        {(event.presale_price || event.door_price) && (
                            <div className="flex items-center gap-3 text-sm">
                                <DollarSign className="h-4 w-4 text-gray-500" />
                                {event.presale_price && (
                                    <span className="text-green-600">
                                        Presale: ${event.presale_price}
                                    </span>
                                )}
                                {event.door_price && (
                                    <span className="text-gray-600">
                                        Door: ${event.door_price}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>

                    {event.tags && event.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {event.tags.map((tag) => (
                                <Badge
                                    key={tag.id}
                                    variant="secondary"
                                    className="bg-gray-100 text-gray-800 hover:bg-gray-200"
                                >
                                    {tag.name}
                                </Badge>
                            ))}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}