import React from 'react';
import { createRoute } from '@tanstack/react-router';
import { rootRoute } from './root';

const Help: React.FC = () => (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">Help & FAQ</h1>
        <p className="text-lg text-gray-700">
            Welcome to Arcane City! This guide will help you navigate the site and make the most of all available features.
        </p>

        <div className="space-y-8">
            {/* Getting Started Section */}
            <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Getting Started</h2>
                <div className="space-y-4">
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Creating an Account</h3>
                        <p className="text-gray-700 mb-2">
                            To get the full Arcane City experience, create an account to:
                        </p>
                        <ul className="list-disc list-inside pl-4 space-y-1 text-gray-700">
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
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Site Navigation</h2>
                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Main Sections</h3>
                        <ul className="space-y-2 text-gray-700">
                            <li><strong>Events:</strong> Browse upcoming events and concerts</li>
                            <li><strong>Entities:</strong> Discover artists, venues, and promoters</li>
                            <li><strong>Series:</strong> Find recurring events and weekly/monthly series</li>
                            <li><strong>Tags:</strong> Explore events by genre, style, or category</li>
                            <li><strong>Calendar:</strong> View events in a calendar format</li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Search & Filter</h3>
                        <ul className="space-y-2 text-gray-700">
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
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Working with Events</h2>
                <div className="space-y-4">
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Finding Events</h3>
                        <ul className="list-disc list-inside pl-4 space-y-1 text-gray-700">
                            <li>Browse the main Events page for upcoming shows</li>
                            <li>Use the Calendar view to see events by date</li>
                            <li>Filter by venue, genre, artist, or date range</li>
                            <li>Click on any event card to see full details</li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Event Details</h3>
                        <p className="text-gray-700 mb-2">Event pages include:</p>
                        <ul className="list-disc list-inside pl-4 space-y-1 text-gray-700">
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
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">For Event Promoters</h2>
                <div className="space-y-4">
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Adding Events</h3>
                        <ul className="list-disc list-inside pl-4 space-y-1 text-gray-700">
                            <li>Create an account and verify your promoter status</li>
                            <li>Use the "Create Event" feature to add new events</li>
                            <li>Include complete details: date, time, venue, lineup, tickets</li>
                            <li>Add high-quality images and descriptions</li>
                            <li>Tag events appropriately for better discoverability</li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Event Promotion</h3>
                        <p className="text-gray-700 mb-2">Events added to Arcane City are automatically:</p>
                        <ul className="list-disc list-inside pl-4 space-y-1 text-gray-700">
                            <li>Shared on the main site calendar</li>
                            <li>Posted to our Instagram account</li>
                            <li>Included in follower notifications</li>
                            <li>Added to relevant artist and venue pages</li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* Common Questions Section */}
            <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Frequently Asked Questions</h2>
                <div className="space-y-6">
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">How do I follow an artist or venue?</h3>
                        <p className="text-gray-700">
                            Visit the artist or venue's page and click the "Follow" button. You'll receive notifications
                            when they have new events or updates.
                        </p>
                    </div>
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Can I add my own events?</h3>
                        <p className="text-gray-700">
                            Yes! Create an account and use the "Create Event" feature. Events are reviewed before
                            being published to ensure quality and accuracy.
                        </p>
                    </div>
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">How do I get event notifications?</h3>
                        <p className="text-gray-700">
                            Sign up for an account and follow artists, venues, or series you're interested in.
                            You can customize notification preferences in your account settings.
                        </p>
                    </div>
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">What areas does Arcane City cover?</h3>
                        <p className="text-gray-700">
                            Arcane City primarily focuses on the Pittsburgh music scene, including concerts,
                            club nights, and events in the greater Pittsburgh area.
                        </p>
                    </div>
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">How do I report incorrect information?</h3>
                        <p className="text-gray-700">
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
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Troubleshooting</h2>
                <div className="space-y-4">
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Common Issues</h3>
                        <ul className="list-disc list-inside pl-4 space-y-2 text-gray-700">
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
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Still Need Help?</h2>
                <div className="bg-gray-50 p-6 rounded-lg">
                    <p className="text-gray-700 mb-4">
                        Can't find what you're looking for? We're here to help!
                    </p>
                    <div className="space-y-2">
                        <p>
                            <strong>Email:</strong>{' '}
                            <a href="mailto:geoff.maddock@gmail.com" className="text-blue-600 hover:text-blue-800 underline">
                                geoff.maddock@gmail.com
                            </a>
                        </p>
                        <p>
                            <strong>Instagram:</strong>{' '}
                            <a href="https://www.instagram.com/arcane.city" className="text-blue-600 hover:text-blue-800 underline">
                                @arcane.city
                            </a>
                        </p>
                        <p>
                            <strong>Facebook:</strong>{' '}
                            <a href="https://www.facebook.com/arcanecity/" className="text-blue-600 hover:text-blue-800 underline">
                                /arcanecity
                            </a>
                        </p>
                    </div>
                    <p className="text-gray-600 text-sm mt-4">
                        We typically respond to inquiries within 1-2 business days.
                    </p>
                </div>
            </section>
        </div>
    </div>
);

export const HelpRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/help',
    component: Help,
});
