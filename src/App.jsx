import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminRoute from './components/auth/AdminRoute';

// Layouts
import MainLayout from './components/layout/MainLayout';

// Pages
import Home from './pages/Home';
import Properties from './pages/Properties';
import PropertyDetail from './pages/PropertyDetail';
import Contact from './pages/Contact';
import About from './pages/About';
import NotFound from './pages/NotFound';
import StyleGuide from './pages/StyleGuide';

// User Pages
import Profile from './pages/User/Profile';
import Shortlist from './pages/User/Shortlist';
import Bookings from './pages/User/Bookings';

// Admin Pages
import AdminDashboard from './pages/Admin/Dashboard';
import AdminProperties from './pages/Admin/Properties';
import AdminBookings from './pages/Admin/Bookings';
import AdminUsers from './pages/Admin/Users';
import AdminSettings from './pages/Admin/Settings';
import CreateProperty from './pages/Admin/CreateProperty';
import EditProperty from './pages/Admin/EditProperty';
import PropertyMediaManagement from './pages/Admin/PropertyMediaManagement';

/**
 * Main App Component
 * Configures routing and global providers
 */
const App = () => {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <Routes>
            {/* Style Guide Route (outside of layouts) */}
            <Route path="/style-guide" element={<StyleGuide />} />
            
            {/* Main layout routes */}
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Home />} />
              <Route path="properties" element={<Properties />} />
              <Route path="properties/:id" element={<PropertyDetail />} />
              <Route path="contact" element={<Contact />} />
              <Route path="about" element={<About />} />
              
              {/* Protected User Routes */}
              <Route 
                path="user/profile" 
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="user/shortlist" 
                element={
                  <ProtectedRoute>
                    <Shortlist />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="user/bookings" 
                element={
                  <ProtectedRoute>
                    <Bookings />
                  </ProtectedRoute>
                } 
              />
              
              <Route path="*" element={<NotFound />} />
            </Route>
            
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminRoute />}>
              <Route index element={<AdminDashboard />} />
              <Route path="properties" element={<AdminProperties />} />
              <Route path="properties/create" element={<CreateProperty />} />
              <Route path="properties/:id/media" element={<PropertyMediaManagement />} />
              <Route path="properties/new" element={<NotFound />} />
              <Route path="properties/:id" element={<EditProperty />} />
              <Route path="properties/:id/edit" element={<EditProperty />} />
              <Route path="bookings" element={<AdminBookings />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>
          </Routes>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
};

export default App;
