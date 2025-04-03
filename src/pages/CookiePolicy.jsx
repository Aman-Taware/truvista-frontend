import React from 'react';
import Container from '../components/ui/Container';
import { Section } from '../components/ui/Container';
import { Helmet } from 'react-helmet';

/**
 * Cookie Policy Page Component
 * Displays the cookie policy for the Truvista platform
 */
const CookiePolicy = () => {
  return (
    <>
      <Helmet>
        <title>Cookie Policy | Truvista</title>
        <meta name="description" content="Cookie policy for the Truvista real estate platform" />
      </Helmet>
      
      <div className="pt-20 pb-12 bg-white">
        <Container>
          <Section>
            <div className="max-w-4xl mx-auto">
              <h1 className="text-3xl md:text-4xl font-display font-bold text-primary-800 mb-6">Cookie Policy</h1>
              <p className="text-neutral-700 mb-8">Last Updated: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              
              <div className="prose prose-lg max-w-none">
                <h2 className="text-2xl font-display text-primary-700 mt-10 mb-4">1. Introduction</h2>
                <p>Truvista ("we," "our," or "us") uses cookies and similar technologies on our website and mobile application (collectively, the "Services"). This Cookie Policy explains what cookies are, how we use them, your choices regarding cookies, and further information about cookies.</p>
                <p>This Cookie Policy is part of our Privacy Policy. By using our Services, you consent to our use of cookies as described in this Cookie Policy.</p>
                
                <h2 className="text-2xl font-display text-primary-700 mt-10 mb-4">2. What are Cookies?</h2>
                <p>Cookies are small text files that are stored on your computer, tablet, mobile phone, or other devices when you visit a website. They are widely used to make websites work more efficiently, provide a better user experience, and give information to the owners of the site.</p>
                <p>Cookies can be "first-party cookies" (set by Truvista) or "third-party cookies" (placed by third-party services or websites).</p>
                <p>Cookies can also be classified as "session cookies" (temporary cookies that are erased when you close your browser) or "persistent cookies" (which remain on your device until they expire or you delete them).</p>
                
                <h2 className="text-2xl font-display text-primary-700 mt-10 mb-4">3. Types of Cookies We Use</h2>
                <p>We use the following types of cookies:</p>
                
                <h3 className="text-xl font-display text-primary-600 mt-6 mb-3">3.1 Essential/Necessary Cookies</h3>
                <p>These cookies are necessary for the operation of our Services. They enable core functions such as security, network management, and account access. You cannot opt out of these cookies as the Services cannot function properly without them.</p>
                <ul className="list-disc pl-5 mb-5">
                  <li>Authentication cookies (to identify you when you log in)</li>
                  <li>Security cookies (to support security features and detect malicious activities)</li>
                  <li>Session cookies (to remember information as you navigate from page to page)</li>
                </ul>
                
                <h3 className="text-xl font-display text-primary-600 mt-6 mb-3">3.2 Preferences/Functionality Cookies</h3>
                <p>These cookies allow our Services to remember choices you make and provide enhanced, personalized features. They may be set by us or by third-party providers whose services we have added to our pages.</p>
                <ul className="list-disc pl-5 mb-5">
                  <li>Language preference cookies</li>
                  <li>Location cookies (to show you relevant local content)</li>
                  <li>Customization cookies (to remember your preferences and settings)</li>
                </ul>
                
                <h3 className="text-xl font-display text-primary-600 mt-6 mb-3">3.3 Analytics/Performance Cookies</h3>
                <p>These cookies collect information about how you use our Services, which pages you visit, and if you experience any errors. We use this data to improve our Services and the user experience.</p>
                <ul className="list-disc pl-5 mb-5">
                  <li>Google Analytics cookies</li>
                  <li>Performance monitoring cookies</li>
                  <li>Error management cookies</li>
                </ul>
                
                <h3 className="text-xl font-display text-primary-600 mt-6 mb-3">3.4 Marketing/Advertising Cookies</h3>
                <p>These cookies track your browsing habits and activity to deliver more relevant advertising to you. They may be used to limit the number of times you see an ad or measure the effectiveness of advertising campaigns.</p>
                <ul className="list-disc pl-5 mb-5">
                  <li>Retargeting/advertising cookies</li>
                  <li>Social media cookies</li>
                  <li>Interest-based advertising cookies</li>
                </ul>
                
                <h2 className="text-2xl font-display text-primary-700 mt-10 mb-4">4. Specific Cookies We Use</h2>
                <p>Below is a list of the main cookies that may be used on our Services:</p>
                
                <table className="min-w-full border-collapse mb-5">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 p-3 text-left">Cookie Name</th>
                      <th className="border border-gray-300 p-3 text-left">Purpose</th>
                      <th className="border border-gray-300 p-3 text-left">Duration</th>
                      <th className="border border-gray-300 p-3 text-left">Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 p-3">access_token</td>
                      <td className="border border-gray-300 p-3">Authentication: Used to maintain your signed-in status</td>
                      <td className="border border-gray-300 p-3">1 day</td>
                      <td className="border border-gray-300 p-3">Essential</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-3">refresh_token</td>
                      <td className="border border-gray-300 p-3">Authentication: Used to renew your access token without requiring login</td>
                      <td className="border border-gray-300 p-3">7 days</td>
                      <td className="border border-gray-300 p-3">Essential</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-3">_ga, _gid</td>
                      <td className="border border-gray-300 p-3">Analytics: Used by Google Analytics to distinguish users and sessions</td>
                      <td className="border border-gray-300 p-3">2 years, 24 hours</td>
                      <td className="border border-gray-300 p-3">Analytics</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-3">_fbp</td>
                      <td className="border border-gray-300 p-3">Marketing: Used by Facebook to deliver advertisements</td>
                      <td className="border border-gray-300 p-3">3 months</td>
                      <td className="border border-gray-300 p-3">Marketing</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-3">user_preferences</td>
                      <td className="border border-gray-300 p-3">Functionality: Remembers your search and filter preferences</td>
                      <td className="border border-gray-300 p-3">6 months</td>
                      <td className="border border-gray-300 p-3">Functionality</td>
                    </tr>
                  </tbody>
                </table>
                <p className="text-sm italic">This list is not exhaustive and may be updated periodically.</p>
                
                <h2 className="text-2xl font-display text-primary-700 mt-10 mb-4">5. Third-Party Cookies</h2>
                <p>Some cookies are placed by third parties on our Services. These third parties may include:</p>
                <ul className="list-disc pl-5 mb-5">
                  <li><strong>Analytics providers</strong> (such as Google Analytics) to help us understand how our Services are being used</li>
                  <li><strong>Advertising networks</strong> (such as Google Ads and Facebook) to help us deliver targeted advertisements</li>
                  <li><strong>Social media platforms</strong> (such as Facebook, Twitter, and LinkedIn) when you use their sharing features on our Services</li>
                  <li><strong>Payment processors</strong> to facilitate secure transactions</li>
                  <li><strong>Content delivery networks</strong> to optimize content delivery</li>
                </ul>
                <p>These third parties may use cookies, web beacons, and similar technologies to collect information about your use of our Services and other websites. We do not control these third parties or their use of such technologies.</p>
                
                <h2 className="text-2xl font-display text-primary-700 mt-10 mb-4">6. How to Manage Cookies</h2>
                <p>Most web browsers allow you to manage your cookie preferences. You can:</p>
                <ul className="list-disc pl-5 mb-5">
                  <li><strong>Delete cookies</strong>: You can delete all cookies that are already on your device by clearing the browsing history of your browser.</li>
                  <li><strong>Block cookies</strong>: You can set your browser to block cookies. However, if you block all cookies (including essential cookies), you may not be able to access parts of our Services or they may not function properly.</li>
                  <li><strong>Manage specific cookies</strong>: You can allow or block specific types of cookies in your browser settings.</li>
                </ul>
                
                <h3 className="text-xl font-display text-primary-600 mt-6 mb-3">6.1 Browser Settings</h3>
                <p>Here's how to access cookie settings in popular browsers:</p>
                <ul className="list-disc pl-5 mb-5">
                  <li><strong>Google Chrome</strong>: Settings → Privacy and security → Cookies and other site data</li>
                  <li><strong>Mozilla Firefox</strong>: Options → Privacy & Security → Cookies and Site Data</li>
                  <li><strong>Safari</strong>: Preferences → Privacy → Cookies and website data</li>
                  <li><strong>Microsoft Edge</strong>: Settings → Cookies and site permissions → Cookies and site data</li>
                </ul>
                
                <h3 className="text-xl font-display text-primary-600 mt-6 mb-3">6.2 Opt-Out Options</h3>
                <p>For analytics cookies, you can opt out of Google Analytics by visiting the <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">Google Analytics Opt-out Browser Add-on</a>.</p>
                <p>For advertising cookies, you can opt out of interest-based advertising through:</p>
                <ul className="list-disc pl-5 mb-5">
                  <li><a href="https://www.networkadvertising.org/choices/" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">Network Advertising Initiative (NAI)</a></li>
                  <li><a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">Digital Advertising Alliance (DAA)</a></li>
                  <li><a href="https://youronlinechoices.eu/" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">European Interactive Digital Advertising Alliance (EDAA)</a></li>
                </ul>
                
                <h2 className="text-2xl font-display text-primary-700 mt-10 mb-4">7. Do Not Track Signals</h2>
                <p>Some browsers have a "Do Not Track" feature that signals to websites that you visit that you do not want to have your online activity tracked. Due to the lack of a common understanding of how to interpret the Do Not Track signal, our Services do not currently respond to browser Do Not Track signals.</p>
                
                <h2 className="text-2xl font-display text-primary-700 mt-10 mb-4">8. Updates to this Cookie Policy</h2>
                <p>We may update this Cookie Policy from time to time to reflect changes in technology, regulation, or our business practices. Any changes will be posted on this page with an updated revision date. If we make significant changes, we will notify you through a notice on our Services or by other means.</p>
                
                <h2 className="text-2xl font-display text-primary-700 mt-10 mb-4">9. Contact Us</h2>
                <p>If you have any questions about our use of cookies or this Cookie Policy, please contact us at:</p>
                <p className="mb-1">Truvista Realty</p>
                <p className="mb-1">Email: privacy@truvista.in</p>
                <p className="mb-1">Phone: +91-XXXXXXXXXX</p>
                <p className="mb-5">Address: [Company Address], India</p>
              </div>
            </div>
          </Section>
        </Container>
      </div>
    </>
  );
};

export default CookiePolicy; 