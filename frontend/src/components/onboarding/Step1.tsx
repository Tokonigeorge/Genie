import React from 'react';

interface Step1Props {
  onNext: () => void;
}

const Step1: React.FC<Step1Props> = ({ onNext }) => {
  return (
    <div className='space-y-6'>
      <p className='text-[#777777]'>
        Let's get your account set up so you can get the most out of Genie.
      </p>

      <div className='space-y-4'>
        <div className='w-full border border-[#8080801F] rounded-2xl p-3'>
          <label
            htmlFor='name'
            className='block text-label text-sm font-medium font-geist mb-1 text-[#949494]'
          >
            Full Name
          </label>
          <input
            id='name'
            type='text'
            placeholder='Your name'
            className='w-full text-gray-800 text-sm font-geist border-none outline-none focus:outline-none'
            required
          />
        </div>

        <div className='w-full border border-[#8080801F] rounded-2xl p-3'>
          <label
            htmlFor='jobTitle'
            className='block text-label text-sm font-medium font-geist mb-1 text-[#949494]'
          >
            Job Title
          </label>
          <input
            id='jobTitle'
            type='text'
            placeholder='Your job title'
            className='w-full text-gray-800 text-sm font-geist border-none outline-none focus:outline-none'
          />
        </div>
      </div>

      <button
        onClick={onNext}
        className='w-full cursor-pointer bg-[#292929] text-white p-4 rounded-[90px] font-medium hover:bg-gray-800 font-geist shadow-button'
      >
        Continue
      </button>
    </div>
  );
};

export default Step1;
