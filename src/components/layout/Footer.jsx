import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, MapPin, Phone, Mail } from 'lucide-react';
import Container from '../ui/Container';
import Logo from '../ui/Logo';

const Footer = () => {
  return (
    <footer className="bg-primary-800 text-white">
      {/* Main Footer */}
      <div className="border-b border-primary-700">
        <Container className="py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Company Info */}
            <div>
              <div className="mb-6">
                <Logo variant="light" withTagline />
              </div>
              <p className="text-neutral-200 mb-6 text-sm leading-relaxed">
                Discover your dream home with Truvista. We offer premium properties with unmatched quality and luxury.
              </p>
              <div className="flex space-x-4">
                <SocialLink href="https://facebook.com" aria-label="Facebook">
                  <Facebook size={20} />
                </SocialLink>
                <SocialLink href="https://twitter.com" aria-label="Twitter">
                  <Twitter size={20} />
                </SocialLink>
                <SocialLink href="https://instagram.com" aria-label="Instagram">
                  <Instagram size={20} />
                </SocialLink>
                <SocialLink href="https://linkedin.com" aria-label="LinkedIn">
                  <Linkedin size={20} />
                </SocialLink>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-display font-semibold mb-6 text-white">
                Quick Links
              </h4>
              <div className="flex flex-col space-y-3 items-start">
                <FooterLink to="/properties">Properties</FooterLink>
                <FooterLink to="/about">About Us</FooterLink>
                <FooterLink to="/contact">Contact Us</FooterLink>
                <FooterLink to="/blog">Blog</FooterLink>
                <FooterLink to="/careers">Careers</FooterLink>
              </div>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-lg font-display font-semibold mb-6 text-white">
                Legal
              </h4>
              <div className="flex flex-col space-y-3 items-start">
                <FooterLink to="/terms">Terms of Service</FooterLink>
                <FooterLink to="/privacy">Privacy Policy</FooterLink>
                <FooterLink to="/cookies">Cookie Policy</FooterLink>
                <FooterLink to="/refund">Refund Policy</FooterLink>
                <FooterLink to="/licenses">Licenses</FooterLink>
              </div>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-lg font-display font-semibold mb-6 text-white">
                Contact
              </h4>
              <address className="flex flex-col space-y-5 not-italic text-neutral-200 text-sm">
                <div className="flex items-start">
                  <div className="text-secondary-300 mr-3 mt-1">
                    <MapPin size={18} strokeWidth={2.5} />
                  </div>
                  <span>
                    1234 Park Avenue, <br />
                    New York, NY 10001
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="text-secondary-300 mr-3">
                    <Phone size={18} strokeWidth={2.5} />
                  </div>
                  <span>+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center">
                  <div className="text-secondary-300 mr-3">
                    <Mail size={18} strokeWidth={2.5} />
                  </div>
                  <span>info@truvista.com</span>
                </div>
              </address>
            </div>
          </div>
        </Container>
      </div>

      {/* Copyright */}
      <Container>
        <div className="py-6 flex flex-col md:flex-row justify-between items-center text-neutral-300 text-sm">
          <span>© {new Date().getFullYear()} Truvista. All rights reserved.</span>
          <span className="mt-4 md:mt-0">
            Designed with <span className="text-secondary-400">♥</span> for elegant experiences
          </span>
        </div>
      </Container>
    </footer>
  );
};

// Footer Link Component
const FooterLink = ({ to, children }) => (
  <RouterLink 
    to={to} 
    className="text-neutral-200 hover:text-white hover:translate-x-1 transition-all duration-200 text-sm inline-block"
  >
    {children}
  </RouterLink>
);

// Social Link Component
const SocialLink = ({ href, children, ...rest }) => (
  <a 
    href={href} 
    className="text-neutral-300 hover:text-secondary-400 bg-primary-700 hover:bg-primary-600 p-2 rounded-full transition-all duration-200"
    target="_blank"
    rel="noopener noreferrer"
    {...rest}
  >
    {children}
  </a>
);

export default Footer; 