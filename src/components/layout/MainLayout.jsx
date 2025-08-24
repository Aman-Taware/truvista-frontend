import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

/**
 * MainLayout component that wraps all pages with Header and Footer
 * Supports React Router Outlet for nested routes
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Page content (optional, uses Outlet if not provided)
 * @param {boolean} props.hideFooter - Whether to hide the footer
 */
const MainLayout = ({ 
  children, 
  hideFooter = false,
}) => {
  return (
    <div className="flex flex-col min-h-screen bg-neutral-50">
      <Header />
      
      {/* Main content with minimal padding for fixed header */}
      <main className="flex-grow pt-12">
        {children || <Outlet />}
      </main>
      
      {!hideFooter && <Footer />}
    </div>
  );
};

export default MainLayout; 