import React from 'react';
import Footer from '../../components/layouts/Footer';
import Logo from '../../components/commons/Logo';
import MiniGenieIcon from '../../components/commons/MiniGenieIcon';
const JoinTeam = () => {
  return (
    <div className='flex min-h-screen w-full flex-col p-10 bg-[#F9F9F9] font-geist'>
      <div className='mb-8 flex justify-center'>
        <Logo />
      </div>
      <div className='flex-grow flex flex-col items-cente md:w-xl max-w-xl mx-auto mt-16'>
        <div className='w-full text-center '>
          <h1 className='text-[40px] text-[#333333] font-medium mb-4'>
            Join Your Team
          </h1>
          <p className='text-[16px] text-[#777777] font-geist mb-8 leading-[24px]'>
            Choose a workspace you&apos;ll like to join or create your own.
          </p>
        </div>
        <div className='flex justify-between items-center w-full border p-6 border-[#EBEBEB]  rounded-3xl'>
          <div className='flex items-center gap-2'>
            <div className='bg-black w-10 h-10 rounded-lg'></div>
            <div>
              <p className='text-[#333333] font-medium text-sm'>Mason</p>
              <p className='text-[#949494] font-medium text-xs'>6 Members</p>
            </div>
          </div>
          <button className='px-4 py-1.5 bg-[#292929] text-white rounded-3xl'>
            Request to join
          </button>
        </div>
        <div className='flex justify-between items-center w-full bg-[#F0F0F0] p-6 rounded-3xl mt-3'>
          <div className='flex items-center gap-2'>
            <MiniGenieIcon />
            <p className='text-[#333333] font-medium text-sm'>
              Want to use Genie with a different team?
            </p>
          </div>
          <button className='px-4 py-1.5 bg-white text-[#292929] text-sm font-medium border border-[#EBEBEB] rounded-3xl'>
            Create a new workspace
          </button>
        </div>
      </div>
      <div className='mt-auto'>
        <Footer elements={['Genie Labs. 2025', 'Privacy Policy']} />
      </div>
    </div>
  );
};

export default JoinTeam;
