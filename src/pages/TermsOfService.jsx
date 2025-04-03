import React from 'react';
import Container from '../components/ui/Container';
import { Section } from '../components/ui/Container';
import { Helmet } from 'react-helmet';

/**
 * Terms of Service Page Component
 * Displays the legal terms and conditions for using the Truvista platform
 */
const TermsOfService = () => {
  return (
    <>
      <Helmet>
        <title>Terms of Service | Truvista</title>
        <meta name="description" content="Terms and conditions for using the Truvista real estate platform" />
      </Helmet>
      
      <div className="pt-20 pb-12 bg-white">
        <Container>
          <Section>
            <div className="max-w-4xl mx-auto">
              <h1 className="text-3xl md:text-4xl font-display font-bold text-primary-800 mb-6">Terms of Service</h1>
              <p className="text-neutral-700 mb-8">Last Updated: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              
              <div className="prose prose-lg max-w-none">
                <h2 className="text-2xl font-display text-primary-700 mt-10 mb-4">1. Introduction and Acceptance</h2>
                <p>Welcome to Truvista, a real estate platform operated by Truvista Realty ("we," "us," or "our"). By accessing or using our website, mobile application, or any other services provided by Truvista (collectively, the "Services"), you agree to be bound by these Terms of Service ("Terms").</p>
                <p>Please read these Terms carefully. They constitute a legally binding agreement between you and Truvista. If you do not agree to these Terms, you must not access or use our Services.</p>
                <p>These Terms may be updated from time to time. We will notify you of any changes by posting the updated Terms on this page with a new "Last Updated" date. Your continued use of the Services after any such changes constitutes your acceptance of the new Terms.</p>
                
                <h2 className="text-2xl font-display text-primary-700 mt-10 mb-4">2. Eligibility and Registration</h2>
                <p>To use our Services, you must be at least 18 years of age and capable of forming a binding contract. By using our Services, you represent and warrant that you meet these requirements.</p>
                <p>To access certain features of our Services, you may be required to register for an account. When you register, you agree to provide accurate, current, and complete information about yourself. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.</p>
                <p>You agree to immediately notify us of any unauthorized use of your account or any other breach of security. We reserve the right to suspend or terminate your account if you violate any provisions of these Terms or if we determine, in our sole discretion, that such action is necessary to protect our Services or other users.</p>
                
                <h2 className="text-2xl font-display text-primary-700 mt-10 mb-4">3. Services Description</h2>
                <p>Truvista provides a platform that connects property buyers, sellers, renters, and real estate professionals in India. Our Services allow users to:</p>
                <ul className="list-disc pl-5 mb-5">
                  <li>Browse property listings and related information</li>
                  <li>Schedule property visits</li>
                  <li>Save properties to a shortlist</li>
                  <li>Contact property agents</li>
                  <li>Access various tools and resources related to real estate transactions</li>
                </ul>
                <p>All property listings on our platform are created, managed, and maintained by our administration team. We do not allow individual users to post property listings. We vet and verify all property information before it is published on our platform.</p>
                
                <h2 className="text-2xl font-display text-primary-700 mt-10 mb-4">4. User Conduct and Content</h2>
                <p>You agree not to use our Services to:</p>
                <ul className="list-disc pl-5 mb-5">
                  <li>Violate any applicable law, regulation, or third-party rights</li>
                  <li>Post or transmit any content that is illegal, harmful, threatening, abusive, harassing, defamatory, vulgar, obscene, or otherwise objectionable</li>
                  <li>Impersonate any person or entity or falsely state or misrepresent your affiliation with a person or entity</li>
                  <li>Post false, misleading, or fraudulent information or engage in deceptive practices</li>
                  <li>Harvest or collect personal information about other users without their consent</li>
                  <li>Interfere with or disrupt our Services or servers or networks connected to our Services</li>
                  <li>Attempt to gain unauthorized access to our Services, other accounts, computer systems, or networks</li>
                  <li>Use our Services for any commercial purpose not expressly permitted by us</li>
                </ul>
                <p>By submitting feedback, comments, or other content on our Services, you grant us a non-exclusive, royalty-free, perpetual, irrevocable, and fully sublicensable right to use, reproduce, modify, adapt, publish, translate, create derivative works from, distribute, and display such content throughout the world in any media.</p>
                <p>You represent and warrant that you own or have the necessary rights to the content you submit and that your content does not infringe the intellectual property rights or other rights of any third party.</p>
                
                <h2 className="text-2xl font-display text-primary-700 mt-10 mb-4">5. Property Listings</h2>
                <p>All property listings on the Truvista platform are created and managed exclusively by our administration team. We strive to ensure that all listings are accurate, complete, and not misleading.</p>
                <p>For all property listings, we commit to:</p>
                <ul className="list-disc pl-5 mb-5">
                  <li>Provide accurate location, price, and property details</li>
                  <li>Include actual photographs of the property (unless listing a pre-construction property)</li>
                  <li>Disclose any material defects or issues with the property that are known to us</li>
                  <li>Comply with all applicable real estate laws and regulations in India, including the Real Estate (Regulation and Development) Act, 2016 (RERA) where applicable</li>
                </ul>
                <p>While we make every effort to verify the accuracy of property information, we cannot guarantee that all information is completely error-free. Users are encouraged to verify property details independently before making any decisions.</p>
                
                <h2 className="text-2xl font-display text-primary-700 mt-10 mb-4">6. Booking and Site Visits</h2>
                <p>Our Services allow you to schedule site visits to properties. By scheduling a site visit, you agree to:</p>
                <ul className="list-disc pl-5 mb-5">
                  <li>Provide accurate information when making the booking</li>
                  <li>Arrive at the scheduled time or provide reasonable notice of cancellation</li>
                  <li>Comply with all rules and regulations of the property during the visit</li>
                  <li>Treat property owners, agents, and their properties with respect</li>
                </ul>
                <p>We facilitate the scheduling of site visits but are not responsible for the conduct of either party during a visit. Users agree to assume all risks associated with property visits and to release Truvista from any liability arising from such visits.</p>
                
                <h2 className="text-2xl font-display text-primary-700 mt-10 mb-4">7. User Transactions</h2>
                <p>Any transaction between users and property owners or agents, including property sales, rentals, or other agreements, is solely between the parties involved. We are not a party to such transactions and do not assume any liability, obligation, or responsibility for any aspect of such transactions.</p>
                <p>We strongly recommend that users:</p>
                <ul className="list-disc pl-5 mb-5">
                  <li>Verify the identity and credentials of the parties they transact with</li>
                  <li>Thoroughly inspect properties before entering into any agreement</li>
                  <li>Consult with legal and financial professionals before finalizing any real estate transaction</li>
                  <li>Document all agreements in writing</li>
                  <li>Comply with all applicable laws and regulations governing real estate transactions in India</li>
                </ul>
                
                <h2 className="text-2xl font-display text-primary-700 mt-10 mb-4">8. Fees and Payments</h2>
                <p>We may charge fees for certain aspects of our Services. All fees are stated in Indian Rupees (INR) and are inclusive of applicable taxes unless stated otherwise.</p>
                <p>By using our paid Services, you agree to pay all fees and charges associated with your account on a timely basis and to use a valid payment method. You authorize us to charge your selected payment method for all fees incurred.</p>
                <p>We reserve the right to modify our fees at any time upon notice to you. Continued use of our Services after such notice constitutes your acceptance of the modified fees.</p>
                
                <h2 className="text-2xl font-display text-primary-700 mt-10 mb-4">9. Privacy and Data</h2>
                <p>Our collection, use, and disclosure of your personal information is governed by our Privacy Policy, which is incorporated into these Terms by reference. By using our Services, you consent to our collection, use, and disclosure of your information as described in our Privacy Policy.</p>
                <p>We comply with all applicable data protection laws in India, including the Information Technology Act, 2000, and the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011.</p>
                
                <h2 className="text-2xl font-display text-primary-700 mt-10 mb-4">10. Intellectual Property Rights</h2>
                <p>Our Services and all content, features, and functionality thereof, including but not limited to text, graphics, logos, icons, images, audio clips, digital downloads, data compilations, software, and the design, selection, and arrangement thereof, are owned by Truvista, our licensors, or other providers and are protected by Indian and international copyright, trademark, patent, trade secret, and other intellectual property or proprietary rights laws.</p>
                <p>These Terms do not grant you any right, title, or interest in our Services or any content, features, or functionality thereof. You may not reproduce, distribute, modify, create derivative works of, publicly display, publicly perform, republish, download, store, or transmit any material from our Services, except as permitted by these Terms.</p>
                
                <h2 className="text-2xl font-display text-primary-700 mt-10 mb-4">11. Third-Party Links and Services</h2>
                <p>Our Services may contain links to third-party websites or services that are not owned or controlled by Truvista. We have no control over, and assume no responsibility for, the content, privacy policies, or practices of any third-party websites or services.</p>
                <p>You acknowledge and agree that Truvista shall not be responsible or liable, directly or indirectly, for any damage or loss caused or alleged to be caused by or in connection with the use of or reliance on any such content, goods, or services available on or through any such websites or services.</p>
                
                <h2 className="text-2xl font-display text-primary-700 mt-10 mb-4">12. Disclaimers and Limitations of Liability</h2>
                <p>Our Services are provided on an "as is" and "as available" basis, without any warranties of any kind, either express or implied. We disclaim all warranties, express or implied, including but not limited to implied warranties of merchantability, fitness for a particular purpose, and non-infringement.</p>
                <p>We do not warrant that our Services will be uninterrupted or error-free, that defects will be corrected, or that our Services or the servers that make them available are free of viruses or other harmful components.</p>
                <p>To the fullest extent permitted by applicable law, Truvista and its officers, directors, employees, agents, affiliates, and licensors shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, use, goodwill, or other intangible losses, resulting from:</p>
                <ul className="list-disc pl-5 mb-5">
                  <li>Your access to or use of or inability to access or use our Services</li>
                  <li>Any conduct or content of any third party on our Services</li>
                  <li>Any content obtained from our Services</li>
                  <li>Unauthorized access, use, or alteration of your transmissions or content</li>
                </ul>
                <p>Our aggregate liability for all claims related to our Services shall not exceed the amount you paid to Truvista during the twelve (12) months preceding the date on which the claim arose or INR 5,000, whichever is greater.</p>
                
                <h2 className="text-2xl font-display text-primary-700 mt-10 mb-4">13. Indemnification</h2>
                <p>You agree to defend, indemnify, and hold harmless Truvista and its officers, directors, employees, agents, affiliates, and licensors from and against any and all claims, damages, obligations, losses, liabilities, costs or debt, and expenses (including but not limited to attorney's fees) arising from:</p>
                <ul className="list-disc pl-5 mb-5">
                  <li>Your use of and access to our Services</li>
                  <li>Your violation of any term of these Terms</li>
                  <li>Your violation of any third-party right, including without limitation any copyright, property, or privacy right</li>
                  <li>Any claim that your content caused damage to a third party</li>
                </ul>
                <p>This defense and indemnification obligation will survive these Terms and your use of our Services.</p>
                
                <h2 className="text-2xl font-display text-primary-700 mt-10 mb-4">14. Dispute Resolution</h2>
                <p>Any dispute, controversy, or claim arising out of or relating to these Terms or the breach, termination, or validity thereof shall be settled by arbitration in accordance with the Arbitration and Conciliation Act, 1996, of India.</p>
                <p>The arbitration shall be conducted by a sole arbitrator appointed by Truvista. The arbitration shall be conducted in English and the seat of arbitration shall be New Delhi, India.</p>
                <p>The decision of the arbitrator shall be final and binding on the parties. Judgment upon the award rendered by the arbitrator may be entered in any court having jurisdiction thereof.</p>
                
                <h2 className="text-2xl font-display text-primary-700 mt-10 mb-4">15. Governing Law and Jurisdiction</h2>
                <p>These Terms shall be governed by and construed in accordance with the laws of India, without regard to its conflict of law provisions.</p>
                <p>Subject to the arbitration provisions above, you agree to submit to the exclusive jurisdiction of the courts located in New Delhi, India, for the resolution of any dispute, controversy, or claim arising out of or relating to these Terms.</p>
                
                <h2 className="text-2xl font-display text-primary-700 mt-10 mb-4">16. Termination</h2>
                <p>We may terminate or suspend your access to our Services immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach these Terms.</p>
                <p>Upon termination, your right to use our Services will immediately cease. If you wish to terminate your account, you may simply discontinue using our Services or contact us to request account deletion.</p>
                <p>All provisions of these Terms which by their nature should survive termination shall survive termination, including, without limitation, ownership provisions, warranty disclaimers, indemnity, and limitations of liability.</p>
                
                <h2 className="text-2xl font-display text-primary-700 mt-10 mb-4">17. Severability</h2>
                <p>If any provision of these Terms is held to be invalid, illegal, or unenforceable for any reason, such provision shall be eliminated or limited to the minimum extent such that the remaining provisions of these Terms will continue in full force and effect.</p>
                
                <h2 className="text-2xl font-display text-primary-700 mt-10 mb-4">18. Entire Agreement</h2>
                <p>These Terms, together with our Privacy Policy and any other legal notices and agreements published by us, constitute the entire agreement between you and Truvista concerning our Services.</p>
                
                <h2 className="text-2xl font-display text-primary-700 mt-10 mb-4">19. Contact Information</h2>
                <p>If you have any questions about these Terms, please contact us at:</p>
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

export default TermsOfService; 