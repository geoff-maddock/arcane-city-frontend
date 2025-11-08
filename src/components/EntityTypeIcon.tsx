import { Users, Warehouse, LucideIcon } from 'lucide-react';

interface EntityTypeIconProps {
    entityTypeName: string;
    className?: string;
    size?: 'sm' | 'md' | 'lg';
}

/**
 * EntityTypeIcon component that displays the appropriate icon based on entity type
 * 
 * @param entityTypeName - The name of the entity type (e.g., 'Space', 'Artist', etc.)
 * @param className - Additional CSS classes to apply to the icon
 * @param size - Predefined size variants (sm: h-4 w-4, md: h-5 w-5, lg: h-6 w-6)
 */
export const EntityTypeIcon = ({
    entityTypeName,
    className = '',
    size = 'md'
}: EntityTypeIconProps) => {
    // Map entity types to their appropriate icons
    const getIconComponent = (): LucideIcon => {
        switch (entityTypeName) {
            case 'Space':
                return Warehouse;
            default:
                return Users;
        }
    };

    // Map size variants to CSS classes
    const getSizeClasses = (): string => {
        switch (size) {
            case 'sm':
                return 'h-4 w-4';
            case 'md':
                return 'h-5 w-5';
            case 'lg':
                return 'h-6 w-6';
            default:
                return 'h-5 w-5';
        }
    };

    const IconComponent = getIconComponent();
    const sizeClasses = getSizeClasses();
    const combinedClassName = `${sizeClasses} flex-shrink-0 ${className}`.trim();

    return <IconComponent className={combinedClassName} />;
};

export default EntityTypeIcon;
