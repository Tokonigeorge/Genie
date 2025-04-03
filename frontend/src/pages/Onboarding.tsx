import React from 'react';
import { useNavigate } from 'react-router-dom';

const Onboarding: React.FC = () => {
  const navigate = useNavigate();

  const handleComplete = () => {
    navigate('/');
  };

  return (
    <div className='p-8 max-w-2xl mx-auto'>
      <h1 className='text-2xl font-bold mb-4'>Welcome to Genie</h1>
      <p className='mb-6'>Complete your onboarding to get started</p>

      {/* Simplified onboarding steps */}
      <div className='space-y-6 mb-8'>
        <div className='p-4 border rounded'>
          <h2 className='font-bold'>Step 1: Personalize your experience</h2>
          <p className='text-gray-600'>Tell us about your preferences</p>
        </div>

        <div className='p-4 border rounded'>
          <h2 className='font-bold'>Step 2: Connect your accounts</h2>
          <p className='text-gray-600'>Link your existing services</p>
        </div>

        <div className='p-4 border rounded'>
          <h2 className='font-bold'>Step 3: Set your goals</h2>
          <p className='text-gray-600'>What do you want to accomplish?</p>
        </div>
      </div>

      <button
        onClick={handleComplete}
        className='w-full bg-black text-white p-3 rounded font-medium hover:bg-gray-800'
      >
        Complete Onboarding
      </button>
    </div>
  );
};

export default Onboarding;
