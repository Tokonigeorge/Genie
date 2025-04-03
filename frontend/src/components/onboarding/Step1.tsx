import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';

interface Step1Props {
  onNext: () => void;
}

const Step1: React.FC<Step1Props> = ({ onNext }) => {
  const [termsAgreed, setTermsAgreed] = useState(true);

  return (
    <div className='space-y-10'>
      <p className='text-[#777777] text-sm leading-5 -mt-2'>
        Drop your first and last name below—just so we know what to call you.
      </p>

      <div className='space-y-4'>
        <div className='w-full border border-[#8080801F] rounded-2xl p-3'>
          <label
            htmlFor='firstName'
            className='block text-label text-sm font-medium font-geist mb-1 text-[#949494]'
          >
            First name
          </label>
          <input
            id='firstName'
            type='text'
            placeholder='Enter your first name'
            className='w-full text-gray-800 text-sm font-geist border-none outline-none focus:outline-none'
            required
          />
        </div>

        <div className='w-full border border-[#8080801F] rounded-2xl p-3'>
          <label
            htmlFor='lastName'
            className='block text-label text-sm font-medium font-geist mb-1 text-[#949494]'
          >
            Last name
          </label>
          <input
            id='lastName'
            type='text'
            placeholder='Enter your last name'
            className='w-full text-gray-800 text-sm font-geist border-none outline-none focus:outline-none'
          />
        </div>
      </div>

      <div className='space-y-4'>
        <div className='flex items-center justify-between gap-x-4'>
          <p className='text-sm text-[#777777]'>
            Please confirm that you've read and agree to our{' '}
            <span className='text-blue-500'>Terms and Conditions</span> and{' '}
            <span className='text-blue-500'>Privacy Policy</span>.
          </p>
          <div
            className={`relative inline-block w-12 h-6 rounded-full cursor-pointer transition-colors duration-200 ease-in-out ${
              termsAgreed ? 'bg-[#292929]' : 'bg-gray-300'
            }`}
            onClick={() => setTermsAgreed(!termsAgreed)}
          >
            <span
              className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 ease-in-out ${
                termsAgreed ? 'transform translate-x-6' : ''
              }`}
            />
          </div>
        </div>

        <button
          onClick={onNext}
          className='w-full cursor-pointer bg-[#292929] text-white p-4 rounded-[90px] font-medium hover:bg-gray-800 font-geist shadow-button flex items-center justify-center'
        >
          Continue <ArrowRight className='ml-2 h-4 w-4' />
        </button>
      </div>
    </div>
  );
};

export default Step1;
