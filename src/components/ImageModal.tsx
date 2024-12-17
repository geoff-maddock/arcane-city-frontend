// src/components/ImageModal.tsx
import {
    Dialog,
    DialogContent,
    DialogTrigger,
} from "@/components/ui/dialog";
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface ImageModalProps {
    thumbnailUrl: string;
    fullImageUrl: string;
    alt: string;
}

export function ImageModal({ thumbnailUrl, fullImageUrl, alt }: ImageModalProps) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <div className="cursor-pointer overflow-hidden rounded-l-lg">
                    <AspectRatio ratio={1}>
                        <img
                            width="150"
                            height="150"
                            src={thumbnailUrl}
                            alt={alt}
                            className="max-w-xs object-cover transition-transform hover:scale-105"
                        />
                    </AspectRatio>
                </div>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
                <AspectRatio ratio={16 / 9}>
                    <img
                        src={fullImageUrl}
                        alt={alt}
                        className="h-full w-full object-contain"
                    />
                </AspectRatio>
            </DialogContent>
        </Dialog>
    );
}