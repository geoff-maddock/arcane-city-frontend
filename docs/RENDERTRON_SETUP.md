# Rendertron Setup Guide

Rendertron is Google's open-source headless Chrome rendering solution for rendering and serving your JavaScript-powered SPA for web crawlers.

## Prerequisites

- Docker (recommended) OR Node.js 18+
- Server with at least 1GB RAM (2GB+ recommended)

## Option 1: Docker Installation (Recommended)

### 1. Install Docker

```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
```

### 2. Pull and Run Rendertron

```bash
# Pull the official Rendertron image
docker pull gcr.io/rendertron/rendertron

# Run Rendertron on port 3000
docker run -d \
  --name rendertron \
  --restart unless-stopped \
  -p 3000:3000 \
  gcr.io/rendertron/rendertron
```

### 3. Verify Installation

```bash
# Check if Rendertron is running
curl http://localhost:3000/

# Test rendering a page
curl http://localhost:3000/render/https://example.com
```

### 4. Configure Nginx

Update your nginx configuration to proxy crawler requests to Rendertron:

```nginx
location / {
    set $prerender 0;
    
    if ($http_user_agent ~* "bot|crawler|spider|facebookexternalhit|twitterbot") {
        set $prerender 1;
    }
    
    if ($prerender = 1) {
        rewrite .* /render/$scheme://$host$request_uri? break;
        proxy_pass http://localhost:3000;
    }
    
    try_files $uri $uri/ /index.html;
}
```

### 5. Restart Nginx

```bash
sudo nginx -t  # Test configuration
sudo systemctl restart nginx
```

## Option 2: Node.js Installation

### 1. Install Node.js

```bash
# Using nvm (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18
```

### 2. Install Rendertron

```bash
# Clone the repository
git clone https://github.com/GoogleChrome/rendertron.git
cd rendertron

# Install dependencies
npm install

# Build
npm run build
```

### 3. Run Rendertron

```bash
# Run as a service
npm run start
```

### 4. Set up as a System Service (Linux)

Create `/etc/systemd/system/rendertron.service`:

```ini
[Unit]
Description=Rendertron Service
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/rendertron
ExecStart=/usr/bin/node /path/to/rendertron/build/rendertron.js
Restart=on-failure
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=rendertron

[Install]
WantedBy=multi-user.target
```

Enable and start the service:

```bash
sudo systemctl enable rendertron
sudo systemctl start rendertron
sudo systemctl status rendertron
```

## Testing Rendertron

### Test Local Rendering

```bash
# Test with your production URL
curl http://localhost:3000/render/https://arcane.city/events/some-event

# You should see full HTML with rendered content
```

### Test with Facebook Debugger

1. Go to https://developers.facebook.com/tools/debug/
2. Enter a URL from your site (e.g., `https://arcane.city/events/some-event`)
3. Click "Scrape Again"
4. Check if the og:image and other meta tags are correct

### Test with cURL (Simulating a Crawler)

```bash
# Simulate Facebook crawler
curl -A "facebookexternalhit/1.1" https://arcane.city/events/some-event

# Simulate Twitter bot
curl -A "Twitterbot/1.0" https://arcane.city/events/some-event

# You should see the rendered HTML with proper meta tags
```

## Performance Tuning

### Rendertron Configuration

Create a `config.json` file:

```json
{
  "datastoreCache": true,
  "timeout": 10000,
  "port": 3000,
  "host": "0.0.0.0",
  "width": 1000,
  "height": 1000,
  "reqHeaders": {},
  "renderOnly": []
}
```

### Nginx Caching

Add caching to reduce Rendertron load:

```nginx
# Create cache zone
proxy_cache_path /var/cache/nginx/rendertron levels=1:2 keys_zone=rendertron:10m max_size=100m inactive=24h;

# In location block
if ($prerender = 1) {
    rewrite .* /render/$scheme://$host$request_uri? break;
    proxy_pass http://localhost:3000;
    proxy_cache rendertron;
    proxy_cache_valid 200 24h;
    proxy_cache_key "$scheme$request_method$host$request_uri";
    add_header X-Cache-Status $upstream_cache_status;
}
```

## Monitoring

### Check Rendertron Logs

```bash
# Docker
docker logs rendertron

# Systemd service
journalctl -u rendertron -f
```

### Monitor Performance

```bash
# Check memory usage
docker stats rendertron

# Or for native installation
ps aux | grep rendertron
```

## Troubleshooting

### High Memory Usage

If Rendertron uses too much memory:

1. Limit Docker memory:
```bash
docker run -d \
  --name rendertron \
  --memory="1g" \
  --memory-swap="1g" \
  -p 3000:3000 \
  gcr.io/rendertron/rendertron
```

2. Add nginx rate limiting:
```nginx
limit_req_zone $binary_remote_addr zone=crawler:10m rate=10r/s;

location / {
    if ($prerender = 1) {
        limit_req zone=crawler burst=20;
    }
}
```

### Slow Rendering

- Increase timeout in Rendertron config
- Add more RAM to the server
- Implement aggressive caching

### Crawler Not Being Detected

Check nginx logs:

```bash
tail -f /var/log/nginx/access.log | grep -i bot
```

Verify user agent detection in nginx:

```bash
# Test manually
curl -A "facebookexternalhit/1.1" -v https://arcane.city/events/test 2>&1 | grep -i prerender
```

## Alternative: Use Prerender.io

If self-hosting is too complex, consider [Prerender.io](https://prerender.io/):

1. Sign up for an account
2. Get your API token
3. Update nginx configuration:

```nginx
if ($prerender = 1) {
    set $prerender_token "YOUR_TOKEN_HERE";
    rewrite .* /$scheme://$host$request_uri? break;
    proxy_pass https://service.prerender.io;
    proxy_set_header X-Prerender-Token $prerender_token;
}
```

## Resources

- [Rendertron GitHub](https://github.com/GoogleChrome/rendertron)
- [Google's Dynamic Rendering Guide](https://developers.google.com/search/docs/crawling-indexing/javascript/dynamic-rendering)
- [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- [Twitter Card Validator](https://cards-dev.twitter.com/validator)
