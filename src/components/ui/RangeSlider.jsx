import React, { useState, useEffect, useRef } from 'react';

/**
 * Range Slider Component
 * 
 * @param {Object} props
 * @param {number} props.min - Minimum value
 * @param {number} props.max - Maximum value
 * @param {number} props.step - Step increment
 * @param {Array} props.value - Current range values [min, max]
 * @param {Function} props.onChange - Change handler function
 * @param {string} props.className - Additional classes
 */
const RangeSlider = ({ 
  min = 0, 
  max = 100, 
  step = 1, 
  value = [25, 75], 
  onChange,
  className = '' 
}) => {
  const [localValue, setLocalValue] = useState(value);
  const [isDragging, setIsDragging] = useState(null); // null, 'min', 'max'
  const trackRef = useRef(null);
  
  // Sync with external value
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Calculate percentage for UI positioning
  const getPercent = (value) => {
    return Math.round(((value - min) / (max - min)) * 100);
  };

  const minPercent = getPercent(localValue[0]);
  const maxPercent = getPercent(localValue[1]);

  // Handle track click
  const handleTrackClick = (e) => {
    if (!trackRef.current) return;
    
    const rect = trackRef.current.getBoundingClientRect();
    const percent = ((e.clientX - rect.left) / rect.width) * 100;
    const newValue = Math.round(((max - min) * percent) / 100) + min;
    
    // Determine which thumb to move based on proximity
    const distToMin = Math.abs(newValue - localValue[0]);
    const distToMax = Math.abs(newValue - localValue[1]);
    
    if (distToMin <= distToMax) {
      handleChange(0, newValue);
    } else {
      handleChange(1, newValue);
    }
  };

  // Handle value change
  const handleChange = (index, newValue) => {
    const newLocalValue = [...localValue];
    
    // Ensure min <= max
    if (index === 0) {
      newValue = Math.min(newValue, localValue[1] - step);
    } else {
      newValue = Math.max(newValue, localValue[0] + step);
    }
    
    // Clamp to min/max
    newValue = Math.max(min, Math.min(max, newValue));
    
    // Ensure value aligns with step
    newValue = Math.round((newValue - min) / step) * step + min;
    
    newLocalValue[index] = newValue;
    setLocalValue(newLocalValue);
    
    // Only call onChange after dragging is complete to avoid too many rerenders
    if (onChange && !isDragging) {
      onChange(newLocalValue);
    }
  };

  // Handle mouse down on thumbs
  const handleMouseDown = (index) => (e) => {
    e.preventDefault();
    setIsDragging(index === 0 ? 'min' : 'max');
  };

  // Handle keyboard events
  const handleKeyDown = (index) => (e) => {
    let newValue = localValue[index];
    
    switch (e.key) {
      case 'ArrowLeft':
      case 'ArrowDown':
        newValue = localValue[index] - step;
        e.preventDefault();
        break;
      case 'ArrowRight':
      case 'ArrowUp':
        newValue = localValue[index] + step;
        e.preventDefault();
        break;
      case 'Home':
        newValue = min;
        e.preventDefault();
        break;
      case 'End':
        newValue = max;
        e.preventDefault();
        break;
      default:
        return;
    }
    
    handleChange(index, newValue);
    onChange(index === 0 ? [newValue, localValue[1]] : [localValue[0], newValue]);
  };

  // Handle global mouse events for dragging
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging === null || !trackRef.current) return;
      
      const rect = trackRef.current.getBoundingClientRect();
      const percent = Math.min(Math.max(0, ((e.clientX - rect.left) / rect.width) * 100), 100);
      const newValue = Math.round(((max - min) * percent) / 100) + min;
      
      if (isDragging === 'min') {
        handleChange(0, newValue);
      } else {
        handleChange(1, newValue);
      }
    };
    
    const handleMouseUp = () => {
      if (isDragging !== null) {
        setIsDragging(null);
        if (onChange) {
          onChange(localValue);
        }
      }
    };
    
    // Add event listeners
    if (isDragging !== null) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    
    // Cleanup
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, localValue, min, max, onChange]);

  return (
    <div className={`relative h-7 ${className}`}>
      {/* Background track */}
      <div 
        ref={trackRef}
        onClick={handleTrackClick}
        className="absolute h-2 rounded-full bg-neutral-200 cursor-pointer w-full top-1/2 -translate-y-1/2"
      >
        {/* Selected range */}
        <div 
          className="absolute h-full bg-primary-500 rounded-full"
          style={{ 
            left: `${minPercent}%`, 
            width: `${maxPercent - minPercent}%` 
          }}
        />
      </div>

      {/* Min thumb */}
      <div 
        role="slider"
        aria-valuemin={min}
        aria-valuemax={localValue[1]}
        aria-valuenow={localValue[0]}
        tabIndex={0}
        className={`absolute h-5 w-5 bg-white border-2 border-primary-500 rounded-full cursor-grab top-1/2 -translate-x-1/2 -translate-y-1/2 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:ring-offset-2 ${isDragging === 'min' ? 'cursor-grabbing' : ''}`}
        style={{ left: `${minPercent}%` }}
        onMouseDown={handleMouseDown(0)}
        onKeyDown={handleKeyDown(0)}
      />

      {/* Max thumb */}
      <div 
        role="slider"
        aria-valuemin={localValue[0]}
        aria-valuemax={max}
        aria-valuenow={localValue[1]}
        tabIndex={0}
        className={`absolute h-5 w-5 bg-white border-2 border-primary-500 rounded-full cursor-grab top-1/2 -translate-x-1/2 -translate-y-1/2 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:ring-offset-2 ${isDragging === 'max' ? 'cursor-grabbing' : ''}`}
        style={{ left: `${maxPercent}%` }}
        onMouseDown={handleMouseDown(1)}
        onKeyDown={handleKeyDown(1)}
      />
    </div>
  );
};

export default RangeSlider; 