// src/app/api/upscale/route.js

import sharp from 'sharp';

// Named export for the POST method
export async function POST(req) {
  try {
    const { image, scaleFactor } = await req.json();  // Parse incoming JSON with scale factor
    const buffer = Buffer.from(image, 'base64');  // Convert base64 to buffer

    // Get the image dimensions for scaling
    const metadata = await sharp(buffer).metadata();
    const width = metadata.width;
    const height = metadata.height;

    // Calculate new dimensions based on the scale factor
    const newWidth = Math.floor(width * scaleFactor);
    const newHeight = Math.floor(height * scaleFactor);

    // Perform image processing with sharp (resize, etc.)
    const upscaledImage = await sharp(buffer)
      .resize(newWidth, newHeight)  // Resize based on scale factor
      .toBuffer();

    // Return the upscaled image as a response
    return new Response(upscaledImage, {
      headers: { 'Content-Type': 'image/png' },
    });
  } catch (error) {
    return new Response('Failed to process image', { status: 500 });
  }
}