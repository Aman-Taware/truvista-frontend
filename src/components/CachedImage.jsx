import React, { useState, useEffect } from 'react';
import { loadCachedImage } from '../utils/imageCache';
import PropTypes from 'prop-types';

/**
 * Component for displaying images with caching support
 * This component will load images from cache when available
 * and fallback to regular loading when necessary
 */
const CachedImage = ({
  src,
  alt,
  className,
  width,
  height,
  onLoad,
  onError,
  fallbackSrc,
  ...props
}) => {
  const [imageSrc, setImageSrc] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setHasError(false);
    
    if (!src) {
      setIsLoading(false);
      setHasError(true);
      return;
    }

    // First try direct image loading to handle CORS issues gracefully
    const img = new Image();
    img.onload = () => {
      if (isMounted) {
        setImageSrc(src);
        setIsLoading(false);
      }
    };
    img.onerror = () => {
      if (isMounted) {
        // If direct loading fails, try via service worker with caching
        loadCachedImage(src)
          .then(cachedSrc => {
            if (isMounted && cachedSrc) {
              setImageSrc(cachedSrc);
              setIsLoading(false);
            }
          })
          .catch(() => {
            if (isMounted) {
              // If both approaches fail, use fallback
              setHasError(true);
              setIsLoading(false);
              if (fallbackSrc) {
                setImageSrc(fallbackSrc);
              }
            }
          });
      }
    };
    img.src = src;

    return () => {
      isMounted = false;
    };
  }, [src, fallbackSrc]);

  const handleLoad = (event) => {
    setIsLoading(false);
    if (onLoad) onLoad(event);
  };

  const handleError = (event) => {
    setIsLoading(false);
    setHasError(true);
    if (fallbackSrc && imageSrc !== fallbackSrc) {
      setImageSrc(fallbackSrc);
    }
    if (onError) onError(event);
  };

  // Show fallback or skeleton loader while loading
  if (isLoading) {
    return (
      <div 
        className={`bg-gray-200 animate-pulse ${className || ''}`} 
        style={{ width: width || '100%', height: height || '100%' }}
        {...props}
      />
    );
  }

  // Show fallback for error state if no valid image
  if (hasError && !imageSrc) {
    return (
      <div 
        className={`bg-gray-300 flex items-center justify-center ${className || ''}`} 
        style={{ width: width || '100%', height: height || '100%' }}
        {...props}
      >
        {/* Fallback content or icon */}
        <svg 
          className="w-12 h-12 text-gray-400" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="2" 
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
    );
  }

  // Render the image
  return (
    <img
      src={imageSrc}
      alt={alt}
      className={className}
      width={width}
      height={height}
      onLoad={handleLoad}
      onError={handleError}
      {...props}
    />
  );
};

CachedImage.propTypes = {
  src: PropTypes.string,
  alt: PropTypes.string.isRequired,
  className: PropTypes.string,
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onLoad: PropTypes.func,
  onError: PropTypes.func,
  fallbackSrc: PropTypes.string,
};

CachedImage.defaultProps = {
  alt: 'Image',
  fallbackSrc: '',
};

export default CachedImage; 