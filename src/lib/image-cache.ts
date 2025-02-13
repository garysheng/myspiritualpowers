import { storage } from '@/lib/firebase';
import { ref, uploadString, getDownloadURL, getMetadata } from 'firebase/storage';

export interface CachedImage {
  url: string;
  timestamp: number;
  dimension: 'square' | 'tall';
}

const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export async function getCachedImage(userId: string, dimension: 'square' | 'tall'): Promise<CachedImage | null> {
  try {
    const imageRef = ref(storage, `share_images/${userId}/${dimension}.png`);
    
    try {
      // Check if image exists and get its metadata
      const metadata = await getMetadata(imageRef);
      const timestamp = metadata.timeCreated ? new Date(metadata.timeCreated).getTime() : 0;
      
      // Check if cache has expired
      if (Date.now() - timestamp > CACHE_DURATION) {
        return null;
      }

      // Get download URL with CORS headers
      const url = await getDownloadURL(imageRef);
      
      // Create a CORS-friendly URL using images.weserv.nl
      const corsUrl = `https://images.weserv.nl/?url=${encodeURIComponent(url)}&n=-1`;
      
      return {
        url: corsUrl,
        timestamp,
        dimension,
      };
    } catch {
      // If file doesn't exist or other error
      return null;
    }
  } catch (error) {
    console.error('Error getting cached image:', error);
    return null;
  }
}

export async function setCachedImage(userId: string, image: { dataUrl: string; dimension: 'square' | 'tall'; timestamp: number }): Promise<void> {
  try {
    const imageRef = ref(storage, `share_images/${userId}/${image.dimension}.png`);
    
    // Remove the data URL prefix to get just the base64 data
    const base64Data = image.dataUrl.split(',')[1];
    
    // Upload the image
    await uploadString(imageRef, base64Data, 'base64', {
      contentType: 'image/png',
      customMetadata: {
        timestamp: image.timestamp.toString(),
      },
    });
  } catch (error) {
    console.error('Error setting cached image:', error);
  }
} 