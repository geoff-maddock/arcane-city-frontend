# Sitemap Implementation

## Overview

This document describes the sitemap implementation for Arcane City, following the recommended approach for a React SPA with a Laravel API backend.

## Architecture

### Frontend (React)
- **Static `robots.txt` file**: Located in `/public/robots.txt`
- **Purpose**: Directs search engine crawlers to the sitemap location
- **Responsibility**: None for sitemap generation - only provides the robots.txt file

### Backend (Laravel API - Events-Tracker)
- **Dynamic Sitemap Endpoint**: `/sitemap.xml` (to be implemented in the Laravel API)
- **Purpose**: Generates sitemap dynamically based on current content
- **Content Includes**:
  - Events (with start dates, locations, etc.)
  - Entities (venues, artists, promoters, etc.)
  - Series (recurring event series)
  - Tags (category/genre tags)
  - Static pages (about, help, privacy, etc.)

## Why This Approach?

### Recommended Pattern
This follows the recommended pattern for SPAs with dynamic content:
1. Keep the frontend static and simple
2. Backend handles content queries and sitemap generation
3. Content changes are reflected immediately (no rebuild needed)
4. Sitemap stays current with daily content changes

### Benefits
- **Always Up-to-Date**: Sitemap reflects current database state
- **No Frontend Rebuild**: Content changes don't require frontend deployment
- **Centralized Logic**: Sitemap generation logic lives where the data lives
- **Better Performance**: Backend can efficiently query and generate sitemap
- **SEO Optimized**: Can include last-modified dates, priorities, change frequencies

## Implementation Details

### Frontend robots.txt
Located at `/public/robots.txt`, this file:
- Allows all search engine crawlers
- Points to the API's sitemap endpoint: `https://api.arcane.city/sitemap.xml`
- Disallows authenticated/admin pages (create, edit, login, etc.)

### Backend Sitemap Endpoint (To Be Implemented)
The Laravel API needs to implement a `/sitemap.xml` endpoint that:
1. Queries all public content (events, entities, series, tags)
2. Generates XML sitemap following the [sitemap protocol](https://www.sitemaps.org/)
3. Includes appropriate metadata (last modified, change frequency, priority)
4. Returns proper content type: `application/xml`

### Example Sitemap Structure
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://arcane.city/</loc>
    <lastmod>2025-10-15</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://arcane.city/events/event-slug</loc>
    <lastmod>2025-10-14</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <!-- More URLs... -->
</urlset>
```

## URL Patterns to Include

### Static Pages
- `/` - Homepage
- `/events` - Events listing
- `/entities` - Entities listing
- `/series` - Series listing
- `/tags` - Tags listing
- `/calendar` - Calendar view
- `/about` - About page
- `/help` - Help page
- `/privacy` - Privacy policy

### Dynamic Content
- `/events/{slug}` - Individual event pages
- `/entities/{slug}` - Individual entity pages
- `/series/{slug}` - Individual series pages
- `/tags/{slug}` - Individual tag pages

### URL Patterns to Exclude
- Authentication pages (`/login`, `/register`, `/password-recovery`, `/password-reset`)
- Account pages (`/account`, `/account/edit`)
- Create/Edit pages (`/events/create`, `/events/*/edit`, etc.)
- Radar/personalized pages (`/radar`)

## Testing

### Verify robots.txt
1. Build the application: `npm run build`
2. Check that `dist/robots.txt` exists and contains correct sitemap URL
3. Serve the built application: `npm run preview`
4. Navigate to `http://localhost:4173/robots.txt`
5. Verify content is correct

### Verify Sitemap Endpoint (Backend)
1. Ensure Laravel API implements `/sitemap.xml` endpoint
2. Test endpoint: `curl https://api.arcane.city/sitemap.xml`
3. Verify XML is valid and includes all content types
4. Use online sitemap validators to check compliance

### Search Console Setup
1. Add property in Google Search Console for `https://arcane.city`
2. Submit sitemap URL: `https://api.arcane.city/sitemap.xml`
3. Monitor indexing status and coverage reports

## Maintenance

### Frontend
- No maintenance required - `robots.txt` is static
- Only update if sitemap URL changes or crawler rules need adjustment

### Backend
- Monitor sitemap generation performance
- Consider caching for large sitemaps (10,000+ URLs)
- Implement sitemap index if content exceeds 50,000 URLs
- Keep last-modified dates accurate
- Update priorities based on content importance

## Laravel Package Recommendations

For implementing the sitemap in the Laravel backend, consider using:
- **spatie/laravel-sitemap**: Popular, well-maintained package
- Features: Automatic crawling, custom URL generation, sitemap index support
- Documentation: https://github.com/spatie/laravel-sitemap

## References

- [Sitemaps Protocol](https://www.sitemaps.org/)
- [Google Sitemap Guidelines](https://developers.google.com/search/docs/advanced/sitemaps/overview)
- [Laravel Sitemap Package](https://github.com/spatie/laravel-sitemap)
- [Events-Tracker API Repository](https://github.com/geoff-maddock/events-tracker)
