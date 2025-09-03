// HTML sanitization helpers using DOMPurify to mitigate XSS when rendering
// server-provided rich text (descriptions) and embed fragments (audio/media).
// Policy: allow basic HTML plus iframes only from trusted media providers.
import DOMPurify from 'dompurify';

const TRUSTED_IFRAME_SRC_PATTERNS: RegExp[] = [
    /^(https?:)?\/\/www\.youtube\.com\//i,
    /^(https?:)?\/\/player\.soundcloud\.com\//i,
    /^(https?:)?\/\/w\.soundcloud\.com\//i,
    /^(https?:)?\/\/bandcamp\.com\//i,
    /^(https?:)?\/\/player\.mixcloud\.com\//i,
    /^(https?:)?\/\/open\.spotify\.com\//i,
];

function postProcess(clean: string): string {
    if (typeof window === 'undefined' || !clean) return clean; // SSR/defensive
    const container = document.createElement('div');
    container.innerHTML = clean;
    const iframes = Array.from(container.getElementsByTagName('iframe'));
    for (const frame of iframes) {
        const src = frame.getAttribute('src') || '';
        const trusted = TRUSTED_IFRAME_SRC_PATTERNS.some((re) => re.test(src));
        if (!trusted) {
            frame.remove();
            continue;
        }
        frame.removeAttribute('srcdoc');
        frame.removeAttribute('onload');
        frame.removeAttribute('onerror');
        frame.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-popups');
        
        // Add special attributes for SoundCloud iframes
        if (/player\.soundcloud\.com|w\.soundcloud\.com/i.test(src)) {
            frame.setAttribute('allowfullscreen', '');
            frame.setAttribute('seamless', '');
        }
    }
    return container.innerHTML;
}

export function sanitizeHTML(dirty: string): string {
    if (!dirty) return '';
    const clean = DOMPurify.sanitize(dirty, {
        USE_PROFILES: { html: true },
        ADD_TAGS: ['iframe'],
        ADD_ATTR: ['allow', 'allowfullscreen', 'seamless', 'frameborder', 'scrolling'],
    }) as string;
    return postProcess(clean);
}

export function sanitizeEmbed(dirty: string): string {
    return sanitizeHTML(dirty);
}
