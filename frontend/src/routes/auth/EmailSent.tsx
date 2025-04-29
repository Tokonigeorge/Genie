import React from 'react';
import { useLoaderData, Link } from 'react-router-dom';
import Logo from '../../components/commons/Logo';
import Footer from '../../components/layouts/Footer';
import emailSentImage from '../../assets/email-sent.png';

// Loader to get email from query string
export function loader({ request }: { request: Request }) {
  const url = new URL(request.url);
  const email = url.searchParams.get('email');
  return { email };
}

const EmailSent: React.FC = () => {
  const { email } = useLoaderData() as { email?: string };

  return (
    <div className='flex min-h-screen w-full flex-col p-10 bg-[#F9F9F9]'>
      <div className='mb-8 flex justify-center'>
        <Logo />
      </div>
      <div className='flex-grow flex items-center justify-center'>
        <div className='w-full max-w-xl text-center '>
          <div className='mb-8 flex justify-center h-80 w-full bg-white rounded-3xl'>
            {/* <img
              src={emailSentImage}
              alt='Email Sent'
              className='w-full md:w-4/5 lg:w-3/4 max-w-2xl'
            /> */}
          </div>
          <h1 className='text-[40px] text-[#333333] font-medium mb-4'>
            You&apos;re almost in!
          </h1>
          <p className='text-[16px] text-[#777777] font-geist mb-8 leading-[24px]'>
            We&apos;ve sent a magic link to {email || 'your email'}. Open your
            email and tap the link to log in.
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
