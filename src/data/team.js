// Team data for Our Team section
export const teamData = [
  {
    id: 1,
    name: 'Mohit Gupta',
    role: 'CEO & Founder',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    bio: 'With over 2 years in Truvista, Mohit founded Truvista with a vision to redefine premium property experiences.',
    expertise: ['Luxury Properties', 'Market Analysis', 'Investment Strategy'],
    contact: {
      email: 'sophia@truvista.com',
      phone: '+91 98765 43210',
      linkedin: 'linkedin.com/in/sophiawilliams'
    }
  },
  {
    id: 2,
    name: 'Rajiv Mehta',
    role: 'Chief Sales Officer',
    image: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    bio: 'Rajiv brings 15 years of expertise in premium property sales and has closed some of the most prestigious deals in Pune.',
    expertise: ['Sales Strategy', 'Negotiation', 'Client Relations'],
    contact: {
      email: 'rajiv@truvista.com',
      phone: '+91 98765 43211',
      linkedin: 'linkedin.com/in/rajivmehta'
    }
  },

];

// Get featured team members (can be customized based on needs)
export const getFeaturedTeamMembers = () => {
  return teamData.slice(0, 2); // Return top 4 team members
};

// Get team member by ID
export const getTeamMemberById = (id) => {
  return teamData.find(member => member.id === id);
};

// Get team stats
export const getTeamStats = () => {
  return {
    totalMembers: teamData.length,
    expertise: [
      { name: 'Luxury Properties', count: 3 },
      { name: 'Investment', count: 2 },
      { name: 'Architecture', count: 1 },
      { name: 'Sales', count: 2 }
    ],
    experience: {
      average: 12, // Average years of experience
      total: 48    // Total combined years
    }
  };
}; 