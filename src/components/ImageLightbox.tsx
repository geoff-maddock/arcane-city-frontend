// src/components/ImageLightbox.tsx
import { useState } from 'react';
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface ImageLightboxProps {
    thumbnailUrl: string;
    fullImageUrl: string;
    alt: string;
}

export function ImageLightbox({ thumbnailUrl, fullImageUrl, alt }: ImageLightboxProps) {
    const [open, setOpen] = useState(false);

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
                slides={[{ src: fullImageUrl, alt }]}
                render={{
                    buttonPrev: () => null,  // Hide prev button since we only have one image
                    buttonNext: () => null,  // Hide next button since we only have one image
                }}
                carousel={{ finite: true }}
                animation={{ fade: 0 }}
                controller={{ closeOnBackdropClick: true }}
                styles={{
                    container: { backgroundColor: "rgba(0, 0, 0, .9)" },
                }}
            />
        </>
    );
}