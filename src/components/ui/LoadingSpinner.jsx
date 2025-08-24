import React from 'react';
import { motion } from 'framer-motion';

/**
 * LoadingSpinner Component
 * Animated loading indicator with size and color variants
 * 
 * @param {Object} props
 * @param {string} props.size - Size variant: 'sm', 'md', 'lg', 'xl'
 * @param {string} props.color - Color variant: 'primary', 'secondary', 'white'
 * @param {string} props.className - Additional classes
 */
const LoadingSpinner = ({ size = 'md', color = 'primary', className = '' }) => {
  // Animation settings
  const spinTransition = {
    repeat: Infinity,
    ease: "linear",
    duration: 1
  };

  // Size classes
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  // Color classes
  const colorClasses = {
    primary: 'border-primary-500',
    secondary: 'border-secondary-500',
    white: 'border-white'
  };

  return (
    <div className={`flex justify-center items-center ${className}`}>
      <motion.div
        className={`${sizeClasses[size]} border-2 ${colorClasses[color]} border-t-transparent rounded-full`}
        animate={{ rotate: 360 }}
        transition={spinTransition}
      />
    </div>
  );
};

export default LoadingSpinner; 