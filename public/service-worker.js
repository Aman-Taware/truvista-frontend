/**
 * Truvista Service Worker
 * Handles caching for property images and essential assets
 */

// Cache names
const CACHE_NAME = 'truvista-cache-v1';
const IMAGE_CACHE_NAME = 'truvista-image-cache-v1';

// Max number of items in the image cache
const MAX_IMAGE_CACHE_ITEMS = 100;

// Resources to cache immediately during install
const PRECACHE_RESOURCES = [
  '/',
  '/index.html',
  '/src/main.jsx',
  '/src/index.css',
  // Add essential UI assets here
];

// Install event - caches essential resources
self.addEventListener('install', event => {
  // console.log('[Service Worker] Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        // console.log('[Service Worker] Pre-caching essential files');
        return cache.addAll(PRECACHE_RESOURCES);
      })
      .then(() => {
        // console.log('[Service Worker] Pre-caching complete');
        return self.skipWaiting();
      })
      .catch(error => {
        // console.error('[Service Worker] Pre-caching failed:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  // console.log('[Service Worker] Activating...');
  
  const currentCaches = [CACHE_NAME, IMAGE_CACHE_NAME];
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return cacheNames.filter(cacheName => !currentCaches.includes(cacheName));
      })
      .then(cachesToDelete => {
        return Promise.all(cachesToDelete.map(cacheToDelete => {
          // console.log('[Service Worker] Deleting old cache:', cacheToDelete);
          return caches.delete(cacheToDelete);
        }));
      })
      .then(() => self.clients.claim())
  );
});

// Helper to check if URL is an image
function isImageUrl(url) {
  // Check if the URL ends with an image extension
  return url.match(/\.(jpg|jpeg|png|gif|webp|svg|avif)(\?.*)?$/i);
}

// Helper to check if URL is a property image
function isPropertyImage(url) {
  // Customize based on your image URL patterns
  return isImageUrl(url) && 
    (url.includes('/property-images/') || 
     url.includes('/properties/') || 
     url.includes('/media/') ||
     url.includes('/images/properties/') ||
     url.includes('truvista.demo.storage'));
}

// We're keeping this helper function but no longer using the no-cors mode
// since we've now configured proper CORS headers on the S3 bucket
function isExternalUrl(url) {
  try {
    const currentOrigin = self.location.origin;
    const urlOrigin = new URL(url).origin;
    return currentOrigin !== urlOrigin;
  } catch (e) {
    // console.error('Error parsing URL:', e);
    return false;
  }
}

// Fetch handler - serve from cache or network
self.addEventListener('fetch', event => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;
  
  // For property images, use cache-first strategy
  if (isPropertyImage(event.request.url)) {
    event.respondWith(
      caches.open(IMAGE_CACHE_NAME).then(cache => {
        return cache.match(event.request).then(cachedResponse => {
          // Return cached response if available
          if (cachedResponse) {
            // console.log('[Service Worker] Serving cached image:', event.request.url);
            return cachedResponse;
          }
          
          // Otherwise fetch from network and cache
          // console.log('[Service Worker] Fetching image from network:', event.request.url);
          
          // Use no-cors mode for external URLs (like S3) until CORS is properly configured
          const fetchOptions = isExternalUrl(event.request.url) ? { mode: 'no-cors' } : {};
          
          return fetch(event.request, fetchOptions).then(networkResponse => {
            // For opaque responses (no-cors mode), we can still cache them
            const canCache = networkResponse.type === 'opaque' || 
                          (networkResponse.status === 200 && networkResponse.type === 'basic');
            
            if (!networkResponse || !canCache) {
              return networkResponse;
            }
            
            // Clone the response since it can only be used once
            const clonedResponse = networkResponse.clone();
            
            // Cache the fresh response
            cache.put(event.request, clonedResponse).catch(error => {
              // console.error('[Service Worker] Error caching image:', error);
            });
            
            // Optionally trim the cache if it gets too large
            trimCache(IMAGE_CACHE_NAME, MAX_IMAGE_CACHE_ITEMS);
            
            return networkResponse;
          }).catch(error => {
            // console.error('[Service Worker] Fetch error:', error);
            // Could return a fallback image here
          });
        });
      })
    );
  } else {
    // For non-image requests, use network-first strategy
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          return caches.match(event.request);
        })
    );
  }
});

// Helper function to preload and cache images
function cacheImages(imageUrls) {
  if (!imageUrls || !Array.isArray(imageUrls) || imageUrls.length === 0) {
    // console.log('[Service Worker] No image URLs to cache');
    return;
  }
  
  // console.log('[Service Worker] Caching images:', imageUrls.length);
  
  caches.open(IMAGE_CACHE_NAME).then(cache => {
    const cachePromises = imageUrls.map(url => {
      // Only cache valid image URLs
      if (!url || typeof url !== 'string') return Promise.resolve();
      
      // Check if already cached
      return cache.match(url).then(cachedResponse => {
        if (cachedResponse) {
          // console.log('[Service Worker] Image already cached:', url);
          return Promise.resolve();
        }
        
        // Use no-cors mode for external URLs until CORS is properly configured
        const fetchOptions = isExternalUrl(url) ? { mode: 'no-cors' } : {};
        
        // Fetch and cache the image
        return fetch(url, fetchOptions)
          .then(response => {
            // For opaque responses (no-cors mode), we can still cache them
            const canCache = response.type === 'opaque' || 
                          (response.status === 200 && response.type === 'basic');
            
            if (!response || !canCache) {
              return;
            }
            
            // Cache the response
            return cache.put(url, response);
          })
          .catch(error => {
            // console.error('[Service Worker] Error caching image:', url, error);
          });
      });
    });
    
    return Promise.all(cachePromises).then(() => {
      // console.log('[Service Worker] Batch caching complete');
      trimCache(IMAGE_CACHE_NAME, MAX_IMAGE_CACHE_ITEMS);
    });
  });
}

// Function to clear image cache
function clearImageCache() {
  return caches.delete(IMAGE_CACHE_NAME)
    .then(() => {
      // Create a fresh empty cache
      return caches.open(IMAGE_CACHE_NAME);
    })
    .then(() => {
      // console.log('[Service Worker] Image cache cleared');
      return true;
    })
    .catch(error => {
      // console.error('[Service Worker] Failed to clear image cache:', error);
      return false;
    });
}

// Function to trim cache to a maximum number of items
async function trimCache(cacheName, maxItems) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  
  if (keys.length <= maxItems) {
    return;
  }
  
  // Remove oldest items (we'll use the order of keys which should represent cache insertion order)
  const itemsToDelete = keys.length - maxItems;
  for (let i = 0; i < itemsToDelete; i++) {
    await cache.delete(keys[i]);
  }
  
  // console.log(`[Service Worker] Trimmed ${itemsToDelete} items from ${cacheName}`);
}

// Listen for messages from the main thread
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'CACHE_IMAGES') {
    cacheImages(event.data.imageUrls);
  } 
  else if (event.data && event.data.type === 'CLEAR_IMAGE_CACHE') {
    clearImageCache()
      .then(success => {
        // If a message port was provided, send back the result
        if (event.ports && event.ports[0]) {
          event.ports[0].postMessage({ success });
        }
      });
  }
});

// console.log('[Service Worker] Service worker registered successfully'); 