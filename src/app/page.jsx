'use client'
import React, { useState } from 'react';

export default function Home() {
  const [image, setImage] = useState(null);
  const [upscaledImage, setUpscaledImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      setImage(e.target.result);  // Store the base64 image data
    };
    reader.readAsDataURL(file);
  };

  const upscaleImage = async () => {
    const response = await fetch('/api/upscale', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: image.split(',')[1],  // Strip the base64 prefix
        scaleFactor: 10,  // Example scale factor (2x)
      }),
    });
  
    if (response.ok) {
      const upscaledImageBlob = await response.blob();
      const upscaledImageUrl = URL.createObjectURL(upscaledImageBlob);
      setUpscaledImage(upscaledImageUrl);
    } else {
      console.error('Image upscaling failed');
    }
  };
  

  return (
    <div className="flex flex-col items-center p-8 bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">AI Image Upscaler</h1>

      <input
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="mb-4"
      />
      {image && (
        <>
          <img
            src={image}
            alt="Original"
            width={200}
            height={200}
            className="mb-4 border"
          />
          <button
            onClick={upscaleImage}
            className="px-4 py-2 bg-blue-600 text-white rounded"
            disabled={isLoading}
          >
            {isLoading ? 'Upscaling...' : 'Upscale Image'}
          </button>
        </>
      )}

      {upscaledImage && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Upscaled Image</h2>
          <img
            src={upscaledImage}
            alt="Upscaled"
            width={400}
            height={400}
            className="border"
          />
        </div>
      )}
    </div>
  );
}
