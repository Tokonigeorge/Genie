import React from 'react';

interface AccessRequestProps {
  domain: string;
}

const AccessRequest: React.FC<AccessRequestProps> = ({ domain }) => {
  return (
    <div className='p-6 bg-white rounded-xl shadow-lg text-center'>
      <h2 className='text-xl font-medium mb-4'>Access Request Sent</h2>
      <p className='text-[#777777] mb-6'>
        We've sent your request to join the organization at {domain}. An
        administrator will review your request shortly.
      </p>
      <div className='animate-pulse'>
        <div className='h-2 bg-gray-200 rounded w-3/4 mx-auto mb-4'></div>
        <div className='h-2 bg-gray-200 rounded w-1/2 mx-auto'></div>
      </div>
    </div>
  );
};

export default AccessRequest;
