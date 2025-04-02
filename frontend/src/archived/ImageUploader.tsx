import { CloudArrowUpIcon } from '@heroicons/react/24/outline';
import { useRef, useImperativeHandle, forwardRef } from 'react';

interface ImageUploaderProps {
  onImagesSelected: (files: FileList | null) => void;
}

export type ImageUploaderRef = {
  resetFileInput: () => void;
};

const ImageUploader = forwardRef<ImageUploaderRef, ImageUploaderProps>(
  ({ onImagesSelected }, ref) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onImagesSelected(e.target.files);
    };

    // Reset the file input when files are uploaded
    const resetFileInput = () => {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };

    // Expose the resetFileInput function to the parent component
    useImperativeHandle(ref, () => ({
      resetFileInput,
    }));

    return (
      <div className='bg-white shadow sm:rounded-lg p-6 mb-6'>
        <label className='block text-sm font-medium text-gray-700 mb-2'>
          Upload Reference Images
        </label>
        <div className='flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md'>
          <div className='space-y-1 text-center'>
            <CloudArrowUpIcon className='mx-auto h-12 w-12 text-gray-400' />
            <div className='flex text-sm text-gray-600'>
              <label className='relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500'>
                <span>Select files</span>
                <input
                  ref={fileInputRef}
                  type='file'
                  multiple
                  accept='image/*'
                  className='sr-only'
                  onChange={handleFileChange}
                />
              </label>
            </div>
            <p className='text-xs text-gray-500'>
              PNG, JPG, GIF up to 10 files
            </p>
          </div>
        </div>
      </div>
    );
  }
);

export default ImageUploader;
