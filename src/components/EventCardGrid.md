# EventCardGrid Component

A highly compact event card component designed for grid layouts.

## Features

- **Ultra Compact**: Smaller than EventCardCondensed, perfect for grid displays
- **Image Overlay**: Shows event image with price badge and attend button overlays
- **Essential Information**: Displays only the most important event details
- **Responsive**: Works well in grid layouts across different screen sizes
- **Interactive**: Supports attending/unattending events and tag filtering

## Usage

```tsx
import EventCardGrid from './components/EventCardGrid';
import EventGrid from './components/EventGrid';

// Single card usage
<EventCardGrid
    event={event}
    allImages={allImages}
    imageIndex={0}
/>

// Grid layout usage
<EventGrid 
    events={events} 
    allImages={allImages} 
/>
```

## Layout

The EventCardGrid displays:

1. **Image Section** (aspect ratio 4:3)
   - Event thumbnail image
   - Attend/unattend button (top right overlay)
   - Price badge (bottom left overlay, if price available)

2. **Content Section**
   - Event title (2 lines max)
   - Date with calendar icon
   - Venue with location icon  
   - Event type badge
   - Up to 2 tags with "+N" indicator for additional tags

## Differences from EventCardCondensed

| Feature | EventCardCondensed | EventCardGrid |
|---------|-------------------|---------------|
| Layout | Horizontal (image + content side by side) | Vertical (image above content) |
| Size | Medium compact | Ultra compact |
| Image | 1/3 width | Full width with overlays |
| Description | Shows short description | No description |
| Entities | Shows entity badges | Hidden |
| Tags | Shows all tags | Shows max 2 tags + count |
| Age restriction | Dedicated component | Hidden |
| Pricing | Inline with icons | Overlay badge |
| Use case | List views | Grid views |

## Responsive Grid Layout

The EventGrid component provides a responsive grid:
- Mobile: 1 column
- Small screens: 2 columns  
- Large screens: 3 columns
- Extra large: 4 columns

## Styling

The component uses Tailwind CSS with:
- Hover effects (shadow, scale)
- Smooth transitions
- Color-coded elements (price badge, tags)
- Proper spacing and typography hierarchy
