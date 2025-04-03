import React from 'react';

interface Step2Props {
  onNext: () => void;
  onPrevious: () => void;
}

const Step2: React.FC<Step2Props> = ({ onNext, onPrevious }) => {
  return (
    <div className='space-y-6'>
      <p className='text-[#777777]'>Help us understand how you'll use Genie</p>

      <div className='space-y-4'>
        <div className='w-full border border-[#8080801F] rounded-2xl p-4'>
          <label className='flex items-center space-x-3'>
            <input
              type='checkbox'
              className='form-checkbox h-5 w-5 text-[#292929]'
            />
            <span className='text-gray-700'>Content Creation</span>
          </label>
        </div>

        <div className='w-full border border-[#8080801F] rounded-2xl p-4'>
          <label className='flex items-center space-x-3'>
            <input
              type='checkbox'
              className='form-checkbox h-5 w-5 text-[#292929]'
            />
            <span className='text-gray-700'>Productivity & Organization</span>
          </label>
        </div>

        <div className='w-full border border-[#8080801F] rounded-2xl p-4'>
          <label className='flex items-center space-x-3'>
            <input
              type='checkbox'
              className='form-checkbox h-5 w-5 text-[#292929]'
            />
            <span className='text-gray-700'>Research & Learning</span>
          </label>
        </div>

        <div className='w-full border border-[#8080801F] rounded-2xl p-4'>
          <label className='flex items-center space-x-3'>
            <input
              type='checkbox'
              className='form-checkbox h-5 w-5 text-[#292929]'
            />
            <span className='text-gray-700'>Data Analysis</span>
          </label>
        </div>
      </div>

      <div className='flex space-x-4'>
        <button
          onClick={onPrevious}
          className='w-full cursor-pointer bg-transparent border border-[#292929] text-[#292929] p-4 rounded-[90px] font-medium hover:bg-gray-100 font-geist'
        >
          Back
        </button>
        <button
          onClick={onNext}
          className='w-full cursor-pointer bg-[#292929] text-white p-4 rounded-[90px] font-medium hover:bg-gray-800 font-geist shadow-button'
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default Step2;
