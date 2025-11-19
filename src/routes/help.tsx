import { createRoute } from '@tanstack/react-router';
import { rootRoute } from './root';

const Help = () => (
    <div className="min-h-[calc(100vh-4rem)] xl:min-h-screen w-full bg-white dark:bg-black transition-colors">
        <div className="max-w-4xl mx-auto p-6 xl:p-8 space-y-8">
            <h1 className="text-4xl font-bold tracking-tight">Help & FAQ</h1>
            <p className="text-lg">
                Welcome to Arcane City! This guide will help you navigate the site and make the most of all available features.
            </p>
            <div className="space-y-12">
                {/* Getting Started Section */}
                <section>
                    <h2 className="text-2xl font-semibold mb-4">Getting Started</h2>
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-lg font-medium mb-2">Creating an Account</h3>
                            <p className="mb-2">
                                To get the full Arcane City experience, create an account to:
                            </p>
                            <ul className="list-disc list-inside pl-4 space-y-1">
                                <li>Follow your favorite artists, venues, and event series</li>
                                <li>Receive personalized event recommendations</li>
                                <li>Create and manage your own events (for promoters)</li>
                                <li>Save events to your personal calendar</li>
                            </ul>
                        </div>
                    </div>
                </section>

                {/* Navigation Section */}
                <section>
                    <h2 className="text-2xl font-semibold mb-4">Site Navigation</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-lg font-medium mb-2">Main Sections</h3>
                            <ul className="space-y-2">
                                <li><strong>Events:</strong> Browse upcoming events and concerts</li>
                                <li><strong>Entities:</strong> Discover artists, venues, and promoters</li>
                                <li><strong>Series:</strong> Find recurring events and weekly/monthly series</li>
                                <li><strong>Tags:</strong> Explore events by genre, style, or category</li>
                                <li><strong>Calendar:</strong> View events in a calendar format</li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-lg font-medium mb-2">Search & Filter</h3>
                            <ul className="space-y-2">
                                <li>Use the search bar to find specific events or entities</li>
                                <li>Apply filters to narrow down results by date, genre, venue, etc.</li>
                                <li>Sort results by date, popularity, or alphabetically</li>
                                <li>Use tag filters to find events matching your interests</li>
                            </ul>
                        </div>
                    </div>
                </section>

                {/* Events Section */}
                <section>
                    <h2 className="text-2xl font-semibold mb-4">Working with Events</h2>
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-lg font-medium mb-2">Finding Events</h3>
                            <ul className="list-disc list-inside pl-4 space-y-1">
                                <li>Browse the main Events page for upcoming shows</li>
                                <li>Use the Calendar view to see events by date</li>
                                <li>Filter by venue, genre, artist, or date range</li>
                                <li>Click on any event card to see full details</li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-lg font-medium mb-2">Event Details</h3>
                            <p className="mb-2">Event pages include:</p>
                            <ul className="list-disc list-inside pl-4 space-y-1">
                                <li>Date, time, and venue information</li>
                                <li>Ticket prices and purchase links</li>
                                <li>Artist lineup and descriptions</li>
                                <li>Related events and series</li>
                                <li>Photos and additional media</li>
                            </ul>
                        </div>
                    </div>
                </section>

                {/* For Promoters Section */}
                <section>
                    <h2 className="text-2xl font-semibold mb-4">For Event Promoters</h2>
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-lg font-medium mb-2">Adding Events</h3>
                            <ul className="list-disc list-inside pl-4 space-y-1">
                                <li>Create an account and verify your promoter status</li>
                                <li>Use the "Create Event" feature to add new events</li>
                                <li>Include complete details: date, time, venue, lineup, tickets</li>
                                <li>Add high-quality images and descriptions</li>
                                <li>Tag events appropriately for better discoverability</li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-lg font-medium mb-2">Event Promotion</h3>
                            <p className="mb-2">Events added to Arcane City are automatically:</p>
                            <ul className="list-disc list-inside pl-4 space-y-1">
                                <li>Shared on the main site calendar</li>
                                <li>Posted to our Instagram account</li>
                                <li>Included in follower notifications</li>
                                <li>Added to relevant artist and venue pages</li>
                            </ul>
                        </div>
                    </div>
                </section>

                {/* Events Section */}
                <section>
                    <h2 className="text-2xl font-semibold mb-4">Working with Entities</h2>
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-lg font-medium mb-2">Finding Events</h3>
                            <ul className="list-disc list-inside pl-4 space-y-1">
                                <li>Browse the main Entities page and filter by different criteria like type, role, tag, etc</li>
                                <li>Use the search bar to search by free text</li>
                                <li>Click on any entity card to see full details</li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-lg font-medium mb-2">Adding an Entity</h3>
                            <ul className="list-disc list-inside pl-4 space-y-1">
                                <li>Anyone with a verified account can log in and add an entity</li>
                                <li>You might want to add an entity if you are a band, dj, promoter, venue or other part of the scene.</li>
                                <li>Always make sure to add the entity type - these include Group, Individual, Interest and Space.</li>
                                <li>Always make sure to add the entity role - these include Band, DJ, Promoter, Venue, and more.  Setting venue or promoter will cause the enity to show up in those select lists.</li>
                                <li>Add as many tags as are completely relevant to help people find the entity, but I think a sweet spot is 3-5 tags.</li>
                                <li>If you include a soundcloud or bandcamp link, an embedded player will show up on the entity and any events they are related to.</li>
                                <li>After saving the entity, go to the detail page and add the primary photo.  This will be used as the main image for the entity.  You can change it later as well.</li>
                            </ul>
                        </div>
                    </div>
                </section>

                {/* Common Questions Section */}
                <section>
                    <h2 className="text-2xl font-semibold mb-4">Frequently Asked Questions</h2>
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-medium mb-2">How do I follow an artist or venue?</h3>
                            <p>
                                Visit the artist or venue's page and click the "Follow" button. You'll receive notifications
                                when they have new events or updates.
                            </p>
                        </div>
                        <div>
                            <h3 className="text-lg font-medium mb-2">Can I add my own events?</h3>
                            <p>
                                Yes! Create an account and use the "Create Event" feature. Events are reviewed before
                                being published to ensure quality and accuracy.
                            </p>
                        </div>
                        <div>
                            <h3 className="text-lg font-medium mb-2">How do I get event notifications?</h3>
                            <p>
                                Sign up for an account and follow artists, venues, or series you're interested in.
                                You can customize notification preferences in your account settings.
                            </p>
                        </div>
                        <div>
                            <h3 className="text-lg font-medium mb-2">What areas does Arcane City cover?</h3>
                            <p>
                                Arcane City primarily focuses on the Pittsburgh music scene, including concerts,
                                club nights, and events in the greater Pittsburgh area.
                            </p>
                        </div>
                        <div>
                            <h3 className="text-lg font-medium mb-2">How do I report incorrect information?</h3>
                            <p>
                                If you notice incorrect event details or other issues, please contact us at{' '}
                                <a href="mailto:geoff.maddock@gmail.com" className="text-blue-600 hover:text-blue-800 underline">
                                    geoff.maddock@gmail.com
                                </a>{' '}
                                and we'll address it promptly.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Troubleshooting Section */}
                <section>
                    <h2 className="text-2xl font-semibold mb-4">Troubleshooting</h2>
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-lg font-medium mb-2">Common Issues</h3>
                            <ul className="list-disc list-inside pl-4 space-y-2">
                                <li>
                                    <strong>Can't find an event:</strong> Try using different search terms or browse by
                                    venue/artist instead
                                </li>
                                <li>
                                    <strong>Login problems:</strong> Check your email for verification links or try
                                    resetting your password
                                </li>
                                <li>
                                    <strong>Event not showing:</strong> New events may take a few minutes to appear
                                    after being added
                                </li>
                                <li>
                                    <strong>Mobile display issues:</strong> Try refreshing the page or clearing your
                                    browser cache
                                </li>
                            </ul>
                        </div>
                    </div>
                </section>

                {/* Contact Section */}
                <section>
                    <h2 className="text-2xl font-semibold mb-4">Still Need Help?</h2>
                    <div className="bg-gray-50 dark:bg-gray-800/40 p-6 rounded-lg ring-1 ring-gray-200 dark:ring-gray-700">
                        <p className="mb-4">
                            Can't find what you're looking for? We're here to help!
                        </p>
                        <div className="space-y-2">
                            <p>
                                <strong>Email:</strong>{' '}
                                <a href="mailto:geoff.maddock@gmail.com" className="underline hover:text-blue-600 dark:hover:text-blue-400">
                                    geoff.maddock@gmail.com
                                </a>
                            </p>
                            <p>
                                <strong>Instagram:</strong>{' '}
                                <a href="https://www.instagram.com/arcane.city" className="underline hover:text-pink-600 dark:hover:text-pink-400">
                                    @arcane.city
                                </a>
                            </p>
                            <p>
                                <strong>Facebook:</strong>{' '}
                                <a href="https://www.facebook.com/arcanecity/" className="underline hover:text-blue-600 dark:hover:text-blue-400">
                                    /arcanecity
                                </a>
                            </p>
                        </div>
                        <p className="text-sm mt-4 text-gray-600 dark:text-gray-400">
                            We typically respond to inquiries within 1-2 business days.
                        </p>
                    </div>
                </section>
            </div>
        </div>
    </div>
);

export const HelpRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/help',
    component: Help,
});
