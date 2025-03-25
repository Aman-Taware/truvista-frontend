import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

/**
 * Layout component that wraps all pages with Header and Footer
 * Supports both direct children and React Router Outlet
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Page content (optional, uses Outlet if not provided)
 * @param {boolean} props.hideFooter - Whether to hide the footer
 * @param {boolean} props.transparentHeader - Whether the header should be transparent
 */
const Layout = ({ 
  children, 
  hideFooter = false,
  transparentHeader = false,
}) => {
  return (
    <div className="flex flex-col min-h-screen bg-neutral-50">
      <Header transparent={transparentHeader} />
      
      {/* Main content with padding for fixed header */}
      <main className="flex-grow pt-20">
        {children || <Outlet />}
      </main>
      
      {!hideFooter && <Footer />}
    </div>
  );
};

export default Layout; 