import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { NotificationContext } from '../../contexts/NotificationContext';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import PropertyCard from '../../components/property/PropertyCard';

const UserDashboard = () => {
  const { user } = useContext(AuthContext);
  const { showNotification } = useContext(NotificationContext);
  
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [recentShortlist, setRecentShortlist] = useState([]);
  const [suggestedProperties, setSuggestedProperties] = useState([]);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // In a real application, this would be multiple API calls
        // const statsResponse = await userApi.getDashboardStats();
        // const bookingsResponse = await bookingApi.getBookings({ limit: 3, status: 'CONFIRMED' });
        // const shortlistResponse = await shortlistApi.getShortlist({ limit: 2 });
        // const suggestedResponse = await propertyApi.getSuggested({ limit: 3 });
        
        // Simulate API calls with mock data
        setTimeout(() => {
          // Mock stats data
          setStats({
            totalBookings: 5,
            upcomingVisits: 2,
            completedVisits: 3,
            shortlistedProperties: 7,
          });
          
          // Mock upcoming bookings
          setUpcomingBookings([
            {
              id: 'bk1',
              propertyId: 1,
              propertyName: 'Luxury Villa in Greenwood',
              location: 'Bangalore, Karnataka',
              visitDate: '2023-06-15T10:30:00',
              status: 'CONFIRMED',
            },
            {
              id: 'bk2',
              propertyId: 2,
              propertyName: 'Modern Apartment in City Center',
              location: 'Mumbai, Maharashtra',
              visitDate: '2023-06-20T14:00:00',
              status: 'CONFIRMED',
            }
          ]);
          
          // Mock recent shortlist
          setRecentShortlist([
            {
              id: 1,
              name: 'Luxury Villa in Greenwood',
              location: 'Bangalore, Karnataka',
              minPrice: 15000000,
              maxPrice: 18000000,
              imageUrl: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=80',
              flatTypes: ['3 BHK', '4 BHK'],
              possessionDate: '2024-03-31',
              workDone: '85%',
              status: 'Nearing Possession',
              isFeatured: false
            },
            {
              id: 2,
              name: 'Modern Apartment in City Center',
              location: 'Mumbai, Maharashtra',
              minPrice: 9000000,
              maxPrice: 11000000,
              imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=80',
              flatTypes: ['2 BHK', '3 BHK'],
              possessionDate: '2023-12-31',
              workDone: '100%',
              status: 'Ready to Move',
              isFeatured: true
            }
          ]);
          
          // Mock suggested properties
          setSuggestedProperties([
            {
              id: 3,
              name: 'Riverside Apartment Complex',
              location: 'Pune, Maharashtra',
              minPrice: 7500000,
              maxPrice: 9500000,
              imageUrl: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=80',
              flatTypes: ['2 BHK', '3 BHK'],
              possessionDate: '2024-06-30',
              workDone: '70%',
              status: 'Under Construction',
              isFeatured: false
            },
            {
              id: 4,
              name: 'Garden View Villa',
              location: 'Hyderabad, Telangana',
              minPrice: 12000000,
              maxPrice: 14000000,
              imageUrl: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=80',
              flatTypes: ['3 BHK', '4 BHK'],
              possessionDate: '2023-12-31',
              workDone: '90%',
              status: 'Nearing Possession',
              isFeatured: false
            },
            {
              id: 5,
              name: 'Downtown Luxury Apartment',
              location: 'Chennai, Tamil Nadu',
              minPrice: 8500000,
              maxPrice: 10000000,
              imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=80',
              flatTypes: ['2 BHK', '3 BHK'],
              possessionDate: '2023-09-30',
              workDone: '100%',
              status: 'Ready to Move',
              isFeatured: true
            }
          ]);
          
          setLoading(false);
        }, 1000);
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        showNotification({
          type: 'error',
          message: 'Failed to load dashboard data'
        });
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [showNotification]);

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };
  
  const handleToggleShortlist = async (propertyId) => {
    try {
      // In a real application, we would call the API
      // If the property is already shortlisted, remove it
      // If not, add it to shortlist
      
      // For demo, just update state
      if (recentShortlist.some(p => p.id === propertyId)) {
        setRecentShortlist(prev => prev.filter(p => p.id !== propertyId));
        showNotification({
          type: 'success',
          message: 'Property removed from shortlist'
        });
      } else {
        // Find property in suggested and add to shortlist
        const property = suggestedProperties.find(p => p.id === propertyId);
        if (property) {
          setSuggestedProperties(prev => 
            prev.map(p => p.id === propertyId ? {...p, isShortlisted: true} : p)
          );
          showNotification({
            type: 'success',
            message: 'Property added to shortlist'
          });
        }
      }
    } catch (error) {
      console.error('Error toggling shortlist:', error);
      showNotification({
        type: 'error',
        message: 'Failed to update shortlist'
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-display font-bold">Welcome back, {user?.name || 'User'}</h1>
        <Link to="/profile/edit">
          <Button variant="outline" size="sm">
            Edit Profile
          </Button>
        </Link>
      </div>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <div className="bg-white rounded-lg shadow-md p-6 flex flex-col">
          <span className="text-neutral-500 text-sm">Total Bookings</span>
          <span className="text-3xl font-bold mt-2">{stats.totalBookings}</span>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 flex flex-col">
          <span className="text-neutral-500 text-sm">Upcoming Visits</span>
          <span className="text-3xl font-bold mt-2">{stats.upcomingVisits}</span>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 flex flex-col">
          <span className="text-neutral-500 text-sm">Completed Visits</span>
          <span className="text-3xl font-bold mt-2">{stats.completedVisits}</span>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 flex flex-col">
          <span className="text-neutral-500 text-sm">Shortlisted Properties</span>
          <span className="text-3xl font-bold mt-2">{stats.shortlistedProperties}</span>
        </div>
      </div>
      
      {/* Upcoming Visits */}
      <section className="mb-10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-display font-semibold">Upcoming Visits</h2>
          <Link to="/bookings" className="text-primary-600 hover:text-primary-700 font-medium">
            View All
          </Link>
        </div>
        
        {upcomingBookings.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-neutral-600 mb-4">You don't have any upcoming property visits.</p>
            <Link to="/search">
              <Button>Browse Properties</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {upcomingBookings.map(booking => (
              <div key={booking.id} className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-semibold mb-2">{booking.propertyName}</h3>
                <p className="text-neutral-600 mb-4">{booking.location}</p>
                <div className="flex items-center text-neutral-700 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>{formatDate(booking.visitDate)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800">
                    {booking.status}
                  </span>
                  <Link to={`/property/${booking.propertyId}`}>
                    <Button variant="outline" size="sm">
                      View Property
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
      
      {/* Shortlisted Properties */}
      <section className="mb-10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-display font-semibold">Recently Shortlisted</h2>
          <Link to="/shortlist" className="text-primary-600 hover:text-primary-700 font-medium">
            View All
          </Link>
        </div>
        
        {recentShortlist.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-neutral-600 mb-4">You haven't shortlisted any properties yet.</p>
            <Link to="/search">
              <Button>Browse Properties</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentShortlist.map(property => (
              <PropertyCard
                key={property.id}
                property={property}
                showShortlistButton={true}
                onShortlistToggle={handleToggleShortlist}
              />
            ))}
          </div>
        )}
      </section>
      
      {/* Suggested Properties */}
      <section>
        <div className="mb-6">
          <h2 className="text-2xl font-display font-semibold">Recommended For You</h2>
          <p className="text-neutral-600">Based on your preferences and history</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {suggestedProperties.map(property => (
            <PropertyCard
              key={property.id}
              property={property}
              showShortlistButton={true}
              onShortlistToggle={handleToggleShortlist}
            />
          ))}
        </div>
      </section>
    </div>
  );
};

export default UserDashboard; 