import React from 'react';
import { useAuth } from '../contexts/useAuth';

const Dashboard: React.FC = () => {
  const { logout } = useAuth();

  return (
    <div className='p-8'>
      <h1 className='text-2xl font-bold mb-4'>Dashboard</h1>
      <p className='mb-4'>Welcome to your dashboard!</p>
      <button
        onClick={logout}
        className='bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600'
      >
        Logout
      </button>
    </div>
  );
};

export default Dashboard;
