/**
 * Utility functions for working with the image cache
 * Uses the service worker to cache and retrieve property images
 */

// Check if browser supports service workers
const isServiceWorkerSupported = () => {
  return 'serviceWorker' in navigator;
};

/**
 * Get the service worker registration if available
 * @returns {Promise<ServiceWorkerRegistration|null>}
 */
const getServiceWorkerRegistration = async () => {
  if (!isServiceWorkerSupported()) {
    return null;
  }
  
  try {
    return await navigator.serviceWorker.ready;
  } catch (error) {
    // console.error('Error getting service worker registration:', error);
    return null;
  }
};

/**
 * Check if an image URL is already cached
 * @param {string} imageUrl - The URL of the image to check
 * @returns {Promise<boolean>} - Whether the image is cached
 */
export const isImageCached = async (imageUrl) => {
  if (!isServiceWorkerSupported() || !imageUrl) {
    return false;
  }
  
  try {
    const cache = await caches.open('truvista-image-cache-v1');
    const cachedResponse = await cache.match(imageUrl);
    return !!cachedResponse;
  } catch (error) {
    // console.error('Error checking if image is cached:', error);
    return false;
  }
};

/**
 * Load an image from cache or network
 * @param {string} imageUrl - The URL of the image to load
 * @param {boolean} preloadOnly - If true, just ensure the image is cached without returning it
 * @returns {Promise<string|null>} - The image URL when ready to use
 */
export const loadCachedImage = (imageUrl, preloadOnly = false) => {
  if (!imageUrl) return Promise.resolve(null);
  
  // For browsers without service worker support, just return the URL
  if (!isServiceWorkerSupported()) {
    return Promise.resolve(imageUrl);
  }
  
  return new Promise((resolve) => {
    // Check if image is in cache first
    isImageCached(imageUrl).then(isCached => {
      if (isCached) {
        // Image is already cached
        // console.log('Image already cached:', imageUrl);
        resolve(preloadOnly ? null : imageUrl);
      } else {
        // Image not cached, fetch it via the service worker
        if (preloadOnly) {
          // Just trigger caching, don't wait
          // Check if it's an external URL
          const isExternal = isExternalUrl(imageUrl);
          const fetchOptions = isExternal ? { mode: 'no-cors' } : {};
          
          fetch(imageUrl, fetchOptions).catch(err => {/* console.error('Error preloading image:', err) */});
          resolve(null);
        } else {
          // Wait for the image to be fetched
          // Check if it's an external URL
          const isExternal = isExternalUrl(imageUrl);
          const fetchOptions = isExternal ? { mode: 'no-cors' } : {};
          
          fetch(imageUrl, fetchOptions)
            .then(() => {
              // console.log('Image loaded into cache:', imageUrl);
              resolve(imageUrl);
            })
            .catch(error => {
              // console.error('Error loading image:', error);
              // Still return the URL so it can be used as fallback
              resolve(imageUrl);
            });
        }
      }
    });
  });
};

// Check if URL is from external domain (like S3)
const isExternalUrl = (url) => {
  try {
    const currentOrigin = window.location.origin;
    const urlOrigin = new URL(url).origin;
    return currentOrigin !== urlOrigin;
  } catch (e) {
    // console.error('Error parsing URL:', e);
    return false;
  }
};

/**
 * Preload multiple images into the cache
 * @param {string[]} imageUrls - Array of image URLs to preload
 */
export const preloadImages = async (imageUrls) => {
  if (!isServiceWorkerSupported() || !imageUrls || !Array.isArray(imageUrls) || imageUrls.length === 0) {
    return;
  }
  
  try {
    const registration = await getServiceWorkerRegistration();
    
    if (registration && registration.active) {
      // Send message to service worker to cache images
      registration.active.postMessage({
        type: 'CACHE_IMAGES',
        imageUrls
      });
      
      // console.log(`Requested caching of ${imageUrls.length} images`);
    } else {
      // If service worker not active, fetch images directly
      // console.log('Service worker not active, fetching images directly');
      
      // Fetch each image to trigger caching via fetch handler
      imageUrls.forEach(url => {
        loadCachedImage(url, true).catch(err => {
          // console.error('Error preloading image:', err);
        });
      });
    }
  } catch (error) {
    // console.error('Error preloading images:', error);
  }
};

/**
 * Clear the entire image cache
 * @returns {Promise<boolean>} - Success or failure
 */
export const clearImageCache = async () => {
  if (!isServiceWorkerSupported()) {
    return false;
  }
  
  try {
    const registration = await getServiceWorkerRegistration();
    
    if (registration && registration.active) {
      // Ask service worker to clear cache
      return new Promise(resolve => {
        // Create a message channel for the response
        const messageChannel = new MessageChannel();
        messageChannel.port1.onmessage = event => {
          resolve(event.data.success);
        };
        
        // Send message to service worker
        registration.active.postMessage(
          { type: 'CLEAR_IMAGE_CACHE' },
          [messageChannel.port2]
        );
      });
    } else {
      // Try to clear cache directly
      const cache = await caches.open('truvista-image-cache-v1');
      await cache.keys().then(keys => {
        return Promise.all(keys.map(key => cache.delete(key)));
      });
      
      // console.log('Cleared image cache directly');
      return true;
    }
  } catch (error) {
    // console.error('Error clearing image cache:', error);
    return false;
  }
};

/**
 * Get cache statistics
 * @returns {Promise<{count: number, size: number}>} - Number of cached images and total size
 */
export const getCacheStats = async () => {
  if (!isServiceWorkerSupported()) {
    return { count: 0, size: 0 };
  }
  
  try {
    const cache = await caches.open('truvista-image-cache-v1');
    const keys = await cache.keys();
    let totalSize = 0;
    
    // Calculate size if available
    for (const request of keys) {
      const response = await cache.match(request);
      if (response && response.clone) {
        const blob = await response.clone().blob();
        totalSize += blob.size;
      }
    }
    
    return {
      count: keys.length,
      size: totalSize
    };
  } catch (error) {
    // console.error('Error getting cache stats:', error);
    return { count: 0, size: 0 };
  }
}; 