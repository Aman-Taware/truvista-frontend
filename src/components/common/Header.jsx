import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import AuthModal from '../auth/AuthModal';
import { NotificationContext } from '../../contexts/NotificationContext';

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { showNotification } = useContext(NotificationContext);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState(null);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const openAuthModal = () => {
    setShowAuthModal(true);
  };

  const handlePropertiesClick = (e) => {
    e.preventDefault();
    if (!user) {
      showNotification({ 
        type: 'error', 
        message: 'Please log in to view properties' 
      });
      setPendingNavigation('/search');
      setShowAuthModal(true);
      return;
    }
    
    navigate('/search');
  };
  
  // Handle auth modal close
  const handleAuthModalClose = () => {
    setShowAuthModal(false);
    
    // If user is now authenticated and there was a pending navigation, redirect
    if (user && pendingNavigation) {
      navigate(pendingNavigation);
      setPendingNavigation(null);
    }
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <span className="text-2xl font-display font-bold text-primary-600">Truvista</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-neutral-700 hover:text-primary-600 transition-colors">
              Home
            </Link>
            <a 
              href="/search" 
              onClick={handlePropertiesClick} 
              className="text-neutral-700 hover:text-primary-600 transition-colors cursor-pointer"
            >
              Properties
            </a>
            <Link to="/about" className="text-neutral-700 hover:text-primary-600 transition-colors">
              About
            </Link>
            <Link to="/contact" className="text-neutral-700 hover:text-primary-600 transition-colors">
              Contact
            </Link>
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="relative group">
                <button className="flex items-center text-neutral-700 hover:text-primary-600 transition-colors">
                  <span className="mr-2">{user?.name || 'User'}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>
                <div className="absolute right-0 top-full mt-2 w-48 bg-white shadow-lg rounded-md overflow-hidden z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <Link to="/profile" className="block px-4 py-2 text-neutral-700 hover:bg-neutral-100 transition-colors">
                    My Profile
                  </Link>
                  <Link to="/bookings" className="block px-4 py-2 text-neutral-700 hover:bg-neutral-100 transition-colors">
                    My Bookings
                  </Link>
                  <Link to="/shortlist" className="block px-4 py-2 text-neutral-700 hover:bg-neutral-100 transition-colors">
                    Shortlisted
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-neutral-700 hover:bg-neutral-100 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <>
                <button 
                  onClick={openAuthModal} 
                  className="text-neutral-700 hover:text-primary-600 transition-colors"
                >
                  Login
                </button>
                <button 
                  onClick={openAuthModal}
                  className="btn btn-primary"
                >
                  Register
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-neutral-700"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <nav className="flex flex-col space-y-3">
              <Link 
                to="/" 
                className="text-neutral-700 hover:text-primary-600 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <a 
                href="/search" 
                className="text-neutral-700 hover:text-primary-600 transition-colors cursor-pointer"
                onClick={(e) => {
                  setMobileMenuOpen(false);
                  handlePropertiesClick(e);
                }}
              >
                Properties
              </a>
              <Link 
                to="/about" 
                className="text-neutral-700 hover:text-primary-600 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </Link>
              <Link 
                to="/contact" 
                className="text-neutral-700 hover:text-primary-600 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact
              </Link>
              
              <div className="pt-3 border-t">
                {isAuthenticated ? (
                  <>
                    <Link 
                      to="/profile" 
                      className="block py-2 text-neutral-700 hover:text-primary-600 transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      My Profile
                    </Link>
                    <Link 
                      to="/bookings" 
                      className="block py-2 text-neutral-700 hover:text-primary-600 transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      My Bookings
                    </Link>
                    <Link 
                      to="/shortlist" 
                      className="block py-2 text-neutral-700 hover:text-primary-600 transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Shortlisted
                    </Link>
                    <button 
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                      className="block w-full text-left py-2 text-neutral-700 hover:text-primary-600 transition-colors"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      onClick={() => {
                        setMobileMenuOpen(false);
                        openAuthModal();
                      }}
                      className="block w-full text-left py-2 text-neutral-700 hover:text-primary-600 transition-colors"
                    >
                      Login
                    </button>
                    <button 
                      onClick={() => {
                        setMobileMenuOpen(false);
                        openAuthModal();
                      }}
                      className="block w-full text-left py-2 text-primary-600 font-medium hover:text-primary-700 transition-colors"
                    >
                      Register
                    </button>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={handleAuthModalClose} 
      />
    </header>
  );
};

export default Header; 