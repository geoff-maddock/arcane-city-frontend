import { describe, it, expect, vi } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import { render } from '../test-render'
import EventCardGridCompact from '../../components/EventCardGridCompact'
import { Event } from '../../types/api';

// Mock ImageLightbox component
vi.mock('../../components/ImageLightbox', () => ({
    ImageLightbox: ({ alt }: { alt: string }) => (
        <img src="test-image.jpg" alt={alt} data-testid="image-lightbox" />
    )
}))

// Mock navigate function
const mockNavigate = vi.fn()
vi.mock('@tanstack/react-router', () => ({
    useNavigate: () => mockNavigate,
    Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
        <a href={to}>{children}</a>
    ),
}))

describe('EventCardGridCompact', () => {
    const mockEvent: Event = {
        id: 1,
        slug: 'test-event',
        name: 'Test Event',
        primary_photo: 'https://example.com/photo.jpg',
        primary_photo_thumbnail: 'https://example.com/photo-thumb.jpg',
        start_at: '2023-12-25T19:00:00Z',
        attending: 0,
        like: 0,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-02T00:00:00Z'
    }

    const mockImages = [
        { src: 'https://example.com/photo.jpg', alt: 'Test Event' },
        { src: 'https://example.com/photo2.jpg', alt: 'Test Event 2' }
    ]

    it('renders event image', () => {
        render(
            <EventCardGridCompact
                event={mockEvent}
                allImages={mockImages}
                imageIndex={0}
            />
        )

        const image = screen.getByTestId('image-lightbox')
        expect(image).toBeInTheDocument()
        expect(image).toHaveAttribute('alt', 'Test Event')
    })

    it('shows date bar when showDateBar is true', () => {
        render(
            <EventCardGridCompact
                event={mockEvent}
                allImages={mockImages}
                imageIndex={0}
                showDateBar={true}
                dateLabel="Mon, Dec 25, 2023"
            />
        )

        expect(screen.getByText('Mon, Dec 25, 2023')).toBeInTheDocument()
    })

    it('hides date bar when showDateBar is false', () => {
        render(
            <EventCardGridCompact
                event={mockEvent}
                allImages={mockImages}
                imageIndex={0}
                showDateBar={false}
                dateLabel="Mon, Dec 25, 2023"
            />
        )

        expect(screen.queryByText('Mon, Dec 25, 2023')).not.toBeInTheDocument()
    })

    it('navigates to event details when Details button is clicked', () => {
        render(
            <EventCardGridCompact
                event={mockEvent}
                allImages={mockImages}
                imageIndex={0}
            />
        )

        const detailsButton = screen.getByText('Details')
        fireEvent.click(detailsButton)

        expect(mockNavigate).toHaveBeenCalledWith({
            to: '/events/$slug',
            params: { slug: 'test-event' }
        })
    })

    it('uses placeholder image when event has no photo', () => {
        const eventWithoutPhoto = { ...mockEvent, primary_photo: undefined, primary_photo_thumbnail: undefined }
        
        render(
            <EventCardGridCompact
                event={eventWithoutPhoto}
                allImages={mockImages}
                imageIndex={0}
            />
        )

        expect(screen.getByTestId('image-lightbox')).toBeInTheDocument()
    })

    it('renders placeholder when showDateBar is false to maintain alignment', () => {
        const { container } = render(
            <EventCardGridCompact
                event={mockEvent}
                allImages={mockImages}
                imageIndex={0}
                showDateBar={false}
            />
        )

        // Check that there's an invisible placeholder div
        const placeholder = container.querySelector('.invisible')
        expect(placeholder).toBeInTheDocument()
        expect(placeholder).toHaveTextContent('Placeholder')
    })

    it('highlights weekend dates with amber background', () => {
        render(
            <EventCardGridCompact
                event={mockEvent}
                allImages={mockImages}
                imageIndex={0}
                showDateBar={true}
                dateLabel="Sat, Dec 23, 2023"
                isWeekend={true}
            />
        )

        const dateBar = screen.getByText('Sat, Dec 23, 2023')
        expect(dateBar).toHaveClass('bg-amber-500')
        expect(dateBar).toHaveClass('text-white')
    })

    it('uses primary background for weekday dates', () => {
        render(
            <EventCardGridCompact
                event={mockEvent}
                allImages={mockImages}
                imageIndex={0}
                showDateBar={true}
                dateLabel="Mon, Dec 25, 2023"
                isWeekend={false}
            />
        )

        const dateBar = screen.getByText('Mon, Dec 25, 2023')
        expect(dateBar).toHaveClass('bg-primary')
        expect(dateBar).toHaveClass('text-primary-foreground')
    })

    it('displays event type and tags on hover', () => {
        const eventWithTypeAndTags: Event = {
            ...mockEvent,
            event_type: { 
                id: 1, 
                name: 'Concert',
                slug: 'concert',
                created_at: '2023-01-01T00:00:00Z',
                updated_at: '2023-01-01T00:00:00Z'
            },
            tags: [
                { id: 1, name: 'Rock', slug: 'rock' },
                { id: 2, name: 'Live Music', slug: 'live-music' },
                { id: 3, name: 'Indie', slug: 'indie' }
            ]
        }

        const { container } = render(
            <EventCardGridCompact
                event={eventWithTypeAndTags}
                allImages={mockImages}
                imageIndex={0}
            />
        )

        const imageContainer = container.querySelector('.w-\\[120px\\]')
        expect(imageContainer).toBeInTheDocument()

        // Initially, overlay should not be visible
        expect(screen.queryByText('Concert')).not.toBeInTheDocument()

        // Hover over the image container
        if (imageContainer) {
            fireEvent.mouseEnter(imageContainer)
        }

        // Now event type and top 2 tags should be visible
        expect(screen.getByText('Concert')).toBeInTheDocument()
        expect(screen.getByText('Rock')).toBeInTheDocument()
        expect(screen.getByText('Live Music')).toBeInTheDocument()
        // Third tag should not be displayed
        expect(screen.queryByText('Indie')).not.toBeInTheDocument()
    })
})
