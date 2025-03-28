import { useState } from 'react';

interface BrandProfileGeneratorProps {
  images: string[];
  onGenerateProfile: (prompt: string) => Promise<void>;
  isGenerating: boolean;
}

export default function BrandProfileGenerator({
  images,
  onGenerateProfile,
  isGenerating,
}: BrandProfileGeneratorProps) {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onGenerateProfile(prompt);
  };

  if (images.length === 0) return null;

  return (
    <div className='bg-white shadow sm:rounded-lg p-6 mb-6'>
      <h2 className='text-lg font-medium mb-3'>Generate Brand Profile</h2>
      <form onSubmit={handleSubmit}>
        <div className='mb-4'>
          <label
            htmlFor='prompt'
            className='block text-sm font-medium text-gray-700 mb-1'
          >
            Enter a prompt for the generated image
          </label>
          <textarea
            id='prompt'
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500'
            rows={3}
            placeholder='Describe what you want to generate...'
            required
          />
        </div>
        <button
          type='submit'
          disabled={isGenerating || !prompt.trim()}
          className='w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:bg-gray-400'
        >
          {isGenerating ? 'Generating...' : 'Generate Profile & Image'}
        </button>
      </form>
    </div>
  );
}
