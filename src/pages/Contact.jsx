import React from 'react';
import { Helmet } from 'react-helmet';

const Contact = () => {
  return (
    <div className="min-h-screen bg-neutral-50 pt-16 pb-20">
      <Helmet>
        <title>Contact Us | Truvista</title>
        <meta name="description" content="Get in touch with our luxury real estate experts at Truvista. Find our contact information including address, phone numbers, and email addresses." />
      </Helmet>
      
      <div className="bg-primary-900 py-12 mb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-2">
            Contact Us
          </h1>
          <p className="text-white/80 text-xl">
            Get in touch with our luxury real estate experts
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
          <div className="p-6 md:p-10">
            <h2 className="text-2xl font-display font-semibold text-neutral-900 mb-8 text-center">
              Our Contact Information
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-neutral-900 mb-2">Our Address</h3>
                    <p className="text-neutral-700">
                      Moshi, Pune<br />
                      Maharashtra, 412105<br />
                      India
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-neutral-900 mb-2">Phone Numbers</h3>
                    <p className="text-neutral-700">
                      <a href="tel:+919158925160" className="hover:text-primary-600 transition-colors">
                        General: +91 9158925160
                      </a><br />
                      <a href="tel:+919876543211" className="hover:text-primary-600 transition-colors">
                        Sales: +91 9373135938
                      </a><br />
                      <a href="tel:+919373135938" className="hover:text-primary-600 transition-colors">
                        Support: +91 9373135938
                      </a>
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-neutral-900 mb-2">Email Addresses</h3>
                    <p className="text-neutral-700">
                      <a href="mailto:info@truvista.com" className="hover:text-primary-600 transition-colors">
                        General: truvista25@gmail.com
                      </a>
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-neutral-900 mb-2">Office Hours</h3>
                    <p className="text-neutral-700">
                      24/7 hours available
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact; 