import { useState, useEffect, useContext } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { NotificationContext } from '../../contexts/NotificationContext';
import adminApi from '../../api/adminApi';

/**
 * Admin Settings Component
 * Allows admin users to manage system settings
 */
const SettingsPage = () => {
  const { showNotification } = useContext(NotificationContext);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // General Settings
  const [generalSettings, setGeneralSettings] = useState({
    siteName: 'Truvista',
    contactEmail: 'support@truvista.com',
    contactPhone: '+1 (123) 456-7890',
    address: '123 Property St, Real Estate City, 12345',
    enableRegistration: true,
    maintenanceMode: false
  });

  // Email Settings
  const [emailSettings, setEmailSettings] = useState({
    smtpHost: '',
    smtpPort: '',
    smtpUsername: '',
    smtpPassword: '',
    fromEmail: 'noreply@truvista.com',
    emailFooter: 'Truvista Real Estate Platform',
    enableEmailNotifications: true
  });

  // Booking Settings
  const [bookingSettings, setBookingSettings] = useState({
    allowGuests: true,
    requireVerification: true,
    maxBookingsPerDay: 10,
    minDaysAdvance: 1,
    maxDaysAdvance: 30,
    availableDays: [1, 2, 3, 4, 5], // Monday to Friday
    startTime: '09:00',
    endTime: '17:00',
    visitDuration: 60 // minutes
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      // In a real application, this would fetch settings from the backend
      // const response = await adminApi.getSystemSettings();
      // setGeneralSettings(response.general);
      // setEmailSettings(response.email);
      // setBookingSettings(response.booking);
      
      // For now, we'll just simulate a delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      showNotification({
        type: 'success',
        message: 'Settings loaded successfully'
      });
    } catch (error) {
      console.error('Error fetching settings:', error);
      showNotification({
        type: 'error',
        message: 'Failed to load settings'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGeneralSettingsChange = (e) => {
    const { name, value, type, checked } = e.target;
    setGeneralSettings({
      ...generalSettings,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleEmailSettingsChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEmailSettings({
      ...emailSettings,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleBookingSettingsChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'availableDays') {
      // Handle the multi-select days
      const dayNumber = parseInt(value);
      const newDays = [...bookingSettings.availableDays];
      
      if (checked) {
        if (!newDays.includes(dayNumber)) {
          newDays.push(dayNumber);
        }
      } else {
        const index = newDays.indexOf(dayNumber);
        if (index !== -1) {
          newDays.splice(index, 1);
        }
      }
      
      setBookingSettings({
        ...bookingSettings,
        availableDays: newDays
      });
    } else {
      setBookingSettings({
        ...bookingSettings,
        [name]: type === 'checkbox' ? checked : type === 'number' ? parseInt(value) : value
      });
    }
  };

  const saveSettings = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      // In a real application, this would save settings to the backend
      // await adminApi.saveSystemSettings({
      //   general: generalSettings,
      //   email: emailSettings,
      //   booking: bookingSettings
      // });
      
      // For now, we'll just simulate a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      showNotification({
        type: 'success',
        message: 'Settings saved successfully'
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      showNotification({
        type: 'error',
        message: 'Failed to save settings'
      });
    } finally {
      setSaving(false);
    }
  };

  const getDayName = (dayNumber) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayNumber] || '';
  };

  return (
    <AdminLayout>
      <div className="px-4 sm:px-6 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">System Settings</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your application settings and configurations
          </p>
        </div>

        {loading ? (
          <div className="bg-white shadow rounded-lg p-6">
            <div className="text-center text-gray-500">Loading settings...</div>
          </div>
        ) : (
          <form onSubmit={saveSettings}>
            {/* General Settings */}
            <div className="bg-white shadow rounded-lg p-6 mb-6">
              <h2 className="text-lg font-medium text-gray-700 mb-4">General Settings</h2>
              
              <div className="grid grid-cols-1 gap-y-4 gap-x-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="siteName" className="block text-sm font-medium text-gray-700">
                    Site Name
                  </label>
                  <input
                    type="text"
                    id="siteName"
                    name="siteName"
                    value={generalSettings.siteName}
                    onChange={handleGeneralSettingsChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    id="contactEmail"
                    name="contactEmail"
                    value={generalSettings.contactEmail}
                    onChange={handleGeneralSettingsChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700">
                    Contact Phone
                  </label>
                  <input
                    type="text"
                    id="contactPhone"
                    name="contactPhone"
                    value={generalSettings.contactPhone}
                    onChange={handleGeneralSettingsChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                    Office Address
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={generalSettings.address}
                    onChange={handleGeneralSettingsChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>
              
              <div className="mt-4 space-y-4">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="enableRegistration"
                      name="enableRegistration"
                      type="checkbox"
                      checked={generalSettings.enableRegistration}
                      onChange={handleGeneralSettingsChange}
                      className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="enableRegistration" className="font-medium text-gray-700">
                      Enable User Registration
                    </label>
                    <p className="text-gray-500">Allow new users to register on the platform</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="maintenanceMode"
                      name="maintenanceMode"
                      type="checkbox"
                      checked={generalSettings.maintenanceMode}
                      onChange={handleGeneralSettingsChange}
                      className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="maintenanceMode" className="font-medium text-gray-700">
                      Maintenance Mode
                    </label>
                    <p className="text-gray-500">Put the website in maintenance mode (only admins can access)</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Email Settings */}
            <div className="bg-white shadow rounded-lg p-6 mb-6">
              <h2 className="text-lg font-medium text-gray-700 mb-4">Email Settings</h2>
              
              <div className="grid grid-cols-1 gap-y-4 gap-x-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="smtpHost" className="block text-sm font-medium text-gray-700">
                    SMTP Host
                  </label>
                  <input
                    type="text"
                    id="smtpHost"
                    name="smtpHost"
                    value={emailSettings.smtpHost}
                    onChange={handleEmailSettingsChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="smtpPort" className="block text-sm font-medium text-gray-700">
                    SMTP Port
                  </label>
                  <input
                    type="text"
                    id="smtpPort"
                    name="smtpPort"
                    value={emailSettings.smtpPort}
                    onChange={handleEmailSettingsChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="smtpUsername" className="block text-sm font-medium text-gray-700">
                    SMTP Username
                  </label>
                  <input
                    type="text"
                    id="smtpUsername"
                    name="smtpUsername"
                    value={emailSettings.smtpUsername}
                    onChange={handleEmailSettingsChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="smtpPassword" className="block text-sm font-medium text-gray-700">
                    SMTP Password
                  </label>
                  <input
                    type="password"
                    id="smtpPassword"
                    name="smtpPassword"
                    value={emailSettings.smtpPassword}
                    onChange={handleEmailSettingsChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="fromEmail" className="block text-sm font-medium text-gray-700">
                    From Email
                  </label>
                  <input
                    type="email"
                    id="fromEmail"
                    name="fromEmail"
                    value={emailSettings.fromEmail}
                    onChange={handleEmailSettingsChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="emailFooter" className="block text-sm font-medium text-gray-700">
                    Email Footer Text
                  </label>
                  <input
                    type="text"
                    id="emailFooter"
                    name="emailFooter"
                    value={emailSettings.emailFooter}
                    onChange={handleEmailSettingsChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>
              
              <div className="mt-4">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="enableEmailNotifications"
                      name="enableEmailNotifications"
                      type="checkbox"
                      checked={emailSettings.enableEmailNotifications}
                      onChange={handleEmailSettingsChange}
                      className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="enableEmailNotifications" className="font-medium text-gray-700">
                      Enable Email Notifications
                    </label>
                    <p className="text-gray-500">Send email notifications for bookings, user registration, etc.</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Booking Settings */}
            <div className="bg-white shadow rounded-lg p-6 mb-6">
              <h2 className="text-lg font-medium text-gray-700 mb-4">Booking Settings</h2>
              
              <div className="grid grid-cols-1 gap-y-4 gap-x-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="maxBookingsPerDay" className="block text-sm font-medium text-gray-700">
                    Max Bookings Per Day
                  </label>
                  <input
                    type="number"
                    id="maxBookingsPerDay"
                    name="maxBookingsPerDay"
                    min="1"
                    max="50"
                    value={bookingSettings.maxBookingsPerDay}
                    onChange={handleBookingSettingsChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="visitDuration" className="block text-sm font-medium text-gray-700">
                    Visit Duration (minutes)
                  </label>
                  <input
                    type="number"
                    id="visitDuration"
                    name="visitDuration"
                    min="15"
                    max="120"
                    step="15"
                    value={bookingSettings.visitDuration}
                    onChange={handleBookingSettingsChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="minDaysAdvance" className="block text-sm font-medium text-gray-700">
                    Minimum Days in Advance
                  </label>
                  <input
                    type="number"
                    id="minDaysAdvance"
                    name="minDaysAdvance"
                    min="0"
                    max="30"
                    value={bookingSettings.minDaysAdvance}
                    onChange={handleBookingSettingsChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="maxDaysAdvance" className="block text-sm font-medium text-gray-700">
                    Maximum Days in Advance
                  </label>
                  <input
                    type="number"
                    id="maxDaysAdvance"
                    name="maxDaysAdvance"
                    min="1"
                    max="90"
                    value={bookingSettings.maxDaysAdvance}
                    onChange={handleBookingSettingsChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">
                    Start Time
                  </label>
                  <input
                    type="time"
                    id="startTime"
                    name="startTime"
                    value={bookingSettings.startTime}
                    onChange={handleBookingSettingsChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">
                    End Time
                  </label>
                  <input
                    type="time"
                    id="endTime"
                    name="endTime"
                    value={bookingSettings.endTime}
                    onChange={handleBookingSettingsChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>
              
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Available Days
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[0, 1, 2, 3, 4, 5, 6].map((day) => (
                    <div key={day} className="flex items-center">
                      <input
                        id={`day-${day}`}
                        name="availableDays"
                        type="checkbox"
                        value={day}
                        checked={bookingSettings.availableDays.includes(day)}
                        onChange={handleBookingSettingsChange}
                        className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                      />
                      <label htmlFor={`day-${day}`} className="ml-2 text-sm text-gray-700">
                        {getDayName(day)}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mt-4 space-y-4">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="allowGuests"
                      name="allowGuests"
                      type="checkbox"
                      checked={bookingSettings.allowGuests}
                      onChange={handleBookingSettingsChange}
                      className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="allowGuests" className="font-medium text-gray-700">
                      Allow Guest Bookings
                    </label>
                    <p className="text-gray-500">Let unregistered users make bookings</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="requireVerification"
                      name="requireVerification"
                      type="checkbox"
                      checked={bookingSettings.requireVerification}
                      onChange={handleBookingSettingsChange}
                      className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="requireVerification" className="font-medium text-gray-700">
                      Require Phone Verification
                    </label>
                    <p className="text-gray-500">Require phone verification for bookings</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Action buttons */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={fetchSettings}
                disabled={loading || saving}
                className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Reset
              </button>
              <button
                type="submit"
                disabled={loading || saving}
                className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {saving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </form>
        )}
      </div>
    </AdminLayout>
  );
};

export default SettingsPage; 