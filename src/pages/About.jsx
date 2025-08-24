import React from 'react';

const About = () => {
  return (
    <div className="min-h-screen bg-neutral-50 pt-16 pb-20">
      <div className="bg-primary-900 py-12 mb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-2">
            About Truvista
          </h1>
          <p className="text-white/80 text-xl">
            A legacy of excellence in luxury real estate
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-16">
          <div className="p-6 md:p-10">
            <h2 className="text-2xl font-display font-semibold text-neutral-900 mb-6">
              Our Story
            </h2>
            <p className="text-neutral-700 mb-4 leading-relaxed">
              Truvista was founded with a simple mission: to make luxury real estate accessible, 
              transparent, and stress-free. We understand that finding the perfect property is one 
              of life's most significant decisions, and we're here to guide you through every step 
              of the journey.
            </p>
            <p className="text-neutral-700 mb-6 leading-relaxed">
              Our platform brings together cutting-edge technology and human expertise to create 
              a seamless experience that puts you in control while providing the support you need.
            </p>
            
            <div className="mt-10 mb-10">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="text-primary-700 mb-4">
                    <span className="text-4xl font-display font-bold">20+</span>
                  </div>
                  <h3 className="text-lg font-medium text-neutral-900 mb-2">Years of Excellence</h3>
                  <p className="text-neutral-600">Providing exceptional service in luxury real estate</p>
                </div>
                
                <div className="text-center">
                  <div className="text-primary-700 mb-4">
                    <span className="text-4xl font-display font-bold">500+</span>
                  </div>
                  <h3 className="text-lg font-medium text-neutral-900 mb-2">Luxury Properties</h3>
                  <p className="text-neutral-600">Successfully sold and managed worldwide</p>
                </div>
                
                <div className="text-center">
                  <div className="text-primary-700 mb-4">
                    <span className="text-4xl font-display font-bold">98%</span>
                  </div>
                  <h3 className="text-lg font-medium text-neutral-900 mb-2">Client Satisfaction</h3>
                  <p className="text-neutral-600">Delivering unparalleled real estate experiences</p>
                </div>
              </div>
            </div>
            
            <h2 className="text-2xl font-display font-semibold text-neutral-900 mb-6">
              Our Mission
            </h2>
            <p className="text-neutral-700 mb-4 leading-relaxed">
              At Truvista, our mission is to connect discerning clients with extraordinary properties that reflect their lifestyle and aspirations. We are committed to providing a personalized and seamless real estate experience, guided by integrity, expertise, and discretion.
            </p>
            <ul className="list-disc pl-6 mt-4 space-y-2 text-neutral-700 mb-8">
              <li>Providing transparent and accurate information about every property</li>
              <li>Simplifying the property search and booking process</li>
              <li>Offering personalized guidance based on your unique needs</li>
              <li>Ensuring security and trust in every transaction</li>
              <li>Making quality properties accessible to everyone</li>
            </ul>
            
            <h2 className="text-2xl font-display font-semibold text-neutral-900 mb-6">
              Our Values
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
              <div className="bg-neutral-50 p-6 rounded-lg border border-neutral-200">
                <h3 className="text-xl font-display font-semibold text-neutral-900 mb-3">Excellence</h3>
                <p className="text-neutral-700">
                  We strive for excellence in every aspect of our service, from property selection to client communication, ensuring an unparalleled experience.
                </p>
              </div>
              
              <div className="bg-neutral-50 p-6 rounded-lg border border-neutral-200">
                <h3 className="text-xl font-display font-semibold text-neutral-900 mb-3">Integrity</h3>
                <p className="text-neutral-700">
                  We operate with unwavering integrity and transparency, building lasting relationships founded on trust and mutual respect.
                </p>
              </div>
              
              <div className="bg-neutral-50 p-6 rounded-lg border border-neutral-200">
                <h3 className="text-xl font-display font-semibold text-neutral-900 mb-3">Innovation</h3>
                <p className="text-neutral-700">
                  We embrace innovation and leverage cutting-edge technology to enhance the real estate experience for our clients.
                </p>
              </div>
              
              <div className="bg-neutral-50 p-6 rounded-lg border border-neutral-200">
                <h3 className="text-xl font-display font-semibold text-neutral-900 mb-3">Exclusivity</h3>
                <p className="text-neutral-700">
                  We curate an exclusive portfolio of remarkable properties that represent the pinnacle of luxury living around the world.
                </p>
              </div>
            </div>

            <h2 className="text-2xl font-display font-semibold text-neutral-900 mb-6">
              Our Team
            </h2>
            <p className="text-neutral-700 mb-4 leading-relaxed">
              Behind Truvista is a dedicated team of real estate professionals, technology experts, 
              and customer service specialists who share a passion for redefining the property 
              market. With decades of combined experience, our team brings a wealth of knowledge and 
              insight to help you make informed decisions.
            </p>
            <p className="text-neutral-700">
              We believe in building lasting relationships based on trust, integrity, and exceptional 
              service. When you choose Truvista, you're not just using a platform – you're partnering 
              with a team that cares about your success.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About; 