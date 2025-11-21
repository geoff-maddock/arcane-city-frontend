# Quick Start: Fixing Social Media Sharing

This document provides a quick overview of how to implement the SEO improvements for social media crawlers.

## What Was Done in This PR

✅ **Improved Default Meta Tags** in `index.html`
- Fixed og:image URL from beta.arcane.city to arcane.city
- Added og:image dimensions (800x600)
- Added og:site_name
- Fixed Twitter card attributes

✅ **Created Comprehensive Documentation**
- SEO and Social Sharing Guide (docs/SEO_AND_SOCIAL_SHARING.md)
- Rendertron Setup Guide (docs/RENDERTRON_SETUP.md)
- Nginx Configuration Example (nginx.conf.example)

## What Still Needs to Be Done

The changes in this PR improve the fallback meta tags, but **social media crawlers will still see generic images** for specific event/entity pages because they don't execute JavaScript.

### To Fully Fix Social Media Sharing

You need to implement **one** of these solutions:

### Option 1: Prerender.io (Easiest - Managed Service)

**Effort**: 30 minutes  
**Cost**: Free tier available, paid plans start at $20/month

1. Sign up at [prerender.io](https://prerender.io/)
2. Get your API token
3. Add to nginx config:
```nginx
if ($http_user_agent ~* "bot|crawler|facebookexternalhit|twitterbot") {
    set $prerender_token "YOUR_TOKEN";
    rewrite .* /$scheme://$host$request_uri? break;
    proxy_pass https://service.prerender.io;
    proxy_set_header X-Prerender-Token $prerender_token;
}
```
4. Restart nginx
5. Test with Facebook Sharing Debugger

### Option 2: Rendertron (Self-Hosted - Free)

**Effort**: 2-3 hours  
**Cost**: Free (just server resources)

1. Install Docker on your server
2. Run: `docker run -d --name rendertron -p 3000:3000 gcr.io/rendertron/rendertron`
3. Follow docs/RENDERTRON_SETUP.md for complete setup
4. Configure nginx using nginx.conf.example
5. Test with Facebook Sharing Debugger

### Option 3: Do Nothing (Current State)

**Impact**:
- ✅ Google search works perfectly (Googlebot executes JS)
- ✅ Users see correct page titles and content
- ❌ Social media shares show generic image/description
- ❌ Facebook/Twitter/LinkedIn won't show event-specific images

## Testing After Implementation

### 1. Facebook Sharing Debugger
https://developers.facebook.com/tools/debug/

Enter a URL like: `https://arcane.city/events/your-event-slug`

**Expected**: Should show event-specific image and description

### 2. Twitter Card Validator
https://cards-dev.twitter.com/validator

**Expected**: Should show event-specific preview card

### 3. Manual Test with cURL

```bash
# Simulate Facebook crawler
curl -A "facebookexternalhit/1.1" https://arcane.city/events/your-event-slug

# Check the HTML output for og:image tag with event-specific image
```

## Monitoring

After implementing Rendertron or Prerender.io:

1. **Check logs** to see crawler requests:
```bash
# Nginx
tail -f /var/log/nginx/access.log | grep -i bot

# Docker (Rendertron)
docker logs -f rendertron
```

2. **Monitor performance**:
```bash
docker stats rendertron
```

3. **Test weekly** with social media debuggers to ensure it's working

## Troubleshooting

### Problem: Social media still shows old image

**Solution**: 
1. Clear Facebook's cache: https://developers.facebook.com/tools/debug/ (click "Scrape Again")
2. Check nginx logs to verify crawler was detected
3. Test with curl to see what HTML crawlers receive

### Problem: Rendertron using too much memory

**Solution**:
1. Limit Docker memory: `docker update --memory="1g" rendertron`
2. Add nginx caching (see docs/RENDERTRON_SETUP.md)
3. Consider Prerender.io instead

### Problem: Website slow for regular users

**Solution**:
- Prerendering only affects crawlers, not regular users
- Check nginx config - regular traffic should bypass Rendertron
- Verify: `curl https://arcane.city/` (should be fast)

## Questions?

- Review docs/SEO_AND_SOCIAL_SHARING.md for detailed explanation
- Review docs/RENDERTRON_SETUP.md for step-by-step setup
- Review nginx.conf.example for configuration reference

## Summary

- **This PR**: Improves fallback meta tags (immediate benefit)
- **Next Step**: Implement Rendertron or Prerender.io (solves crawler issue)
- **Long-term**: Consider SSR migration if needed (major refactor)

Choose Option 1 (Prerender.io) if you want quick setup with minimal maintenance.  
Choose Option 2 (Rendertron) if you prefer self-hosted and have technical expertise.
