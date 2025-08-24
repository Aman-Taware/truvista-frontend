import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-neutral-50 pt-16 pb-20 flex items-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center">
          <div className="text-primary-600 font-display font-bold text-9xl mb-4">404</div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-neutral-900 mb-4">
            Page Not Found
          </h1>
          <p className="text-neutral-600 text-lg max-w-md mx-auto mb-8">
            We're sorry, the page you requested could not be found. Please go back to the homepage.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button 
              as={Link}
              to="/" 
              variant="primary" 
              size="lg"
            >
              Return Home
            </Button>
            <Button 
              as={Link}
              to="/properties" 
              variant="outline" 
              size="lg"
            >
              View Properties
            </Button>
          </div>
          
          <div className="mt-16">
            <img 
              src="https://images.unsplash.com/photo-1617957743147-7c5e61b30e6f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
              alt="Luxury property" 
              className="w-full max-w-2xl mx-auto rounded-lg shadow-md"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound; 