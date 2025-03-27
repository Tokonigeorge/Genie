
import { useState } from 'react'
import { CloudArrowUpIcon } from '@heroicons/react/24/outline'

export default function App() {
  const [images, setImages] = useState<string[]>([])
  const [prompt, setPrompt] = useState('')

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const formData = new FormData()
    Array.from(files).forEach(file => {
      formData.append('files', file)
    })

    try {
      const response = await fetch('/api/upload-images/', {
        method: 'POST',
        body: formData,
      })
      const data = await response.json()
      setImages(data.uploaded_files)
    } catch (error) {
      console.error('Error uploading images:', error)
    }
  }

  const handleGenerate = async () => {
    try {
      const response = await fetch('/api/generate/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      })
      const data = await response.json()
      console.log(data)
    } catch (error) {
      console.error('Error generating image:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">AI Image Generator</h1>
        
        <div className="bg-white shadow sm:rounded-lg p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Reference Images
          </label>
          <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
              <div className="flex text-sm text-gray-600">
                <label className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500">
                  <span>Upload files</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="sr-only"
                    onChange={handleImageUpload}
                  />
                </label>
              </div>
              <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10 files</p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow sm:rounded-lg p-6 mb-6">
          <textarea
            className="w-full p-2 border rounded-md"
            rows={4}
            placeholder="Enter your prompt here..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <button
            onClick={handleGenerate}
            className="mt-4 w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700"
          >
            Generate
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {images.map((img, index) => (
            <div key={index} className="relative aspect-square">
              <img
                src={`/api/uploads/${img}`}
                alt={`Upload ${index + 1}`}
                className="object-cover rounded-lg"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
