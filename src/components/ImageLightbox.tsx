// src/components/ImageLightbox.tsx
import { useState, useEffect } from 'react';
import Lightbox from "yet-another-react-lightbox";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface ImageLightboxProps {
    thumbnailUrl: string;
    alt: string;
    allImages: Array<{ src: string; alt: string; thumbnail?: string }>;
    initialIndex: number;
}

export function ImageLightbox({ thumbnailUrl, alt, allImages, initialIndex }: ImageLightboxProps) {
    const [open, setOpen] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(initialIndex);

    // Handle wheel event
    const handleWheel = (event: WheelEvent) => {
        event.preventDefault();

        if (event.deltaY > 0) {
            // Next image
            setCurrentIndex(prev =>
                prev < allImages.length - 1 ? prev + 1 : prev
            );
        } else {
            // Previous image
            setCurrentIndex(prev =>
                prev > 0 ? prev - 1 : prev
            );
        }
    };

    // Add wheel event listener when lightbox is open
    useEffect(() => {
        if (open) {
            document.addEventListener('wheel', handleWheel, { passive: false });
        }

        return () => {
            document.removeEventListener('wheel', handleWheel);
        };
    }, [open]);

    return (
        <>
            <div
                onClick={() => setOpen(true)}
                className="cursor-pointer overflow-hidden rounded-l-lg"
            >
                <AspectRatio ratio={1}>
                    <img
                        src={thumbnailUrl}
                        alt={alt}
                        className="h-full w-full object-cover transition-transform hover:scale-105"
                    />
                </AspectRatio>
            </div>

            <Lightbox
                open={open}
                close={() => setOpen(false)}
                index={currentIndex}
                slides={allImages}
                plugins={[Thumbnails]}
                on={{
                    view: ({ index }) => setCurrentIndex(index),
                }}
                carousel={{ finite: true }}
                animation={{ fade: 0 }}
                controller={{ closeOnBackdropClick: true }}
                thumbnails={{
                    position: "bottom",
                    width: 120,
                    height: 80,
                    border: 2,
                    borderRadius: 4,
                    padding: 4,
                    gap: 16,
                }}
                styles={{
                    container: { backgroundColor: "rgba(0, 0, 0, .9)" },
                    thumbnailsContainer: { backgroundColor: "rgba(0, 0, 0, .9)" },
                    thumbnail: {
                        border: "2px solid transparent",
                        borderRadius: 4,
                        transition: "border-color 0.3s ease",
                    },
                    thumbnailsTrack: { padding: "12px 0" },
                }}
            />
        </>
    );
}