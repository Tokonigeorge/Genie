interface ImageGalleryProps {
  images: string[];
}

export default function ImageGallery({ images }: ImageGalleryProps) {
  if (images.length === 0) return null;

  return (
    <div className='bg-white shadow sm:rounded-lg p-6 mb-6'>
      <h2 className='text-lg font-medium mb-3'>Uploaded Images</h2>
      <div className='grid grid-cols-2 sm:grid-cols-3 gap-4'>
        {images?.map((image, index) => (
          <div
            key={index}
            className='relative aspect-square overflow-hidden rounded-lg'
          >
            <img
              src={`/api/image/${image}`}
              alt={`Uploaded ${index + 1}`}
              className='object-cover w-full h-full'
              onError={(e) => {
                console.error(`Failed to load image: ${image}`);
                // Optionally set a fallback image
                // e.currentTarget.src = '/placeholder.png';
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
