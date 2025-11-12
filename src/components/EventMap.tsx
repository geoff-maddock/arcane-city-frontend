import { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Link } from '@tanstack/react-router';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Event } from '../types/api';
import { format } from 'date-fns';

// Fix for default marker icons in Leaflet with Webpack/Vite
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';

const DefaultIcon = L.icon({
    iconUrl: icon,
    iconRetinaUrl: iconRetina,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface EventMapProps {
    events: Event[];
}

interface EventLocation {
    lat: number;
    lng: number;
    events: Event[];
}

export default function EventMap({ events }: EventMapProps) {
    const [mapReady, setMapReady] = useState(false);

    useEffect(() => {
        setMapReady(true);
    }, []);

    // Group events by location (venue coordinates)
    const eventLocations = useMemo(() => {
        const locationMap = new Map<string, EventLocation>();

        events.forEach(event => {
            if (event.venue?.primary_location?.latitude && event.venue?.primary_location?.longitude) {
                const lat = event.venue.primary_location.latitude;
                const lng = event.venue.primary_location.longitude;
                const key = `${lat},${lng}`;

                if (locationMap.has(key)) {
                    locationMap.get(key)!.events.push(event);
                } else {
                    locationMap.set(key, {
                        lat,
                        lng,
                        events: [event]
                    });
                }
            }
        });

        return Array.from(locationMap.values());
    }, [events]);

    // Calculate bounds to fit all markers
    const bounds = useMemo(() => {
        if (eventLocations.length === 0) return null;

        const lats = eventLocations.map(loc => loc.lat);
        const lngs = eventLocations.map(loc => loc.lng);

        return L.latLngBounds(
            [Math.min(...lats), Math.min(...lngs)],
            [Math.max(...lats), Math.max(...lngs)]
        );
    }, [eventLocations]);

    // Default center (Pittsburgh coordinates as fallback)
    const defaultCenter: [number, number] = [40.4406, -79.9959];
    const defaultZoom = 12;

    if (!mapReady) {
        return (
            <div className="w-full h-[600px] flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                <p className="text-gray-500">Loading map...</p>
            </div>
        );
    }

    if (eventLocations.length === 0) {
        return (
            <div className="w-full h-[600px] flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
                <p className="text-gray-500">No events with location data found. Try adjusting your filters.</p>
            </div>
        );
    }

    return (
        <div className="w-full h-[600px] rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
            <MapContainer
                center={defaultCenter}
                zoom={defaultZoom}
                bounds={bounds || undefined}
                className="w-full h-full"
                scrollWheelZoom={true}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {eventLocations.map((location, idx) => (
                    <Marker
                        key={idx}
                        position={[location.lat, location.lng]}
                    >
                        <Popup maxWidth={300} className="event-popup">
                            <div className="p-2">
                                {location.events.length === 1 ? (
                                    // Single event at this location
                                    <EventPopupContent event={location.events[0]} />
                                ) : (
                                    // Multiple events at this location
                                    <div>
                                        <h3 className="font-bold mb-2">
                                            {location.events[0].venue?.name}
                                        </h3>
                                        <p className="text-sm text-gray-600 mb-2">
                                            {location.events.length} events at this location
                                        </p>
                                        <div className="space-y-2 max-h-64 overflow-y-auto">
                                            {location.events.map(event => (
                                                <EventPopupContent key={event.id} event={event} compact />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
}

interface EventPopupContentProps {
    event: Event;
    compact?: boolean;
}

function EventPopupContent({ event, compact = false }: EventPopupContentProps) {
    const eventDate = format(new Date(event.start_at), 'MMM d, yyyy');
    const eventTime = format(new Date(event.start_at), 'h:mm a');

    return (
        <div className={compact ? 'mb-2 pb-2 border-b border-gray-200 last:border-0' : ''}>
            <Link
                to="/events/$slug"
                params={{ slug: event.slug }}
                className="font-semibold text-blue-600 hover:underline block mb-1"
            >
                {event.name}
            </Link>
            <div className="text-sm text-gray-700">
                <p className="mb-1">
                    <span className="font-medium">{eventDate}</span> at {eventTime}
                </p>
                {event.venue && (
                    <Link
                        to="/entities/$entitySlug"
                        params={{ entitySlug: event.venue.slug }}
                        className="text-blue-600 hover:underline"
                    >
                        {event.venue.name}
                    </Link>
                )}
                {!compact && event.venue?.primary_location && (
                    <p className="text-gray-600 mt-1">
                        {event.venue.primary_location.address_one}
                        {event.venue.primary_location.city && `, ${event.venue.primary_location.city}`}
                    </p>
                )}
            </div>
        </div>
    );
}
