'use client'
import React, { useState, useEffect } from "react";
import Upscaler from "upscaler";
import * as tf from "@tensorflow/tfjs";
import NextImage from "next/image"; // Renaming the image import to avoid conflict

export default function Home() {
  const [image, setImage] = useState(null);
  const [upscaledImage, setUpscaledImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const initBackend = async () => {
      try {
        await tf.setBackend("cpu"); // Force TensorFlow to use CPU
        await tf.ready();
        console.log("TensorFlow CPU backend initialized.");
      } catch (error) {
        console.warn("Error initializing CPU backend:", error);
      }
    };
    initBackend();
  }, []);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const img = new Image(); // Correct way to call the Image constructor with 'new'
        img.onload = () => {
          try {
            // Resize the image if it's too large
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const maxWidth = 1024; // Limit width to 1024px
            const scale = maxWidth / img.width;
            canvas.width = maxWidth;
            canvas.height = img.height * scale;
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            setImage(canvas.toDataURL()); // Store the image for upscaling
            console.log("Image loaded and resized.");
          } catch (resizeError) {
            console.error("Error resizing the image:", resizeError);
          }
        };
        img.src = e.target.result; // Read the image data
      } catch (error) {
        console.error("Error loading the image:", error);
      }
    };
    reader.readAsDataURL(file); // Start reading the file
  };

  const upscaleImage = async () => {
    setIsLoading(true);
    const upscaler = new Upscaler();
    try {
      const upscaled = await upscaler.upscale(image, {
        scale: 2,
      });
      setUpscaledImage(upscaled);
      console.log("Image upscaled successfully.");
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
