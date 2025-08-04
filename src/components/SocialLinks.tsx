import { Facebook, Instagram, Twitter } from 'lucide-react';

interface SocialLinksProps {
    facebookUsername?: string;
    twitterUsername?: string;
    instagramUsername?: string;
    className?: string;
}

export const SocialLinks = ({ facebookUsername, twitterUsername, instagramUsername, className = "" }: SocialLinksProps) => {
    if (!facebookUsername && !twitterUsername && !instagramUsername) {
        return null;
    }

    return (
        <div className={`flex items-center gap-3 ${className}`}>
            {facebookUsername && (
                <a
                    href={`https://facebook.com/${facebookUsername}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-blue-600 transition-colors"
                    title={`View on Facebook: ${facebookUsername}`}
                    aria-label={`View ${facebookUsername} on Facebook`}
                >
                    <Facebook className="h-5 w-5" />
                </a>
            )}
            {twitterUsername && (
                <a
                    href={`https://twitter.com/${twitterUsername}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-blue-400 transition-colors"
                    title={`View on Twitter: ${twitterUsername}`}
                    aria-label={`View ${twitterUsername} on Twitter`}
                >
                    <Twitter className="h-5 w-5" />
                </a>
            )}
            {instagramUsername && (
                <a
                    href={`https://instagram.com/${instagramUsername}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-pink-600 transition-colors"
                    title={`View on Instagram: ${instagramUsername}`}
                    aria-label={`View ${instagramUsername} on Instagram`}
                >
                    <Instagram className="h-5 w-5" />
                </a>
            )}
        </div>
    );
};
