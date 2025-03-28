import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import AuthModal from '../auth/AuthModal';
import Container from '../ui/Container';
import Logo from '../ui/Logo';

const Header = () => {
  const { user, logoutUser, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Handle scroll effect for header shadow only (no longer affects background transparency)
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Listen for auth:logout events
  useEffect(() => {
    const handleAuthLogout = (event) => {
      // Handle session expiration
      if (event.detail?.reason === 'session_expired') {
        logoutUser();
        // Don't automatically show the auth modal
        // setShowAuthModal(true);
      }
    };
    
    document.addEventListener('auth:logout', handleAuthLogout);
    return () => document.removeEventListener('auth:logout', handleAuthLogout);
  }, [logoutUser]);

  const handleLogout = () => {
    logoutUser();
    navigate('/');
  };

  const openAuthModal = () => {
    setShowAuthModal(true);
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white py-2 ${
        isScrolled ? 'shadow-elegant' : ''
      }`}
    >
      <Container>
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <Logo variant="dark" withTagline={false} />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <NavLink to="/">Home</NavLink>
            <NavLink to="/properties">Properties</NavLink>
            {isAuthenticated && (
              <>
                <NavLink to="/user/bookings">Bookings</NavLink>
                <NavLink to="/user/shortlist">Shortlist</NavLink>
                <NavLink to="/user/profile">Profile</NavLink>
                {isAdmin() && (
                  <NavLink to="/admin" className="text-secondary-500 font-semibold">
                    Admin Dashboard
                  </NavLink>
                )}
              </>
            )}
            <NavLink to="/about">About</NavLink>
            <NavLink to="/contact">Contact</NavLink>
            
            {/* Sign-in/out Button */}
            {isAuthenticated ? (
              <button 
                className="text-error-500 hover:text-error-700 transition-colors font-medium text-sm"
                onClick={handleLogout}
              >
                Sign Out
              </button>
            ) : (
              <button 
                className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-md text-sm font-medium shadow-md hover:shadow-lg transition-all duration-200"
                onClick={openAuthModal}
              >
                Sign In / Register
              </button>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden rounded-full p-2 text-primary-700 hover:bg-primary-50 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </Container>

      {/* Mobile Menu */}
      <div 
        className={`md:hidden absolute top-full left-0 right-0 bg-white shadow-elegant transition-all duration-300 transform ${
          mobileMenuOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-4'
        }`}
      >
        <Container>
          <nav className="py-4 flex flex-col space-y-1">
            <MobileNavLink to="/" onClick={() => setMobileMenuOpen(false)}>Home</MobileNavLink>
            <MobileNavLink to="/properties" onClick={() => setMobileMenuOpen(false)}>Properties</MobileNavLink>
            {isAuthenticated && (
              <>
                <MobileNavLink to="/user/bookings" onClick={() => setMobileMenuOpen(false)}>Bookings</MobileNavLink>
                <MobileNavLink to="/user/shortlist" onClick={() => setMobileMenuOpen(false)}>Shortlist</MobileNavLink>
                <MobileNavLink to="/user/profile" onClick={() => setMobileMenuOpen(false)}>Profile</MobileNavLink>
                {isAdmin() && (
                  <MobileNavLink 
                    to="/admin" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-secondary-500 font-semibold"
                  >
                    Admin Dashboard
                  </MobileNavLink>
                )}
              </>
            )}
            <MobileNavLink to="/about" onClick={() => setMobileMenuOpen(false)}>About</MobileNavLink>
            <MobileNavLink to="/contact" onClick={() => setMobileMenuOpen(false)}>Contact</MobileNavLink>
            
            <div className="border-t border-neutral-100 pt-3 mt-3">
              {isAuthenticated ? (
                <button 
                  className="w-full text-left px-2 py-2 text-error-500 font-medium hover:bg-error-50 rounded-md transition-colors"
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                >
                  Sign Out
                </button>
              ) : (
                <button 
                  className="w-full py-2 px-4 bg-primary-600 hover:bg-primary-700 text-white rounded-md text-sm font-medium shadow-md transition-colors"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openAuthModal();
                  }}
                >
                  Sign In / Register
                </button>
              )}
            </div>
          </nav>
        </Container>
      </div>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </header>
  );
};

// Desktop Nav Link Component
const NavLink = ({ to, children, className = '' }) => (
  <Link 
    to={to} 
    className={`font-medium text-neutral-700 hover:text-primary-500 transition-colors duration-200 relative group ${className}`}
  >
    {children}
    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-secondary-500 group-hover:w-full transition-all duration-300"></span>
  </Link>
);

// Mobile Nav Link Component
const MobileNavLink = ({ to, children, onClick, className = '' }) => (
  <Link 
    to={to} 
    className={`px-2 py-2 font-medium text-neutral-800 hover:text-primary-600 hover:bg-neutral-50 rounded-md transition-colors duration-200 ${className}`}
    onClick={onClick}
  >
    {children}
  </Link>
);

export default Header; 