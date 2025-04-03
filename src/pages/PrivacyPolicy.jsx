import React from 'react';
import Container from '../components/ui/Container';
import { Section } from '../components/ui/Container';
import { Helmet } from 'react-helmet';

/**
 * Privacy Policy Page Component
 * Displays the privacy policy for Truvista platform
 */
const PrivacyPolicy = () => {
  return (
    <>
      <Helmet>
        <title>Privacy Policy | Truvista</title>
        <meta name="description" content="Privacy policy for the Truvista real estate platform" />
      </Helmet>
      
      <div className="pt-20 pb-12 bg-white">
        <Container>
          <Section>
            <div className="max-w-4xl mx-auto">
              <h1 className="text-3xl md:text-4xl font-display font-bold text-primary-800 mb-6">Privacy Policy</h1>
              <p className="text-neutral-700 mb-8">Last Updated: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              
              <div className="prose prose-lg max-w-none">
                <h2 className="text-2xl font-display text-primary-700 mt-10 mb-4">1. Introduction</h2>
                <p>At Truvista ("we," "our," or "us"), we respect your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website, mobile application, and other services (collectively, the "Services").</p>
                <p>Please read this Privacy Policy carefully. By accessing or using our Services, you acknowledge that you have read, understood, and agree to be bound by all the terms of this Privacy Policy. If you do not agree with our policies and practices, please do not use our Services.</p>
                <p>This Privacy Policy is in accordance with the Information Technology Act, 2000, and the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011, of India.</p>
                
                <h2 className="text-2xl font-display text-primary-700 mt-10 mb-4">2. Information We Collect</h2>
                <p>We collect several types of information from and about users of our Services, including:</p>
                
                <h3 className="text-xl font-display text-primary-600 mt-6 mb-3">2.1 Personal Information</h3>
                <p>Personal information is data that can be used to identify you individually. The personal information we collect may include:</p>
                <ul className="list-disc pl-5 mb-5">
                  <li>Contact information (such as name, email address, mobile number, and address)</li>
                  <li>Account credentials (such as username and password)</li>
                  <li>Financial information (such as payment method details)</li>
                  <li>Demographic information (such as age, gender, and occupation)</li>
                  <li>Identity verification information (such as PAN, Aadhaar, or other government IDs)</li>
                  <li>Property preferences and requirements</li>
                  <li>Communications between you and Truvista</li>
                </ul>
                
                <h3 className="text-xl font-display text-primary-600 mt-6 mb-3">2.2 Non-Personal Information</h3>
                <p>We also collect non-personal information, which is data that does not identify you individually. This may include:</p>
                <ul className="list-disc pl-5 mb-5">
                  <li>Browser and device information</li>
                  <li>IP address</li>
                  <li>Operating system</li>
                  <li>Usage data (such as pages visited, links clicked, and actions taken on our Services)</li>
                  <li>Location data (if you grant permission)</li>
                  <li>Aggregated or anonymized data</li>
                </ul>
                
                <h2 className="text-2xl font-display text-primary-700 mt-10 mb-4">3. How We Collect Information</h2>
                <p>We collect information in the following ways:</p>
                
                <h3 className="text-xl font-display text-primary-600 mt-6 mb-3">3.1 Information You Provide to Us</h3>
                <p>We collect information that you provide directly to us, such as when you:</p>
                <ul className="list-disc pl-5 mb-5">
                  <li>Register for an account</li>
                  <li>Complete your profile</li>
                  <li>Schedule a property visit</li>
                  <li>Contact our customer support</li>
                  <li>Participate in surveys or promotions</li>
                  <li>Post content or comments on our Services</li>
                </ul>
                
                <h3 className="text-xl font-display text-primary-600 mt-6 mb-3">3.2 Information Collected Automatically</h3>
                <p>When you use our Services, we automatically collect certain information, including:</p>
                <ul className="list-disc pl-5 mb-5">
                  <li>Log information (such as IP address, browser type, pages visited, and time spent)</li>
                  <li>Device information (such as hardware model, operating system, and unique device identifiers)</li>
                  <li>Location information (with your permission)</li>
                  <li>Cookie and tracking technology data</li>
                </ul>
                
                <h3 className="text-xl font-display text-primary-600 mt-6 mb-3">3.3 Information from Third Parties</h3>
                <p>We may receive information about you from third parties, such as:</p>
                <ul className="list-disc pl-5 mb-5">
                  <li>Business partners</li>
                  <li>Social media platforms (if you connect your account)</li>
                  <li>Identity verification services</li>
                  <li>Credit bureaus (for tenant screening, if applicable)</li>
                  <li>Public databases</li>
                </ul>
                
                <h2 className="text-2xl font-display text-primary-700 mt-10 mb-4">4. How We Use Your Information</h2>
                <p>We use the information we collect for various purposes, including to:</p>
                <ul className="list-disc pl-5 mb-5">
                  <li>Provide, maintain, and improve our Services</li>
                  <li>Process transactions and send related information</li>
                  <li>Verify your identity and prevent fraud</li>
                  <li>Personalize your experience and deliver content relevant to your interests</li>
                  <li>Facilitate property searches, bookings, and transactions</li>
                  <li>Communicate with you about our Services, updates, and promotions</li>
                  <li>Respond to your comments, questions, and requests</li>
                  <li>Monitor and analyze trends, usage, and activities on our Services</li>
                  <li>Develop new products and services</li>
                  <li>Enforce our terms, conditions, and policies</li>
                  <li>Protect the rights, property, or safety of Truvista, our users, or others</li>
                  <li>Comply with applicable laws and regulations</li>
                </ul>
                
                <h2 className="text-2xl font-display text-primary-700 mt-10 mb-4">5. Disclosure of Your Information</h2>
                <p>We may disclose your information to the following categories of recipients:</p>
                
                <h3 className="text-xl font-display text-primary-600 mt-6 mb-3">5.1 Service Providers</h3>
                <p>We may share your information with third-party service providers who perform services on our behalf, such as:</p>
                <ul className="list-disc pl-5 mb-5">
                  <li>Payment processors</li>
                  <li>Cloud storage providers</li>
                  <li>Analytics providers</li>
                  <li>Email service providers</li>
                  <li>Customer support providers</li>
                  <li>Marketing and advertising partners</li>
                </ul>
                <p>These service providers are bound by contractual obligations to keep your information confidential and use it only for the purposes for which we disclose it to them.</p>
                
                <h3 className="text-xl font-display text-primary-600 mt-6 mb-3">5.2 Property Owners and Agents</h3>
                <p>If you express interest in a property or schedule a visit, we may share your information with the property owner or agent to facilitate your request.</p>
                
                <h3 className="text-xl font-display text-primary-600 mt-6 mb-3">5.3 Business Transfers</h3>
                <p>If we are involved in a merger, acquisition, financing, or sale of assets, your information may be transferred as part of that transaction. We will notify you via email and/or a prominent notice on our Services of any change in ownership or uses of your information.</p>
                
                <h3 className="text-xl font-display text-primary-600 mt-6 mb-3">5.4 Legal Requirements</h3>
                <p>We may disclose your information if required to do so by law or in response to valid requests by public authorities (e.g., a court or government agency).</p>
                
                <h3 className="text-xl font-display text-primary-600 mt-6 mb-3">5.5 Protection of Rights</h3>
                <p>We may disclose your information to protect the rights, property, or safety of Truvista, our users, or others, including exchanging information with other companies and organizations for fraud protection and credit risk reduction.</p>
                
                <h2 className="text-2xl font-display text-primary-700 mt-10 mb-4">6. Data Security</h2>
                <p>We implement appropriate technical and organizational measures to protect the security of your personal information, including encryption, access controls, regular security assessments, and staff training. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.</p>
                <p>We regularly review our security practices to ensure they align with industry standards and legal requirements, including the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011.</p>
                
                <h2 className="text-2xl font-display text-primary-700 mt-10 mb-4">7. Data Retention</h2>
                <p>We will retain your personal information only for as long as necessary to fulfill the purposes for which we collected it, including for the purposes of satisfying any legal, accounting, or reporting requirements.</p>
                <p>To determine the appropriate retention period for personal information, we consider:</p>
                <ul className="list-disc pl-5 mb-5">
                  <li>The amount, nature, and sensitivity of the personal information</li>
                  <li>The potential risk of harm from unauthorized use or disclosure</li>
                  <li>The purposes for which we process the information and whether we can achieve those purposes through other means</li>
                  <li>The applicable legal, regulatory, tax, accounting, or other requirements</li>
                </ul>
                <p>When we no longer need your personal information, we will securely delete or anonymize it.</p>
                
                <h2 className="text-2xl font-display text-primary-700 mt-10 mb-4">8. Your Rights and Choices</h2>
                <p>You have certain rights regarding your personal information, including:</p>
                
                <h3 className="text-xl font-display text-primary-600 mt-6 mb-3">8.1 Access and Update</h3>
                <p>You can access and update your personal information through your account settings on our Services. If you cannot access or update certain information, please contact us for assistance.</p>
                
                <h3 className="text-xl font-display text-primary-600 mt-6 mb-3">8.2 Data Portability</h3>
                <p>You have the right to receive a copy of your personal information in a structured, machine-readable format.</p>
                
                <h3 className="text-xl font-display text-primary-600 mt-6 mb-3">8.3 Deletion</h3>
                <p>You can request the deletion of your personal information, subject to certain exceptions provided by law.</p>
                
                <h3 className="text-xl font-display text-primary-600 mt-6 mb-3">8.4 Objection</h3>
                <p>You can object to the processing of your personal information in certain circumstances.</p>
                
                <h3 className="text-xl font-display text-primary-600 mt-6 mb-3">8.5 Marketing Communications</h3>
                <p>You can opt out of receiving marketing communications from us by following the unsubscribe instructions included in our emails or by contacting us directly.</p>
                
                <h3 className="text-xl font-display text-primary-600 mt-6 mb-3">8.6 Cookies</h3>
                <p>Most web browsers are set to accept cookies by default. You can adjust your browser settings to refuse cookies or alert you when cookies are being sent. However, some parts of our Services may not function properly if you disable cookies.</p>
                
                <h2 className="text-2xl font-display text-primary-700 mt-10 mb-4">9. International Data Transfers</h2>
                <p>Your information may be transferred to and processed in countries other than the country in which you reside. These countries may have data protection laws that are different from the laws of your country.</p>
                <p>We take appropriate measures to ensure that your personal information remains protected in accordance with this Privacy Policy and applicable law when transferred internationally, including using standard contractual clauses approved by relevant authorities.</p>
                
                <h2 className="text-2xl font-display text-primary-700 mt-10 mb-4">10. Children's Privacy</h2>
                <p>Our Services are not intended for children under 18 years of age. We do not knowingly collect personal information from children under 18. If you are a parent or guardian and believe that your child has provided us with personal information, please contact us, and we will delete such information from our systems.</p>
                
                <h2 className="text-2xl font-display text-primary-700 mt-10 mb-4">11. Changes to Our Privacy Policy</h2>
                <p>We may update our Privacy Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. We will notify you of any material changes by posting the new Privacy Policy on this page and updating the "Last Updated" date at the top.</p>
                <p>We encourage you to review this Privacy Policy periodically to stay informed about how we are protecting your information.</p>
                
                <h2 className="text-2xl font-display text-primary-700 mt-10 mb-4">12. Grievance Officer</h2>
                <p>In accordance with the Information Technology Act, 2000, and the rules made thereunder, the name and contact details of the Grievance Officer are provided below:</p>
                <p className="mb-1"><strong>Name:</strong> [Grievance Officer Name]</p>
                <p className="mb-1"><strong>Email:</strong> grievance@truvista.in</p>
                <p className="mb-5"><strong>Address:</strong> [Company Address], India</p>
                <p>The Grievance Officer shall address your grievances within 30 days from the date of receipt of grievance.</p>
                
                <h2 className="text-2xl font-display text-primary-700 mt-10 mb-4">13. Contact Us</h2>
                <p>If you have any questions, concerns, or requests regarding this Privacy Policy or our privacy practices, please contact us at:</p>
                <p className="mb-1">Truvista Team</p>
                <p className="mb-1">Email: truvista25@gmail.com</p>
                <p className="mb-1">Phone: +91-9158925160</p>
                <p className="mb-5">Address: Moshi,Pune 412105</p>
              </div>
            </div>
          </Section>
        </Container>
      </div>
    </>
  );
};

export default PrivacyPolicy; 