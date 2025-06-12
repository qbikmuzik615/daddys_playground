import { useState, useEffect, useCallback } from 'react';

// Global image cache to store preloaded images
const imageCache: Record<string, boolean> = {};

/**
 * Custom hook to preload and cache images
 */
export function useImagePreloader() {
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);

  // Preload a single image
  const preloadImage = useCallback((url: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      // If already cached, resolve immediately
      if (imageCache[url]) {
        resolve();
        return;
      }

      // Create new image element
      const img = new Image();

      img.onload = () => {
        imageCache[url] = true;
        setLoadedImages(prev => ({ ...prev, [url]: true }));
        resolve();
      };

      img.onerror = () => {
        setFailedImages(prev => ({ ...prev, [url]: true }));
        reject(new Error(`Failed to load image: ${url}`));
      };

      // Set a timeout of 10 seconds
      const timeoutId = setTimeout(() => {
        reject(new Error(`Image load timeout: ${url}`));
      }, 10000);

      // Start loading
      img.src = url;

      // Clear timeout on success or error
      img.onload = () => {
        clearTimeout(timeoutId);
        imageCache[url] = true;
        setLoadedImages(prev => ({ ...prev, [url]: true }));
        resolve();
      };

      img.onerror = () => {
        clearTimeout(timeoutId);
        setFailedImages(prev => ({ ...prev, [url]: true }));
        reject(new Error(`Failed to load image: ${url}`));
      };
    });
  }, []);

  // Preload multiple images
  const preloadImages = useCallback(async (urls: string[]) => {
    setLoading(true);

    try {
      // Preload images sequentially to avoid network congestion
      for (const url of urls) {
        // Skip already loaded or failed images
        if (imageCache[url] || failedImages[url]) continue;

        await preloadImage(url).catch(err => {
          console.error('Image preload error:', err);
        });
      }
    } finally {
      setLoading(false);
    }
  }, [preloadImage, failedImages]);

  // Check if an image is already loaded
  const isImageLoaded = useCallback((url: string) => {
    return !!imageCache[url] || !!loadedImages[url];
  }, [loadedImages]);

  return {
    preloadImage,
    preloadImages,
    isImageLoaded,
    imageCache,
    loadedImages,
    failedImages,
    loading
  };
}
