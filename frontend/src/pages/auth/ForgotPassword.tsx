import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/email-sent');
  };

  return (
    <div className='flex min-h-screen'>
      <div className='w-full md:w-1/2 flex items-center justify-center p-8'>
        <div className='w-full max-w-md'>
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
          <h1 className='text-3xl font-bold mb-2'>Reset password</h1>
          <p className='text-gray-600 mb-8'>
            Enter your email to receive a reset link
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className='mb-6'>
              <input
                type='email'
                placeholder='Email address'
                className='w-full p-3 border border-gray-300 rounded'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <button
              type='submit'
              className='w-full bg-black text-white p-3 rounded font-medium hover:bg-gray-800'
            >
              Send Reset Link
            </button>
          </form>

          {/* Back to login */}
          <p className='text-center mt-4 text-sm'>
            <Link to='/login' className='text-blue-600 hover:underline'>
              Back to Login
            </Link>
          </p>
        </div>
      </div>
      <div className='hidden md:block md:w-1/2 bg-gray-100'></div>
    </div>
  );
};

export default ForgotPassword;
