"use client";

import React, { useState, useEffect, useRef } from "react";
import { FileObject } from "../utils/authUtils";
import { useFileContext } from "../context/FileContext";
import NextImage from "next/image";

interface ImageResizerProps {
  file: FileObject;
  onSave: (resizedFile: FileObject) => void;
  onCancel: () => void;
}

const ImageResizer: React.FC<ImageResizerProps> = ({
  file,
  onSave,
  onCancel,
}) => {
  const { updateResizedImage } = useFileContext();
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const [originalWidth, setOriginalWidth] = useState<number>(0);
  const [originalHeight, setOriginalHeight] = useState<number>(0);
  const [maintainAspectRatio, setMaintainAspectRatio] = useState<boolean>(true);
  const [aspectRatio, setAspectRatio] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [preview, setPreview] = useState<string>(file.base64);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  // Load the image and set initial dimensions
  useEffect(() => {
    const image = new window.Image();
    image.onload = () => {
      setOriginalWidth(image.width);
      setOriginalHeight(image.height);
      setWidth(image.width);
      setHeight(image.height);
      setAspectRatio(image.width / image.height);
      imageRef.current = image;
      setIsLoading(false);
    };
    image.src = file.base64;
  }, [file.base64]);

  // Update the canvas preview when dimensions change
  useEffect(() => {
    if (!isLoading && canvasRef.current && imageRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      if (ctx) {
        // Set canvas dimensions
        canvas.width = width;
        canvas.height = height;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw resized image
        ctx.drawImage(imageRef.current, 0, 0, width, height);

        // Update preview
        setPreview(canvas.toDataURL(file.type, 0.9));
      }
    }
  }, [width, height, isLoading, file.type]);

  // Handle width change, maintaining aspect ratio if needed
  const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newWidth = parseInt(e.target.value, 10) || 0;
    setWidth(newWidth);

    if (maintainAspectRatio && aspectRatio) {
      const newHeight = Math.round(newWidth / aspectRatio);
      setHeight(newHeight);
    }
  };

  // Handle height change, maintaining aspect ratio if needed
  const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newHeight = parseInt(e.target.value, 10) || 0;
    setHeight(newHeight);

    if (maintainAspectRatio && aspectRatio) {
      const newWidth = Math.round(newHeight * aspectRatio);
      setWidth(newWidth);
    }
  };

  // Toggle aspect ratio lock
  const toggleAspectRatio = () => {
    setMaintainAspectRatio(!maintainAspectRatio);
  };

  // Reset to original dimensions
  const handleReset = () => {
    setWidth(originalWidth);
    setHeight(originalHeight);
  };

  // Save the resized image
  const handleSave = () => {
    if (canvasRef.current) {
      // Create a resized file object
      const resizedBase64 = canvasRef.current.toDataURL(file.type, 0.9);

      // Update the file in the context
      updateResizedImage(file.id, resizedBase64);

      // Create a new file object with resized dimensions
      const resizedFile: FileObject = {
        ...file,
        base64: resizedBase64,
        // We're not changing the size property here as it would require converting base64 to blob
        // and calculating the actual size. In a real application, you might want to do that.
      };

      // Call the onSave callback from parent component
      onSave(resizedFile);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4 text-gray-700">Resize Image</h3>

      {isLoading ? (
        <div className="flex justify-center items-center h-48">
          <p className="text-gray-500">Loading image...</p>
        </div>
      ) : (
        <>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <div className="mb-4 overflow-hidden">
                <p className="mb-2 text-sm text-gray-600">Preview:</p>
                <div className="border border-gray-200 rounded-md p-2 max-h-[400px] overflow-auto flex justify-center items-center bg-gray-50">
                  <NextImage
                    src={preview}
                    alt="Preview"
                    className="max-w-full object-contain"
                    style={{ maxHeight: "380px" }}
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500">
                Original dimensions: {originalWidth}px × {originalHeight}px
              </p>
            </div>

            <div className="md:w-64">
              <div className="mb-4">
                <label className="block text-sm text-gray-600 mb-1">
                  Width (px):
                </label>
                <input
                  type="number"
                  min="1"
                  value={width}
                  onChange={handleWidthChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm text-gray-600 mb-1">
                  Height (px):
                </label>
                <input
                  type="number"
                  min="1"
                  value={height}
                  onChange={handleHeightChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="mb-4 flex items-center">
                <input
                  type="checkbox"
                  id="aspectRatio"
                  checked={maintainAspectRatio}
                  onChange={toggleAspectRatio}
                  className="mr-2"
                />
                <label htmlFor="aspectRatio" className="text-sm text-gray-600">
                  Maintain aspect ratio
                </label>
              </div>

              <button
                onClick={handleReset}
                className="w-full mb-4 py-2 px-3 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
              >
                Reset to Original
              </button>
            </div>
          </div>

          {/* Hidden canvas for image processing */}
          <canvas ref={canvasRef} style={{ display: "none" }} />

          <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={onCancel}
              className="py-2 px-4 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="py-2 px-4 bg-blue-600 rounded-md text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Apply Resize
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ImageResizer;
