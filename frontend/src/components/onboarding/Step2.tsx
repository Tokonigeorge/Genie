import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { step2Schema } from '../../utils/onboardingValidation';

type FormData = z.infer<typeof step2Schema>;
interface Step2Props {
  onNext: (data: FormData) => void;
  onPrevious: () => void;
}

const Step2: React.FC<Step2Props> = ({ onNext, onPrevious }) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(step2Schema),
  });

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setValue('companyLogo', file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
      //todo: upload image to supabase and get the url
    }
  };

  const onSubmit = (data: FormData) => {
    console.log(data);
    onNext(data);
  };

  return (
    <div className='space-y-6'>
      <p className='text-[#777777] text-sm leading-5 -mt-2'>
        Upload your logo and fill in your company details—we will set you up
        right away.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
        <div className='flex items-center space-x-4 mb-6'>
          <div className='h-16 w-16 rounded-xl bg-[#F0F0F0] flex items-center justify-center overflow-hidden'>
            {previewUrl ? (
              <img
                src={previewUrl}
                alt='Company logo'
                className='h-full w-full object-cover'
              />
            ) : (
              <div className='text-[#949494] text-xs'></div>
            )}
          </div>
          <div className='space-y-2'>
            <p className='text-[#949494] text-sm leading-5'>Company Logo</p>
            <label className='border border-[#8080801F] font-semibold rounded-4xl px-8 py-1.5 text-[#333333] text-sm leading-5 bg-white cursor-pointer hover:bg-gray-50'>
              Upload
              <input
                type='file'
                className='hidden'
                accept='image/png,image/jpeg'
                {...register('companyLogo', {
                  onChange: handleImageUpload,
                })}
              />
            </label>
          </div>
        </div>
        {errors.companyLogo && (
          <p className='text-red-500 text-xs'>{errors.companyLogo.message}</p>
        )}

        <div className='space-y-4'>
          <div className='group w-full border border-[#8080801F] rounded-2xl p-3 focus-within:border-[#1F90FF] focus-within:shadow-[0_0_0_4px_#1F90FF40] transition-all'>
            <label
              htmlFor='companyName'
              className='block text-sm font-medium font-geist mb-1 text-[#949494] group-focus-within:text-[#1F90FF]'
            >
              Company name
            </label>
            <input
              id='companyName'
              type='text'
              placeholder='Example Company Inc'
              className='w-full text-[#333333] text-sm font-geist border-none outline-none focus:outline-none'
              {...register('companyName')}
            />
          </div>
          {errors.companyName && (
            <p className='text-red-500 text-xs -mt-1'>
              {errors.companyName.message}
            </p>
          )}

          <div className='group w-full border border-[#8080801F] rounded-2xl p-3 focus-within:border-[#1F90FF] focus-within:shadow-[0_0_0_4px_#1F90FF40] transition-all'>
            <label
              htmlFor='workspaceUrl'
              className='block text-sm font-medium font-geist mb-1 text-[#949494] group-focus-within:text-[#1F90FF] '
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
                {...register('workspaceUrl')}
              />
            </div>
          </div>
          {errors.workspaceUrl && (
            <p className='text-red-500 text-xs -mt-1'>
              {errors.workspaceUrl.message}
            </p>
          )}
        </div>

        <div className='flex space-x-4 mt-8'>
          <button
            type='button'
            onClick={onPrevious}
            className='w-full cursor-pointer bg-transparent border border-[#8080801F] text-[#292929] p-4 rounded-[90px] font-medium hover:bg-gray-100 font-geist'
          >
            Back
          </button>
          <button
            type='submit'
            className='w-full cursor-pointer bg-[#292929] text-white p-4 rounded-[90px] font-medium hover:bg-gray-800 font-geist shadow-button'
          >
            Continue
          </button>
        </div>
      </form>
    </div>
  );
};

export default Step2;
