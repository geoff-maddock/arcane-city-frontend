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
})
