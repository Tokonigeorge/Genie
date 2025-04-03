import React from 'react';

interface Step2Props {
  onNext: () => void;
  onPrevious: () => void;
}

const Step2: React.FC<Step2Props> = ({ onNext, onPrevious }) => {
  return (
    <div className='space-y-6'>
      <p className='text-[#777777] text-sm leading-5 -mt-2'>
        Upload your logo and fill in your company details—we will set you up
        right away.
      </p>

      <div className='flex items-center space-x-4 mb-6'>
        <div className='h-16 w-16 rounded-xl bg-[#F0F0F0] flex items-center justify-center'>
          {/* Image placeholder */}
        </div>
        <div className='space-y-2'>
          <p className='text-[#949494] text-sm leading-5'>Company Logo</p>
          <button className='border border-[#8080801F] font-semibold rounded-4xl  px-8 py-1.5 text-[#333333] text-sm leading-5 bg-white'>
            Upload
          </button>
        </div>
      </div>

      <div className='space-y-4'>
        <div className='w-full border border-[#8080801F] rounded-2xl p-3 focus-within:border-[#1F90FF] focus-within:shadow-[0_0_0_4px_#1F90FF40] transition-all'>
          <label
            htmlFor='companyName'
            className='block text-sm font-medium font-geist mb-1 text-[#949494] group-focus-within:text-[#1F90FF] peer-focus:text-[#1F90FF]'
          >
            Company name
          </label>
          <input
            id='companyName'
            type='text'
            placeholder='Example Company Inc'
            className='w-full text-[#333333] text-sm font-geist border-none outline-none focus:outline-none'
          />
        </div>

        <div className='w-full border border-[#8080801F] rounded-2xl p-3 focus-within:border-[#1F90FF] focus-within:shadow-[0_0_0_4px_#1F90FF40] transition-all'>
          <label
            htmlFor='workspaceUrl'
            className='block text-sm font-medium font-geist mb-1 text-[#949494] group-focus-within:text-[#1F90FF] peer-focus:text-[#1F90FF]'
          >
            Workspace URL
          </label>
          <div className='flex items-center'>
            <span className='text-[#777777] text-sm font-geist'>
              app.genie/ai/
            </span>
            <input
              id='workspaceUrl'
              type='text'
              placeholder='exampleco'
              className='flex-1 text-[#333333] text-sm font-geist border-none outline-none focus:outline-none'
            />
          </div>
        </div>
      </div>

      <div className='flex space-x-4 mt-8'>
        <button
          onClick={onPrevious}
          className='w-full cursor-pointer bg-transparent border border-[#8080801F] text-[#292929] p-4 rounded-[90px] font-medium hover:bg-gray-100 font-geist'
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
