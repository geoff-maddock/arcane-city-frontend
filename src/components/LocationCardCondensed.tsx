import { LocationResponse } from '../types/api';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import MapPin from '@/components/icons/MapPin';

interface LocationCardCondensedProps {
    location: LocationResponse;
}

export default function LocationCardCondensed({ location }: LocationCardCondensedProps) {
    return (
        <Card className="group overflow-hidden transition-all hover:shadow-md">
            <CardHeader className="p-4 pb-2">
                <div className="flex items-start">
                    <div className="mr-3 mt-1">
                        <MapPin className="h-5 w-5 text-gray-500" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-xl font-semibold leading-tight text-gray-900 mb-2">
                            {location.name}
                        </h3>
                        <div className="space-y-1 text-sm text-gray-600">
                            {location.address_one && (
                                <p>{location.address_one}</p>
                            )}
                            {location.address_two && (
                                <p>{location.address_two}</p>
                            )}
                            {(location.city || location.state || location.postcode) && (
                                <p>
                                    {location.city}
                                    {location.state && <span>, {location.state}</span>}
                                    {location.postcode && <span> {location.postcode}</span>}
                                </p>
                            )}
                            {location.neighborhood && (
                                <p className="text-gray-500 italic">{location.neighborhood}</p>
                            )}
                        </div>
                    </div>
                </div>
            </CardHeader>
            {location.map_url && (
                <CardContent className="p-4 pt-2">
                    <a
                        href={location.map_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline"
                    >
                        View on map
                    </a>
                </CardContent>
            )}
        </Card>
    );
}
