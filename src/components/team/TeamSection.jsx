import React from 'react';
import TeamMember from './TeamMember';
import { getFeaturedTeamMembers, getTeamStats } from '../../data/team';

const TeamSection = () => {
  const teamMembers = getFeaturedTeamMembers();
  const stats = getTeamStats();
  
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Our Expert Team
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Meet the professionals behind Truvista's success. With a combined experience of over {stats.experience.total} years,
            our team is dedicated to providing you with exceptional service and expertise.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {teamMembers.map(member => (
            <TeamMember key={member.id} member={member} />
          ))}
        </div>
        
        <div className="mt-16 bg-white rounded-xl shadow-lg p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <p className="text-purple-800 text-4xl font-bold">{stats.totalMembers}</p>
              <p className="text-gray-600 mt-2">Team Members</p>
            </div>
            
            <div className="text-center">
              <p className="text-purple-800 text-4xl font-bold">{stats.experience.average}+</p>
              <p className="text-gray-600 mt-2">Years Avg. Experience</p>
            </div>
            
            <div className="text-center">
              <p className="text-purple-800 text-4xl font-bold">{stats.expertise.length}</p>
              <p className="text-gray-600 mt-2">Areas of Expertise</p>
            </div>
            
            <div className="text-center">
              <p className="text-purple-800 text-4xl font-bold">100%</p>
              <p className="text-gray-600 mt-2">Client Satisfaction</p>
            </div>
          </div>
        </div>
        
        <div className="mt-12 text-center">
          <a 
            href="/about" 
            className="inline-block bg-purple-800 hover:bg-purple-700 text-white font-medium py-3 px-8 rounded-lg transition-colors duration-300"
          >
            Learn More About Us
          </a>
        </div>
      </div>
    </section>
  );
};

export default TeamSection; 