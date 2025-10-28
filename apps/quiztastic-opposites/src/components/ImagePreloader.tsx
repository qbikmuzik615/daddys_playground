import { useEffect } from 'react';

interface ImagePreloaderProps {
  urls: string[];
  onLoad?: (url: string) => void;
  onError?: (url: string, error: Error) => void;
}

// Global image cache to store loaded images across component instances
const imageCache: Record<string, boolean> = {};

const ImagePreloader: React.FC<ImagePreloaderProps> = ({
  urls,
  onLoad,
  onError
}) => {
  useEffect(() => {
    let mounted = true;

    // Process each URL asynchronously
    urls.forEach(url => {
      // Skip already cached images
      if (imageCache[url]) {
        if (onLoad) onLoad(url);
        return;
      }

      // Create a new image element
      const img = new Image();

      img.onload = () => {
        if (!mounted) return;

        // Mark as loaded in cache
        imageCache[url] = true;
        if (onLoad) onLoad(url);
      };

      img.onerror = (e) => {
        if (!mounted) return;
        if (onError) onError(url, e as any as Error);
      };

      // Start loading
      img.src = url;
    });

    return () => {
      mounted = false;
    };
  }, [urls, onLoad, onError]);
  
  // This component doesn't render anything
  return null;
};

export default ImagePreloader;
