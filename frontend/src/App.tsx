import { useEffect, useRef, useState } from 'react';
import ImageUploader, { ImageUploaderRef } from './components/ImageUploader';
import ImageGallery from './components/ImageGallery';
import BrandProfileGenerator from './components/BrandProfileGenerator';

export default function App() {
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [brandProfile, setBrandProfile] = useState<any>(null);
  const [generatedImagePath, setGeneratedImagePath] = useState<string | null>(
    null
  );
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const imageUploaderRef = useRef<ImageUploaderRef>(null);

  const handleImagesSelected = (files: FileList | null) => {
    setSelectedFiles(files);
  };

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await fetch('/api/images/');
        const data = await response.json();
        if (data.images) {
          setImages(data.images);
        }
      } catch (error) {
        console.error('Error fetching images:', error);
      }
    };

    fetchImages();
  }, []);

  const handleUploadImages = async () => {
    if (!selectedFiles || selectedFiles.length === 0) return;

    setIsUploading(true);
    const formData = new FormData();
    Array.from(selectedFiles).forEach((file) => {
      formData.append('files', file);
    });

    try {
      const response = await fetch('/api/upload-images/', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      setImages((prevImages) => [...prevImages, ...data.uploaded_files]);
      // Clear selected files after upload
      setSelectedFiles(null);
      imageUploaderRef.current?.resetFileInput();
    } catch (error) {
      console.error('Error uploading images:', error);
    } finally {
      setIsUploading(false);
    }
  };
  console.log(images, 'images');

  const handleGenerateProfile = async (prompt: string) => {
    if (images.length === 0) return;

    setIsGenerating(true);

    try {
      const response = await fetch('/api/generate-brand-profile/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          images: images,
          prompt: prompt,
        }),
      });
      const data = await response.json();
      setBrandProfile(data.brandProfile);
      console.log('Generated brand profile:', data.brandProfile);
      if (data.generatedImagePath) {
        setGeneratedImagePath(data.generatedImagePath);
      }
    } catch (error) {
      console.error('Error generating brand profile:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className='min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-3xl mx-auto'>
        <h1 className='text-3xl font-bold text-center mb-8'>
          AI Brand Profile Generator
        </h1>

        <ImageUploader
          ref={imageUploaderRef}
          onImagesSelected={handleImagesSelected}
        />

        {selectedFiles && selectedFiles.length > 0 && (
          <div className='text-center mb-6'>
            <p className='mb-2'>{selectedFiles.length} file(s) selected</p>
            <button
              onClick={handleUploadImages}
              disabled={isUploading}
              className='bg-green-600 text-white py-2 px-6 rounded-md hover:bg-green-700 disabled:bg-gray-400'
            >
              {isUploading ? 'Uploading...' : 'Upload Images'}
            </button>
          </div>
        )}

        <ImageGallery images={images} />

        <BrandProfileGenerator
          images={images}
          isGenerating={isGenerating}
          onGenerateProfile={handleGenerateProfile}
        />
        {generatedImagePath && (
          <div className='bg-white shadow sm:rounded-lg p-6 mb-6'>
            <h2 className='text-lg font-medium mb-3'>Generated Image</h2>
            <div className='flex justify-center'>
              <img
                src={generatedImagePath}
                alt='Generated based on brand profile'
                className='max-w-full h-auto rounded-lg shadow-md'
              />
            </div>
          </div>
        )}
        {brandProfile && (
          <div className='bg-white shadow sm:rounded-lg p-6 mb-6'>
            <h2 className='text-lg font-medium mb-3'>Brand Profile</h2>
            <pre className='bg-gray-100 p-4 rounded-md overflow-auto'>
              {JSON.stringify(brandProfile, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
