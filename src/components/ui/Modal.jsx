import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Button from './Button';

/**
 * Modal component for displaying content in an overlay
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {Function} props.onClose - Function to call when modal is closed
 * @param {React.ReactNode} props.children - Modal content
 * @param {string} props.title - Modal title
 * @param {string} props.size - Modal size: 'sm', 'md', 'lg', 'xl'
 * @param {boolean} props.closeOnOutsideClick - Whether to close the modal when clicking outside
 * @param {boolean} props.showCloseButton - Whether to show the close button in the header
 * @param {React.ReactNode} props.footer - Custom footer content
 * @param {string} props.className - Additional classes for the modal content
 */
const Modal = ({
  isOpen,
  onClose,
  children,
  title,
  size = 'md',
  closeOnOutsideClick = true,
  showCloseButton = true,
  footer,
  className = '',
}) => {
  const modalRef = useRef(null);

  // Handle ESC key press
  useEffect(() => {
    const handleEscKey = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'auto'; // Restore scrolling when modal is closed
    };
  }, [isOpen, onClose]);

  // Handle outside clicks
  const handleOutsideClick = (e) => {
    if (closeOnOutsideClick && modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  // Size classes
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4',
  };

  // Don't render if not open
  if (!isOpen) return null;

  // Create portal to render modal outside of normal flow
  return createPortal(
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/70 backdrop-blur-sm transition-opacity duration-300"
      onClick={handleOutsideClick}
      aria-modal="true"
      role="dialog"
    >
      {/* Modal Content */}
      <div 
        ref={modalRef}
        className={`${sizeClasses[size]} w-full bg-white rounded-lg shadow-xl transform transition-all duration-300 ease-in-out ${className}`}
        style={{ 
          opacity: isOpen ? 1 : 0,
          transform: isOpen ? 'scale(1)' : 'scale(0.95)'
        }}
      >
        {/* Modal Header */}
        {(title || showCloseButton) && (
          <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
            {title && (
              <h3 className="text-xl font-display font-semibold text-neutral-900">{title}</h3>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="text-neutral-500 hover:text-neutral-700 transition-colors duration-200"
                aria-label="Close modal"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Modal Body */}
        <div className="px-6 py-5 max-h-[calc(100vh-200px)] overflow-y-auto">
          {children}
        </div>

        {/* Modal Footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-neutral-200 bg-neutral-50 rounded-b-lg">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

/**
 * Modal.Footer component for consistent modal footers
 */
Modal.Footer = ({ children, className = '' }) => {
  return (
    <div className={`flex justify-end space-x-3 ${className}`}>
      {children}
    </div>
  );
};

/**
 * Confirmation Modal preset
 */
Modal.Confirm = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'primary',
  size = 'sm',
  isLoading = false,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size={size}
      footer={
        <Modal.Footer>
          <Button 
            variant="ghost" 
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button 
            variant={confirmVariant} 
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {confirmText}
          </Button>
        </Modal.Footer>
      }
    >
      <p className="text-neutral-700">{message}</p>
    </Modal>
  );
};

export default Modal; 