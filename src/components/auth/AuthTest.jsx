import React, { useState } from 'react';
import AuthModal from './AuthModal';

const AuthTest = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Authentication Test</h1>
      <p className="mb-6">
        Click the button below to open the authentication modal.
      </p>
      <button 
        className="bg-purple-700 text-white px-4 py-2 rounded-md hover:bg-purple-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
        onClick={openModal}
      >
        Open Auth Modal
      </button>
      
      <AuthModal isOpen={isModalOpen} onClose={closeModal} />
    </div>
  );
};

export default AuthTest; 