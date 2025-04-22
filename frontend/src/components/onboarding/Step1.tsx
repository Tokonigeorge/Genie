import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { step1Schema } from '../../utils/onboardingValidation';
interface Step1Props {
  onNext: (data: z.infer<typeof step1Schema>) => void;
}
type FormData = z.infer<typeof step1Schema>;

const Step1: React.FC<Step1Props> = ({ onNext }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      termsAgreed: true,
    },
  });

  const termsAgreed = watch('termsAgreed');

  const onSubmit = (data: FormData) => {
    console.log(data);
    onNext(data);
  };

  return (
    <div className='space-y-10'>
      <p className='text-[#777777] text-sm leading-5 -mt-2'>
        Drop your first and last name below—just so we know what to call you.
      </p>
      <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
        <div className='space-y-4'>
          <div className='group w-full border border-[#8080801F] rounded-2xl p-3 focus-within:border-[#1F90FF] focus-within:shadow-[0_0_0_4px_#1F90FF40] transition-all'>
            <label
              htmlFor='firstName'
              className='block text-label text-sm font-medium font-geist mb-1 text-[#949494] group-focus-within:text-[#1F90FF]'
            >
              First name
            </label>
            <input
              id='firstName'
              {...register('firstName')}
              type='text'
              placeholder='Enter your first name'
              className='w-full text-gray-800 text-sm font-geist border-none outline-none focus:outline-none'
            />
          </div>
          {errors.firstName && (
            <p className='text-red-500 text-xs -mt-1'>
              {errors.firstName.message}
            </p>
          )}

          <div className='group w-full border border-[#8080801F] rounded-2xl p-3 focus-within:border-[#1F90FF] focus-within:shadow-[0_0_0_4px_#1F90FF40] transition-all'>
            <label
              htmlFor='lastName'
              className='block text-label text-sm font-medium font-geist mb-1 text-[#949494] group-focus-within:text-[#1F90FF] peer-focus:text-[#1F90FF]'
            >
              Last name
            </label>
            <input
              id='lastName'
              {...register('lastName')}
              type='text'
              placeholder='Enter your last name'
              className='w-full text-gray-800 text-sm font-geist border-none outline-none focus:outline-none'
            />
          </div>
          {errors.lastName && (
            <p className='text-red-500 text-xs -mt-1'>
              {errors.lastName.message}
            </p>
          )}
        </div>

        <div className='space-y-4'>
          <div className='flex items-center justify-between gap-x-4'>
            <p className='text-sm text-[#777777]'>
              Please confirm that you've read and agree to our{' '}
              <span className='text-blue-500'>Terms and Conditions</span> and{' '}
              <span className='text-blue-500'>Privacy Policy</span>.
            </p>

            <div
              className={`relative inline-block w-14 h-6 rounded-full cursor-pointer transition-colors duration-200 ease-in-out ${
                termsAgreed ? 'bg-[#292929]' : 'bg-gray-300'
              }`}
              onClick={() => setValue('termsAgreed', !termsAgreed)}
            >
              <span
                className='absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 ease-in-out transform'
                style={{
                  transform: termsAgreed ? 'translateX(10px)' : 'translateX(0)',
                }}
              />
            </div>
            <input type='hidden' {...register('termsAgreed')} />
          </div>
          {errors.termsAgreed && (
            <p className='text-red-500 text-xs mt-1'>
              {errors.termsAgreed.message}
            </p>
          )}

          <button
            type='submit'
            className='w-full cursor-pointer bg-[#292929] text-white p-4 rounded-[90px] font-medium hover:bg-gray-800 font-geist shadow-button flex items-center justify-center'
          >
            Continue <ArrowRight className='ml-2 h-4 w-4' />
          </button>
        </div>
      </form>
      {/* 
      <div className='space-y-4'>
        <div className='w-full border border-[#8080801F] rounded-2xl p-3 focus-within:border-[#1F90FF] focus-within:shadow-[0_0_0_4px_#1F90FF40] transition-all'>
          <label
            htmlFor='firstName'
            className='block text-label text-sm font-medium font-geist mb-1 text-[#949494] group-focus-within:text-[#1F90FF] peer-focus:text-[#1F90FF]'
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

        <div className='w-full border border-[#8080801F] rounded-2xl p-3 focus-within:border-[#1F90FF] focus-within:shadow-[0_0_0_4px_#1F90FF40] transition-all'>
          <label
            htmlFor='lastName'
            className='block text-label text-sm font-medium font-geist mb-1 text-[#949494] group-focus-within:text-[#1F90FF] peer-focus:text-[#1F90FF]'
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
            className={`relative inline-block w-14 h-6 rounded-full cursor-pointer transition-colors duration-200 ease-in-out ${
              termsAgreed ? 'bg-[#292929]' : 'bg-gray-300'
            }`}
            onClick={() => setTermsAgreed(!termsAgreed)}
          >
            <span
              className='absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 ease-in-out transform'
              style={{
                transform: termsAgreed ? 'translateX(10px)' : 'translateX(0)',
              }}
            />
          </div>
        </div>

        <button
          onClick={onNext}
          className='w-full cursor-pointer bg-[#292929] text-white p-4 rounded-[90px] font-medium hover:bg-gray-800 font-geist shadow-button flex items-center justify-center'
        >
          Continue <ArrowRight className='ml-2 h-4 w-4' />
        </button>
      </div> */}
    </div>
  );
};

export default Step1;
