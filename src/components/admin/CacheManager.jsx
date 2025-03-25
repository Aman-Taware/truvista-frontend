import React, { useState, useEffect } from 'react';
import { clearImageCache, getCacheStats } from '../../utils/imageCache';

/**
 * CacheManager Component
 * Provides an admin interface for viewing and managing the image cache
 * Can be included in admin panels to give control over caching
 */
const CacheManager = () => {
  const [cacheStats, setCacheStats] = useState({ count: 0, size: 0 });
  const [isClearing, setIsClearing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Format bytes to a human-readable format
  const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  // Load cache stats
  const loadStats = async () => {
    const stats = await getCacheStats();
    setCacheStats(stats);
    setLastUpdated(new Date());
  };

  // Clear the cache
  const handleClearCache = async () => {
    setIsClearing(true);
    try {
      await clearImageCache();
      await loadStats();
    } catch (error) {
      console.error('Error clearing cache:', error);
    } finally {
      setIsClearing(false);
    }
  };

  // Load stats on initial render
  useEffect(() => {
    loadStats();
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-elegant p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-display font-semibold text-primary-800">
          Image Cache Manager
        </h3>
        <button
          onClick={loadStats}
          className="flex items-center text-sm text-primary-600 hover:text-primary-800"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-primary-50 rounded-lg p-4">
          <p className="text-sm text-neutral-600 mb-1">Cached Images</p>
          <p className="text-2xl font-bold text-primary-700">{cacheStats.count}</p>
        </div>
        <div className="bg-primary-50 rounded-lg p-4">
          <p className="text-sm text-neutral-600 mb-1">Total Size</p>
          <p className="text-2xl font-bold text-primary-700">{formatBytes(cacheStats.size)}</p>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            onClick={handleClearCache}
            disabled={isClearing || cacheStats.count === 0}
            className={`px-4 py-2 rounded-md font-medium text-white ${
              isClearing || cacheStats.count === 0 
                ? 'bg-neutral-400 cursor-not-allowed' 
                : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {isClearing ? 'Clearing...' : 'Clear Cache'}
          </button>
          <p className="mt-2 text-xs text-neutral-500">
            Last updated: {lastUpdated ? lastUpdated.toLocaleTimeString() : 'Never'}
          </p>
        </div>
        <div className="text-sm text-neutral-600">
          <p>
            Clearing the cache will remove all cached images.
            <br />
            Images will be re-downloaded when viewed again.
          </p>
        </div>
      </div>
      
      {/* Developer info section - Can be removed in production */}
      <div className="mt-6 pt-4 border-t border-neutral-200">
        <details>
          <summary className="text-sm text-neutral-600 cursor-pointer">Developer Information</summary>
          <div className="mt-2 p-4 bg-neutral-50 rounded-md text-xs text-neutral-700 font-mono">
            <p>Caching System: Service Worker + Cache API</p>
            <p>Cache Name: truvista-image-cache-v1</p>
            <p>Max Cache Items: 100</p>
            <p>Cache Strategy: Cache-First for Images</p>
          </div>
        </details>
      </div>
    </div>
  );
};

export default CacheManager; 