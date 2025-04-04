// ... existing code ...
import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../../components/commons/Logo';
import Footer from '../../components/layouts/Footer';
import emailSentImage from '../../assets/email-sent.png';

const EmailSent: React.FC = () => {
  return (
    <div className='flex min-h-screen w-full flex-col p-10'>
      <div className='mb-8 flex '>
        <Logo />
      </div>

      <div className='flex-grow flex items-center justify-center'>
        <div className='w-full max-w-md text-center'>
          {/* Responsive image */}
          <div className='mb-8 flex justify-center'>
            <img
              src={emailSentImage}
              alt='Email Sent'
              className='w-full md:w-4/5 lg:w-3/4 max-w-2xl'
            />
          </div>

          <h1 className='text-[40px] text-[#333333] font-medium mb-4'>
            You&apos;re almost in!
          </h1>

          <p className='text-[16px] text-[#777777] font-geist mb-8 leading-[24px]'>
            We've sent a magic link to david@geniestudio.ai. Open your email and
            tap the link to log in.
          </p>

          <Link
            to='/login'
            className='inline-block cursor-pointer bg-[#292929] text-white px-18 py-3.5 rounded-[90px] font-medium hover:bg-gray-800 font-geist shadow-button'
          >
            Back to Login
          </Link>
        </div>
      </div>

      <div className='mt-auto'>
        <Footer elements={['Genie Labs. 2025', 'Privacy Policy']} />
      </div>
    </div>
  );
};
export default EmailSent;
