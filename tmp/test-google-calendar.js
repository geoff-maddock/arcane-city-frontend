import { generateGoogleCalendarLink } from '../lib/utils';

// Test the Google Calendar link generation with realistic event data
const testEvent = {
    name: 'Live Music Night at Downtown Club',
    description: 'Join us for an amazing night of live music featuring local bands and DJs. Great food and drinks available.',
    start_at: '2024-12-15T20:00:00Z',
    end_at: '2024-12-15T23:30:00Z',
    venue: { name: 'Downtown Music Club' }
};

const url = generateGoogleCalendarLink(testEvent);
console.log('Generated Google Calendar URL:');
console.log(url);
console.log('\nURL components:');
console.log('- Event name:', testEvent.name);
console.log('- Start time:', testEvent.start_at);
console.log('- End time:', testEvent.end_at);
console.log('- Venue:', testEvent.venue.name);
console.log('- Description:', testEvent.description);