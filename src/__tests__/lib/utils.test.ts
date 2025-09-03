import { describe, it, expect } from 'vitest';
import { generateGoogleCalendarLink } from '@/lib/utils';

describe('generateGoogleCalendarLink', () => {
    it('generates correct Google Calendar URL with all fields', () => {
        const event = {
            name: 'Test Event',
            description: 'Test Description',
            start_at: '2024-01-15T20:00:00Z',
            end_at: '2024-01-15T23:00:00Z',
            venue: { name: 'Test Venue' }
        };

        const url = generateGoogleCalendarLink(event);
        
        expect(url).toContain('https://www.google.com/calendar/render');
        expect(url).toContain('action=TEMPLATE');
        expect(url).toContain('text=Test%20Event');
        expect(url).toContain('details=Test%20Description');
        expect(url).toContain('location=Test%20Venue');
        expect(url).toContain('sf=true');
        expect(url).toContain('output=xml');
        expect(url).toContain('dates=20240115T200000/20240115T230000');
    });

    it('handles missing optional fields correctly', () => {
        const event = {
            name: 'Test Event',
            start_at: '2024-01-15T20:00:00Z'
        };

        const url = generateGoogleCalendarLink(event);
        
        expect(url).toContain('text=Test%20Event');
        expect(url).toContain('details=');
        expect(url).toContain('location=Unknown');
        expect(url).toContain('dates=20240115T200000/20240115T200000');
    });

    it('handles event with venue but no description', () => {
        const event = {
            name: 'Music Night',
            start_at: '2024-01-15T20:00:00Z',
            venue: { name: 'Downtown Club' }
        };

        const url = generateGoogleCalendarLink(event);
        
        expect(url).toContain('text=Music%20Night');
        expect(url).toContain('details=');
        expect(url).toContain('location=Downtown%20Club');
    });

    it('uses start_at for end time when end_at is not provided', () => {
        const event = {
            name: 'Test Event',
            start_at: '2024-01-15T20:00:00Z'
        };

        const url = generateGoogleCalendarLink(event);
        
        expect(url).toContain('dates=20240115T200000/20240115T200000');
    });

    it('properly encodes special characters in event name and description', () => {
        const event = {
            name: 'Test & Fun Event!',
            description: 'Join us for music & dancing!',
            start_at: '2024-01-15T20:00:00Z',
            venue: { name: 'Club & Bar' }
        };

        const url = generateGoogleCalendarLink(event);
        
        expect(url).toContain('text=Test%20%26%20Fun%20Event!');
        expect(url).toContain('details=Join%20us%20for%20music%20%26%20dancing!');
        expect(url).toContain('location=Club%20%26%20Bar');
    });
});