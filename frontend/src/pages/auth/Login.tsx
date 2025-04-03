import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/useAuth';
import Footer from '../../components/layouts/Footer';
import Logo from '../../components/commons/Logo';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (email.trim() === '') return;

    login();

    if (isFirstTimeUser) {
      navigate('/email-sent');
    } else {
      navigate('/onboarding');
    }
  };

  return (
    <div className='flex min-h-screen'>
      {/* Left side with form */}
      <div className='w-full md:w-1/2 flex flex-col p-10'>
        {/* Logo at the top */}
        <div className='mb-8 flex justify-center'>
          <Logo />
        </div>

        <div className='flex-grow flex items-center justify-center'>
          <div className='w-full max-w-md'>
            {/* Heading */}
            <h1 className='text-6xl font-medium mb-2 leading-tight text-center'>
              Great work,
              <br />
              on autopilot
            </h1>
            <p className='text-secondary mb-8 text-center font-geist text-[#777777]'>
              AI for getting great work done in no time.
            </p>

            {/* Form */}
            <form onSubmit={handleSubmit}>
              <div className='mb-6'>
                <div className='w-full border border-[#8080801F] rounded-2xl p-3'>
                  <label
                    htmlFor='email'
                    className='block text-label text-sm font-medium font-geist mb-1 text-[#949494]'
                  >
                    Email address
                  </label>
                  <input
                    id='email'
                    type='email'
                    placeholder='Yourname@example.com'
                    className='w-full text-[#CFCFCF] text-sm font-geist border-none outline-none focus:outline-none'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                type='submit'
                className='w-full cursor-pointer bg-[#292929] text-white p-4 rounded-[90px] font-medium hover:bg-gray-800 font-geist shadow-button'
              >
                Create an Account
              </button>
            </form>

            <p className='text-center text-[#777777] mt-6 text-base font-medium font-geist'>
              Already have an account?{' '}
              <Link
                to='/login'
                className='text-[#1F90FF] font-medium font-geist hover:underline'
              >
                Login
              </Link>
            </p>

            {/* Divider */}
            <div className='flex items-center my-6'>
              <div className='flex-grow border-t border-[#F5F5F5]'></div>
              <span className='px-4 text-[#777777] text-base font-medium font-geist'>
                Or
              </span>
              <div className='flex-grow border-t border-[#F5F5F5]'></div>
            </div>

            {/* Google login */}
            <button className='w-full cursor-pointer flex items-center text-[#333333] text-base justify-center p-3 border border-[#8080801F] rounded-[90px] font-geist'>
              <svg
                width='18'
                height='18'
                viewBox='0 0 18 18'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
                className='mr-2'
              >
                <path
                  d='M17.8207 9.21558C17.8207 8.60775 17.7619 7.98031 17.6639 7.39209H9.17383V10.8626H14.0365C13.8404 11.9802 13.1934 12.9606 12.2326 13.5881L15.1345 15.8429C16.8403 14.2547 17.8207 11.941 17.8207 9.21558Z'
                  fill='#4280EF'
                />
                <path
                  d='M9.17383 17.9999C11.6052 17.9999 13.6443 17.196 15.1345 15.8235L12.2326 13.5882C11.4287 14.1372 10.3895 14.4509 9.17383 14.4509C6.82093 14.4509 4.84058 12.8627 4.1151 10.7451L1.13477 13.0392C2.66415 16.0783 5.76213 17.9999 9.17383 17.9999Z'
                  fill='#34A353'
                />
                <path
                  d='M4.11589 10.7255C3.74334 9.60791 3.74334 8.39224 4.11589 7.27462L1.13555 4.96094C-0.138934 7.50991 -0.138934 10.5099 1.13555 13.0392L4.11589 10.7255Z'
                  fill='#F6B704'
                />
                <path
                  d='M9.17383 3.5689C10.4483 3.54929 11.7032 4.03948 12.6247 4.92182L15.1933 2.33363C13.5659 0.804248 11.4091 -0.0192653 9.17383 0.000342207C5.76213 0.000342207 2.66415 1.92187 1.13477 4.96103L4.1151 7.27471C4.84058 5.1375 6.82093 3.5689 9.17383 3.5689Z'
                  fill='#E54335'
                />
              </svg>
              Continue with Google
            </button>
          </div>
        </div>
      </div>

      {/* Right side with background */}
      <div className='hidden md:flex md:w-1/2 md:flex-col md:justify-between'>
        <div className='flex-grow my-4 mx-4 bg-[#F9F9F9] rounded-3xl flex items-end'>
          <div className='p-12  w-full'>
            <Footer />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
