import { useEffect, useRef, useState } from 'react';
import ImageUploader, { ImageUploaderRef } from './ImageUploader';
import ImageGallery from './ImageGallery';
import BrandProfileGenerator from './BrandProfileGenerator';

interface BrandProfileData {
  id: string;
  prompt: string;
  uploadedImages: string[];
  brandProfile: any;
  generatedImageId: string;
}

export default function App() {
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [brandProfile, setBrandProfile] = useState<any>(null);
  const [generatedImageId, setGeneratedImageId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [prompt, setPrompt] = useState<string>('');
  const [savedProfiles, setSavedProfiles] = useState<BrandProfileData[]>([]);
  const imageUploaderRef = useRef<ImageUploaderRef>(null);

  const handleImagesSelected = (files: FileList | null) => {
    setSelectedFiles(files);
  };

  useEffect(() => {
    const fetchImagesAndProfiles = async () => {
      try {
        const response = await fetch('/api/images/');
        const data = await response.json();
        if (data.images) {
          setImages(data.images);
        }
        console.log(data, 'data');
        if (data.profiles) {
          setSavedProfiles(data.profiles);
          // If there are profiles, set the latest one as the current one
          if (data.profiles.length > 0) {
            const latestProfile = data.profiles[data.profiles.length - 1];
            setBrandProfile(latestProfile.brandProfile);
            setGeneratedImageId(latestProfile.generatedImageId);
          }
        }
      } catch (error) {
        console.error('Error fetching images:', error);
      }
    };

    fetchImagesAndProfiles();
  }, []);

  console.log(savedProfiles, 'savedProfiles');
  console.log(brandProfile, 'brandProfile');
  console.log(images, 'images');
  console.log(generatedImageId, 'generatedImageId');

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
      if (data.brandProfile) {
        setBrandProfile(data.brandProfile);
      }
      setSelectedFiles(null);
      imageUploaderRef.current?.resetFileInput();
    } catch (error) {
      console.error('Error uploading images:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleGenerateImage = async () => {
    if (!brandProfile || !prompt) {
      alert('Please ensure you have a brand profile and a prompt');
      return;
    }

    setIsGenerating(true);

    try {
      // Find the latest profile ID
      const profileId =
        savedProfiles.length > 0
          ? savedProfiles[savedProfiles.length - 1].id
          : null;

      if (!profileId) {
        alert('No profile ID found');
        return;
      }

      const response = await fetch('/api/generate-image/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profile_id: profileId,
          prompt: prompt,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      setGeneratedImageId(data.generatedImageId);

      // Update the prompt in case it's different from what was set
      setPrompt(data.prompt);
    } catch (error) {
      console.error('Error generating image:', error);
      alert('Failed to generate image. See console for details.');
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
          prompt={prompt}
          setPrompt={setPrompt}
          onGenerateProfile={handleGenerateImage}
        />
        {generatedImageId && (
          <div className='bg-white shadow sm:rounded-lg p-6 mb-6'>
            <h2 className='text-lg font-medium mb-3'>Generated Image</h2>
            <p className='text-sm text-gray-500 mb-3'>
              Generation of "{prompt}" with Stable Diffusion
            </p>
            <div className='flex justify-center'>
              <img
                src={`/api/image/${generatedImageId}`}
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
