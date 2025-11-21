# SEO and Social Sharing Guide

## Current Situation

Arcane City Frontend is a Single Page Application (SPA) built with React and TanStack Router. The application uses dynamic meta tags that are updated via JavaScript when navigating between pages.

### What Works

- **Google Search**: Modern Googlebot executes JavaScript, so our dynamic meta tags work correctly for SEO and Google search rankings
- **User Experience**: Users with JavaScript enabled see the correct page titles and meta information
- **Structured Data**: JSON-LD structured data is properly generated and included for search engines

### What Doesn't Work

- **Social Media Crawlers**: Facebook, Twitter, LinkedIn, and other social media platforms don't execute JavaScript when scraping pages for preview cards
- **Result**: When sharing links to specific events/entities, social media shows the default og:image from `index.html` instead of the event-specific image

## The Problem

When you share a link like `https://arcane.city/events/some-event`, social media crawlers see only the static HTML from `index.html`:

```html
<meta property="og:image" content="https://arcane.city/arcane-city-pgh.gif">
```

They never execute the JavaScript that would update this to the event-specific image.

## Solutions

There are several approaches to solve this issue, ranked by implementation complexity:

### Option 1: Prerendering Service (Recommended)

Use a prerendering service that detects crawlers and serves pre-rendered HTML.

#### Prerender.io (Commercial)
- Sign up at [prerender.io](https://prerender.io/)
- Add middleware to your nginx/apache configuration
- Free tier available for small sites

#### Rendertron (Open Source)
- Self-hosted prerendering service by Google
- Requires Node.js server to run
- GitHub: [GoogleChrome/rendertron](https://github.com/GoogleChrome/rendertron)

**Nginx Configuration Example:**

```nginx
# Add this to your nginx configuration
location / {
    # Check if the request is from a crawler
    set $prerender 0;
    if ($http_user_agent ~* "bot|crawler|spider|crawling|facebookexternalhit|twitterbot|linkedinbot|slackbot|whatsapp") {
        set $prerender 1;
    }
    
    if ($args ~ "_escaped_fragment_") {
        set $prerender 1;
    }
    
    if ($http_user_agent ~ "Prerender") {
        set $prerender 0;
    }
    
    # If it's a crawler, proxy to prerender service
    if ($prerender = 1) {
        rewrite .* /$scheme://$host$request_uri? break;
        proxy_pass http://prerender:3000;
    }
    
    # Otherwise serve the SPA normally
    try_files $uri $uri/ /index.html;
}
```

### Option 2: Server-Side Rendering (SSR)

**Pros:**
- Complete solution for both SEO and social sharing
- Better initial page load performance
- Real-time content in meta tags

**Cons:**
- Requires significant refactoring
- Would need to migrate to a framework like:
  - [Vike](https://vike.dev/) (Vite + SSR)
  - [Next.js](https://nextjs.org/)
  - [Remix](https://remix.run/)

**Effort:** High (1-2 weeks of development)

### Option 3: Static Site Generation (SSG) with Hybrid Approach

Generate static HTML for the most important pages at build time while keeping the SPA for other routes.

**Implementation:**
1. Generate static HTML files for:
   - Recent events (`/events/:slug`)
   - Popular entities (`/entities/:slug`)
   - Active series (`/series/:slug`)
   - Main tag pages (`/tags/:slug`)

2. Configure server to serve static files to crawlers

**Effort:** Medium (2-3 days of development)

### Option 4: Dynamic Meta Tag Service

Create a lightweight API endpoint that serves proper HTML with meta tags for crawlers.

**Architecture:**
```
Crawler Request → Nginx → Meta Tag Service → Returns HTML with proper meta tags
User Request → Nginx → SPA (existing behavior)
```

**Effort:** Medium (2-3 days of development)

## Quick Fix: Improved Default Meta Tags

While implementing a full solution, you can improve the default meta tags in `index.html` to provide better fallback content:

```html
<!-- Use a more appealing default image -->
<meta property="og:image" content="https://arcane.city/og-default.png">

<!-- Add image dimensions for better previews -->
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">

<!-- Specify site name -->
<meta property="og:site_name" content="Arcane City">

<!-- Add Twitter-specific tags -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:site" content="@arcanecitypgh">
```

## Testing Social Sharing

After implementing any solution, test with these tools:

1. **Facebook Sharing Debugger**: https://developers.facebook.com/tools/debug/
2. **Twitter Card Validator**: https://cards-dev.twitter.com/validator
3. **LinkedIn Post Inspector**: https://www.linkedin.com/post-inspector/
4. **Open Graph Checker**: https://www.opengraph.xyz/

## Monitoring SEO

- **Google Search Console**: Monitor search performance and indexing
- **PageSpeed Insights**: Check Core Web Vitals
- **Lighthouse**: Audit SEO, performance, and accessibility

## Current Implementation Details

### Dynamic Meta Tags (Runtime)

The application uses TanStack Router's `head()` function to set meta tags:

```typescript
// Example from src/routes/event-detail.tsx
head: ({ loaderData }) => {
  const event = loaderData as Event;
  const title = buildEventTitle(event);
  const description = truncate(event.short || event.description);
  const ogImage = buildOgImage(event) || DEFAULT_IMAGE;
  
  return {
    meta: [
      { title: `${title} • ${SITE_NAME}` },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:image', content: ogImage },
      // ...
    ],
  };
},
```

### SEO Utilities

- **`src/lib/seo.ts`**: Centralized SEO helpers and defaults
- **`src/lib/structuredData.ts`**: JSON-LD structured data generation

## Recommended Next Steps

1. **Short-term**: Implement Option 1 (Prerendering Service) with Prerender.io or Rendertron
2. **Medium-term**: Consider Option 3 (Static Generation for key pages)
3. **Long-term**: Evaluate migration to SSR if the application grows significantly

## Additional Resources

- [Google's SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide)
- [Open Graph Protocol](https://ogp.me/)
- [Twitter Card Documentation](https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards)
- [TanStack Router SEO Documentation](https://tanstack.com/router/latest/docs/framework/react/guide/seo)
