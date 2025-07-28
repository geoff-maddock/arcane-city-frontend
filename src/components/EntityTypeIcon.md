# EntityTypeIcon Component

A reusable icon component that displays the appropriate icon based on entity type.

## Features

- **Dynamic Icon Selection**: Automatically selects the correct icon based on entity type name
- **Size Variants**: Supports small, medium, and large predefined sizes
- **Extensible**: Easy to add new entity types and their corresponding icons
- **Consistent Styling**: Maintains consistent flex-shrink-0 behavior and sizing

## Usage

```tsx
import { EntityTypeIcon } from './EntityTypeIcon';

// Basic usage with default medium size
<EntityTypeIcon entityTypeName="Space" />

// With custom size
<EntityTypeIcon entityTypeName="Artist" size="lg" />

// With additional CSS classes
<EntityTypeIcon 
    entityTypeName="Venue" 
    className="text-blue-600" 
    size="sm" 
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `entityTypeName` | `string` | Required | The name of the entity type (e.g., 'Space', 'Artist') |
| `className` | `string` | `''` | Additional CSS classes to apply to the icon |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Predefined size variant |

## Size Variants

| Size | CSS Classes | Use Case |
|------|-------------|----------|
| `sm` | `h-4 w-4` | Compact layouts, inline text |
| `md` | `h-5 w-5` | Standard cards, lists |
| `lg` | `h-6 w-6` | Headers, prominent displays |

## Icon Mapping

| Entity Type | Icon | Description |
|-------------|------|-------------|
| `Space` | `Warehouse` | For venues, studios, warehouses |
| All others | `Users` | Default icon for people, groups, etc. |

## Adding New Entity Types

To add support for a new entity type, update the `getIconComponent` function:

```tsx
const getIconComponent = (): LucideIcon => {
    switch (entityTypeName) {
        case 'Space':
            return Warehouse;
        case 'Artist':
            return Music; // Example: Add new entity type
        case 'Label':
            return Building; // Example: Add another type
        default:
            return Users;
    }
};
```

## Examples

```tsx
// In entity cards
<div className="flex items-center gap-2 text-gray-600">
    <EntityTypeIcon entityTypeName={entity.entity_type.name} />
    <span>{entity.entity_type.name}</span>
</div>

// In compact layouts
<EntityTypeIcon entityTypeName="Space" size="sm" className="text-gray-500" />

// In headers
<EntityTypeIcon entityTypeName="Artist" size="lg" className="text-blue-600" />
```
