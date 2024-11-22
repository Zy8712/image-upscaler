'use client'
import React, { useState, useEffect } from "react";
import Upscaler from "upscaler";
import * as tf from "@tensorflow/tfjs";
import NextImage from "next/image"; // Rename the import to avoid conflict with native Image constructor

export default function Home() {
  const [image, setImage] = useState(null);
  const [upscaledImage, setUpscaledImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const initBackend = async () => {
      try {
        await tf.setBackend("webgl");
        await tf.ready();
      } catch (error) {
        console.warn("WebGL not supported or failed, falling back to CPU:", error);
        await tf.setBackend("cpu");
        await tf.ready();
      }
    };
    initBackend();
  }, []);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image(); // Correct way to call the Image constructor with 'new'
      img.onload = () => {
        // Resize the image if it's too large
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const maxWidth = 1024; // for example, limit width to 1024px
        const scale = maxWidth / img.width;
        canvas.width = maxWidth;
        canvas.height = img.height * scale;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        setImage(canvas.toDataURL());
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  const upscaleImage = async () => {
    setIsLoading(true);
    const upscaler = new Upscaler();
    try {
      const upscaled = await upscaler.upscale(image, {
        scale: 2,
      });
      setUpscaledImage(upscaled);
    } catch (error) {
      console.error("Error during upscaling:", error.message, error.stack);
    }
    setIsLoading(false);
  };

  return (
    <>
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
            <NextImage
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
              {isLoading ? "Upscaling..." : "Upscale Image"}
            </button>
          </>
        )}

        {upscaledImage && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-2">Upscaled Image</h2>
            <NextImage
              src={upscaledImage}
              alt="Upscaled"
              width={400}
              height={400}
              className="border"
            />
          </div>
        )}
      </div>
    </>
  );
}