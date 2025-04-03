import React from 'react';
import { Link } from 'react-router-dom';

const EmailSent: React.FC = () => {
  return (
    <div className='flex min-h-screen'>
      <div className='w-full md:w-1/2 flex items-center justify-center p-8'>
        <div className='w-full max-w-md text-center'>
          {/* Logo */}
          <div className='flex justify-center mb-10'>
            <svg
              width='24'
              height='24'
              viewBox='0 0 24 24'
              fill='none'
              xmlns='http://www.w3.org/2000/svg'
            >
              <circle cx='12' cy='12' r='12' fill='#000' />
              <text x='12' y='16' fontSize='14' fill='#fff' textAnchor='middle'>
                G
              </text>
            </svg>
          </div>

          {/* Heading */}
          <h1 className='text-3xl font-bold mb-4'>Check your email</h1>
          <p className='text-gray-600 mb-8'>
            We've sent a password reset link to your email address. Please check
            your inbox and follow the instructions.
          </p>

          {/* Back to login */}
          <div>
            <Link to='/login' className='text-blue-600 hover:underline'>
              Back to Login
            </Link>
          </div>
        </div>
      </div>
      <div className='hidden md:block md:w-1/2 bg-gray-100'></div>
    </div>
  );
};

export default EmailSent;
