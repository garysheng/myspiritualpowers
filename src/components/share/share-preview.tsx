import { useEffect, useState } from 'react';
import { getCachedImage } from '@/lib/image-cache';
import Image from 'next/image';

interface SharePreviewProps {
  userId: string;
  dimension: 'square' | 'tall';
  displayName: string;
}

export function SharePreview({ 
  userId, 
  dimension,
  displayName,
}: SharePreviewProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    const loadCachedImage = async () => {
      try {
        const cached = await getCachedImage(userId, dimension);
        if (cached) {
          setImageUrl(cached.url);
        }
      } catch (error) {
        console.error('Error loading cached image:', error);
      }
    };

    loadCachedImage();
  }, [userId, dimension]);

  if (!imageUrl) {
    return (
      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
        Loading preview...
      </div>
    );
  }

  return (
    <Image 
      src={imageUrl} 
      alt={`${displayName}'s spiritual gifts - ${dimension} format`}
      className="w-full h-full object-cover"
      width={1080}
      height={dimension === 'square' ? 1080 : 1920}
      priority
    />
  );
} 