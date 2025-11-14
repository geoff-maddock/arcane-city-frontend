import { useState } from 'react';
import { Share2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ShareButtonProps {
    className?: string;
}

export function ShareButton({ className }: ShareButtonProps) {
    const [copied, setCopied] = useState(false);

    const handleShare = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy URL:', err);
        }
    };

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            className={className}
            aria-label="Share this page"
            title="Copy link to share this filtered view"
        >
            {copied ? (
                <>
                    <Check className="h-4 w-4 mr-2" />
                    Copied!
                </>
            ) : (
                <>
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                </>
            )}
        </Button>
    );
}
