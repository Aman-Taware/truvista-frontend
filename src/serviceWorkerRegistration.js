/**
 * Service Worker Registration
 * Handles registration and management of the service worker for image caching
 */

// Register the service worker
export function register() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      const swUrl = `${window.location.origin}/service-worker.js`;
      
      // Remove any existing service workers first to ensure clean update
      unregister().then(() => {
        navigator.serviceWorker.register(swUrl)
          .then(registration => {
            console.log('ServiceWorker registration successful with scope: ', registration.scope);
            
            registration.addEventListener('updatefound', () => {
              const installingWorker = registration.installing;
              if (installingWorker) {
                installingWorker.onstatechange = () => {
                  if (installingWorker.state === 'installed') {
                    if (navigator.serviceWorker.controller) {
                      console.log('ServiceWorker: New content is available; please refresh.');
                    } else {
                      console.log('ServiceWorker: Content is cached for offline use.');
                    }
                  }
                };
              }
            });
          })
          .catch(error => {
            console.error('ServiceWorker registration failed: ', error);
          });
      });
    });
  } else {
    console.log('Service workers are not supported in this browser');
  }
}

// Unregister the service worker (if needed)
export function unregister() {
  if ('serviceWorker' in navigator) {
    return navigator.serviceWorker.getRegistrations()
      .then(registrations => {
        for (let registration of registrations) {
          registration.unregister();
        }
        return true;
      })
      .catch(error => {
        console.error('Error unregistering service worker:', error);
        return false;
      });
  }
  return Promise.resolve(false);
} 