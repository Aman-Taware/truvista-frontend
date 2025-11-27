/**
 * Data file containing available locations for property search
 */

// List of available locations
export const availableLocations = [
  'Moshi-Dudulgaon',
  'Moshi-Bohradewadi',
  'Charholi',
  'Chikhali',
  'Punawale',
  'Ravet',
  'Wakad',
  'Hinjewadi',
  'Baner',
  'Balewadi',
  'Spine-City'
];

// Location data for Pune real estate properties
export const locationData = {
  'Baner': {
    title: 'Baner',
    description: 'A premium suburb known for its upscale residential complexes and proximity to IT hubs.',
    image: 'https://images.unsplash.com/photo-1600585154363-67eb9e2e2099?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    featured: true,
    stats: {
      propertyCount: 42,
      avgPrice: 6500000,
      growth: 8.5
    }
  },
  'Wakad': {
    title: 'Wakad',
    description: 'A rapidly developing area with excellent connectivity and modern amenities.',
    image: 'https://images.unsplash.com/photo-1448630360428-65456885c650?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    featured: true,
    stats: {
      propertyCount: 36,
      avgPrice: 7800000,
      growth: 9.2
    }
  },
  'Hinjewadi': {
    title: 'Hinjewadi',
    description: 'IT hub with world-class infrastructure and luxury residential options.',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    featured: true,
    stats: {
      propertyCount: 54,
      avgPrice: 8500000,
      growth: 10.5
    }
  },
  'Balewadi': {
    title: 'Balewadi',
    description: 'Modern neighborhood with sports infrastructure and premium housing.',
    image: 'https://images.unsplash.com/photo-1460317442991-0ec209397118?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    featured: false,
    stats: {
      propertyCount: 29,
      avgPrice: 5900000,
      growth: 7.8
    }
  },
  'Moshi-Dudulgaon': {
    title: 'Moshi-Dudulgaon',
    description: 'Emerging residential area with affordable luxury options.',
    image: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    featured: false,
    stats: {
      propertyCount: 18,
      avgPrice: 3800000,
      growth: 12.5
    }
  },
  'Ravet': {
    title: 'Ravet',
    description: 'Developing area with excellent infrastructure and connectivity.',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    featured: false,
    stats: {
      propertyCount: 24,
      avgPrice: 6200000,
      growth: 8.9
    }
  },
  'Chikhali': {
    title: 'Chikhali',
    description: 'Affordable housing with growing infrastructure and amenities.',
    image: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    featured: false,
    stats: {
      propertyCount: 15,
      avgPrice: 3200000,
      growth: 11.2
    }
  },
  'Punawale': {
    title: 'Punawale',
    description: 'Growing neighborhood with excellent connectivity to IT hubs.',
    image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    featured: false,
    stats: {
      propertyCount: 22,
      avgPrice: 5500000,
      growth: 9.5
    }
  },
  'Spine-City': {
    title: 'Spine-City',
    description: 'A well-planned and developing residential and commercial hub.',
    image: 'https://images.unsplash.com/photo-1582463229552-35a9d9402c61?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    featured: false,
    stats: {
      propertyCount: 20,
      avgPrice: 4800000,
      growth: 10.1
    }
  }
};

// Helper functions for locations data
export const getLocationsList = () => {
  return Object.keys(locationData).map(key => ({
    value: key,
    label: locationData[key].title,
    description: locationData[key].description
  }));
};

export const getFeaturedLocations = () => {
  return Object.keys(locationData)
    .filter(key => locationData[key].featured)
    .map(key => ({
      ...locationData[key],
      id: key
    }));
};

export const getLocationStats = () => {
  const totalProperties = Object.values(locationData).reduce(
    (sum, location) => sum + location.stats.propertyCount, 
    0
  );
  
  const avgGrowth = Object.values(locationData).reduce(
    (sum, location) => sum + location.stats.growth, 
    0
  ) / Object.keys(locationData).length;
  
  return {
    totalLocations: Object.keys(locationData).length,
    totalProperties,
    avgGrowth: parseFloat(avgGrowth.toFixed(1)),
    featuredLocations: Object.values(locationData).filter(loc => loc.featured).length
  };
};

export default availableLocations; 