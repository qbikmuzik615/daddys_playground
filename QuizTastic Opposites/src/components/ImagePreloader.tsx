import { useState, useEffect } from 'react';

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
  const [loadedUrls, setLoadedUrls] = useState<Record<string, boolean>>({});
  
  useEffect(() => {
    let mounted = true;
    const newLoadedUrls: Record<string, boolean> = {};
    
    // Process each URL asynchronously
    urls.forEach(url => {
      // Skip already cached images
      if (imageCache[url]) {
        newLoadedUrls[url] = true;
        if (onLoad) onLoad(url);
        return;
      }
      
      // Create a new image element
      const img = new Image();
      
      img.onload = () => {
        if (!mounted) return;
        
        // Mark as loaded in cache and state
        imageCache[url] = true;
        setLoadedUrls(prev => ({ ...prev, [url]: true }));
        if (onLoad) onLoad(url);
      };
      
      img.onerror = (e) => {
        if (!mounted) return;
        if (onError) onError(url, e as any as Error);
      };
      
      // Start loading
      img.src = url;
    });
    
    if (Object.keys(newLoadedUrls).length > 0) {
      setLoadedUrls(newLoadedUrls);
    }
    
    return () => {
      mounted = false;
    };
  }, [urls, onLoad, onError]);
  
  // This component doesn't render anything
  return null;
};

export default ImagePreloader;
