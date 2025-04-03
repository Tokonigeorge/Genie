import React from 'react';

interface Step3Props {
  onComplete: () => void;
  onPrevious: () => void;
}

const Step3: React.FC<Step3Props> = ({ onComplete, onPrevious }) => {
  return (
    <div className='space-y-6'>
      <p className='text-[#777777]'>Final step to complete your setup</p>

      <div className='space-y-4'>
        <div className='w-full border border-[#8080801F] rounded-2xl p-3'>
          <label
            htmlFor='timezone'
            className='block text-label text-sm font-medium font-geist mb-1 text-[#949494]'
          >
            Your Timezone
          </label>
          <select
            id='timezone'
            className='w-full text-gray-800 text-sm font-geist border-none outline-none focus:outline-none bg-transparent'
          >
            <option value='UTC-8'>Pacific Time (UTC-8)</option>
            <option value='UTC-5'>Eastern Time (UTC-5)</option>
            <option value='UTC+0'>Greenwich Mean Time (UTC+0)</option>
            <option value='UTC+1'>Central European Time (UTC+1)</option>
          </select>
        </div>

        <div className='w-full border border-[#8080801F] rounded-2xl p-4'>
          <label className='flex items-center space-x-3'>
            <input
              type='checkbox'
              className='form-checkbox h-5 w-5 text-[#292929]'
            />
            <span className='text-gray-700'>
              I agree to receive product updates
            </span>
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
          onClick={onComplete}
          className='w-full cursor-pointer bg-[#292929] text-white p-4 rounded-[90px] font-medium hover:bg-gray-800 font-geist shadow-button'
        >
          Complete Setup
        </button>
      </div>
    </div>
  );
};

export default Step3;
