"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { FileObject } from "@/utils/authUtils";
import { useFileContext } from "@/context/FileContext";
import NextImage from "next/image";

export interface ImageResizerProps {
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
  const [preview, setPreview] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [debugInfo, setDebugInfo] = useState<string[]>([]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  // Debug logger
  const addDebugInfo = useCallback((message: string) => {
    console.log(`[ImageResizer Debug]: ${message}`);
    setDebugInfo(prev => [
      ...prev,
      `${new Date().toLocaleTimeString()}: ${message}`,
    ]);
  }, []);

  // Detect actual image type from base64 data
  const detectImageType = useCallback((base64: string): string => {
    // Remove data URL prefix if present
    const cleanBase64 = base64.replace(/^data:image\/[^;]+;base64,/, '');
    
    // Check magic numbers (first few bytes)
    if (cleanBase64.startsWith('/9j/')) return 'image/jpeg';
    if (cleanBase64.startsWith('iVBORw0KGgo')) return 'image/png';
    if (cleanBase64.startsWith('R0lGOD')) return 'image/gif';
    if (cleanBase64.startsWith('UklGR')) return 'image/webp';
    
    // Default fallback
    return 'image/png';
  }, []);

  // Validate if file is an image
  const isValidImageFile = useCallback(
    (file: FileObject): boolean => {
      addDebugInfo(
        `Validating file: ${JSON.stringify({
          hasFile: !!file,
          type: file?.type,
          hasBase64: !!file?.base64,
          base64Length: file?.base64?.length,
          base64Start: file?.base64?.substring(0, 30),
        })}`
      );

      if (!file) {
        addDebugInfo("File is null or undefined");
        return false;
      }

      // Check if base64 data exists
      const hasBase64 = Boolean(file.base64 && file.base64.length > 0);
      addDebugInfo(`Has base64 data: ${hasBase64}`);

      if (!hasBase64) {
        addDebugInfo("No base64 data found");
        return false;
      }

      // Detect actual image type
      const detectedType = detectImageType(file.base64);
      addDebugInfo(`Detected image type: ${detectedType} (claimed type: ${file.type})`);

      const result = Boolean(hasBase64);
      addDebugInfo(`File validation result: ${result}`);
      return result;
    },
    [addDebugInfo, detectImageType]
  );

  // Ensure base64 has proper data URL format
  const formatBase64 = useCallback(
    (base64: string, fileType?: string): string => {
      if (base64.startsWith("data:")) {
        addDebugInfo("Base64 already has data URL format");
        return base64;
      }
      
      // Detect the actual image type from the data
      const actualType = detectImageType(base64);
      addDebugInfo(`Using detected type: ${actualType} instead of claimed type: ${fileType}`);
      
      const formatted = `data:${actualType};base64,${base64}`;
      addDebugInfo(
        `Formatted base64 from ${base64.substring(0, 30)}... to ${formatted.substring(0, 50)}...`
      );
      return formatted;
    },
    [addDebugInfo, detectImageType]
  );

  // Component mount debug
  useEffect(() => {
    addDebugInfo("ImageResizer component mounted");
    addDebugInfo(
      `Received file: ${JSON.stringify({
        id: file?.id,
        name: file?.name,
        type: file?.type,
        size: file?.size,
        hasBase64: !!file?.base64,
      })}`
    );
  }, [file, addDebugInfo]);

  // Load the image and set initial dimensions
  useEffect(() => {
    addDebugInfo("Starting image load effect");

    if (!file || !isValidImageFile(file)) {
      const errorMsg = !file ? "No file provided" : "Invalid image file";
      addDebugInfo(`Error: ${errorMsg}`);
      setError(errorMsg);
      setIsLoading(false);
      return;
    }

    setError("");
    setIsLoading(true);
    addDebugInfo("Creating new Image object");

    const image = new window.Image();

    image.onload = () => {
      try {
        addDebugInfo(
          `Image loaded successfully: ${image.width}x${image.height}`
        );

        setOriginalWidth(image.width);
        setOriginalHeight(image.height);
        setWidth(image.width);
        setHeight(image.height);
        setAspectRatio(image.width / image.height);
        imageRef.current = image;

        // Use the same formatted source for preview
        setPreview(image.src);
        setIsLoading(false);

        addDebugInfo("Image processing completed successfully");
      } catch (err) {
        const errorMsg = `Error processing loaded image: ${err}`;
        addDebugInfo(errorMsg);
        setError("Failed to process image");
        setIsLoading(false);
      }
    };

    image.onerror = (err) => {
      const errorMsg = `Failed to load image: ${err}`;
      addDebugInfo(errorMsg);
      setError("Failed to load image. The image data may be corrupted.");
      setIsLoading(false);
    };

    // Set crossOrigin to handle potential CORS issues
    image.crossOrigin = "anonymous";
    addDebugInfo("Set crossOrigin to anonymous");

    try {
      const formattedBase64 = formatBase64(file.base64, file.type);
      addDebugInfo(
        `Setting image source: ${formattedBase64.substring(0, 50)}...`
      );
      
      // Validate the data URL before setting it
      try {
        new URL(formattedBase64);
        image.src = formattedBase64;
      } catch (urlError) {
        addDebugInfo(`Invalid data URL: ${urlError}`);
        setError("Invalid image data format");
        setIsLoading(false);
      }
    } catch (err) {
      const errorMsg = `Error setting image source: ${err}`;
      addDebugInfo(errorMsg);
      setError("Invalid image data");
      setIsLoading(false);
    }
  }, [file, isValidImageFile, formatBase64, addDebugInfo]);

  // Update the canvas preview when dimensions change
  const updatePreview = useCallback(() => {
    addDebugInfo(
      `Updating preview - Loading: ${isLoading}, Width: ${width}, Height: ${height}`
    );

    if (
      isLoading ||
      !canvasRef.current ||
      !imageRef.current ||
      width <= 0 ||
      height <= 0
    ) {
      addDebugInfo("Skipping preview update - missing requirements");
      return;
    }

    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        addDebugInfo("Canvas context not available");
        setError("Canvas context not available");
        return;
      }

      addDebugInfo(`Setting canvas dimensions: ${width}x${height}`);

      // Set canvas dimensions
      canvas.width = width;
      canvas.height = height;

      // Clear canvas with white background
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Enable image smoothing for better quality
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      // Draw resized image
      ctx.drawImage(imageRef.current, 0, 0, width, height);
      addDebugInfo("Image drawn to canvas");

      // Generate preview with detected image type
      const detectedType = detectImageType(file.base64);
      const newPreview = canvas.toDataURL(detectedType, 0.95);
      setPreview(newPreview);
      addDebugInfo(`Preview updated - type: ${detectedType}, length: ${newPreview.length}`);
    } catch (err) {
      const errorMsg = `Error updating preview: ${err}`;
      addDebugInfo(errorMsg);
      setError("Failed to generate preview");
    }
  }, [width, height, isLoading, file.base64, addDebugInfo, detectImageType]);

  useEffect(() => {
    updatePreview();
  }, [updatePreview]);

  // Handle width change, maintaining aspect ratio if needed
  const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newWidth = Math.max(1, parseInt(e.target.value, 10) || 1);
    addDebugInfo(`Width changed to: ${newWidth}`);
    setWidth(newWidth);

    if (maintainAspectRatio && aspectRatio > 0) {
      const newHeight = Math.max(1, Math.round(newWidth / aspectRatio));
      addDebugInfo(`Height auto-adjusted to: ${newHeight}`);
      setHeight(newHeight);
    }
  };

  // Handle height change, maintaining aspect ratio if needed
  const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newHeight = Math.max(1, parseInt(e.target.value, 10) || 1);
    addDebugInfo(`Height changed to: ${newHeight}`);
    setHeight(newHeight);

    if (maintainAspectRatio && aspectRatio > 0) {
      const newWidth = Math.max(1, Math.round(newHeight * aspectRatio));
      addDebugInfo(`Width auto-adjusted to: ${newWidth}`);
      setWidth(newWidth);
    }
  };

  // Toggle aspect ratio lock
  const toggleAspectRatio = () => {
    const newValue = !maintainAspectRatio;
    addDebugInfo(`Aspect ratio toggled to: ${newValue}`);
    setMaintainAspectRatio(newValue);
  };

  // Reset to original dimensions
  const handleReset = () => {
    addDebugInfo(
      `Resetting to original dimensions: ${originalWidth}x${originalHeight}`
    );
    setWidth(originalWidth);
    setHeight(originalHeight);
  };

  // Save the resized image
  const handleSave = async () => {
    addDebugInfo("Save button clicked");

    if (!canvasRef.current) {
      addDebugInfo("Canvas not available for save");
      setError("Canvas not available");
      return;
    }

    try {
      addDebugInfo("Generating resized image data");
      
      // Use detected image type for consistent output
      const detectedType = detectImageType(file.base64);
      const resizedBase64 = canvasRef.current.toDataURL(detectedType, 0.95);

      if (!resizedBase64 || resizedBase64 === "data:,") {
        addDebugInfo("Failed to generate valid base64 data");
        setError("Failed to generate resized image");
        return;
      }

      addDebugInfo(`Generated base64 data length: ${resizedBase64.length}`);

      // Update the file in the context
      if (updateResizedImage) {
        addDebugInfo("Updating resized image in context");
        updateResizedImage(file.id, resizedBase64);
      } else {
        addDebugInfo("updateResizedImage function not available");
      }

      // Create a new file object with resized dimensions and correct type
      const resizedFile: FileObject = {
        ...file,
        base64: resizedBase64,
        type: detectedType,
        size: Math.round((resizedBase64.length * 3) / 4),
      };

      addDebugInfo(
        `Calling onSave with resized file: ${JSON.stringify({
          id: resizedFile.id,
          name: resizedFile.name,
          type: resizedFile.type,
          size: resizedFile.size,
          dimensions: `${width}x${height}`,
        })}`
      );

      onSave(resizedFile);
      addDebugInfo("onSave called successfully");
    } catch (err) {
      const errorMsg = `Error saving resized image: ${err}`;
      addDebugInfo(errorMsg);
      setError("Failed to save resized image");
    }
  };

  // Show error state
  if (error) {
    return (
      <div className="bg-[#EFE4D2] p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4 text-gray-700">
          Resize Image - Error
        </h3>
        <div className="flex flex-col items-center justify-center min-h-48 bg-red-50 rounded-lg border border-red-200 p-4">
          <p className="text-red-600 text-center mb-4">{error}</p>

          <details className="w-full mb-4">
            <summary className="cursor-pointer text-sm text-gray-600 mb-2">
              Debug Information
            </summary>
            <div className="bg-gray-100 p-2 rounded text-xs max-h-32 overflow-y-auto">
              {debugInfo.map((info, index) => (
                <div key={index} className="mb-1">
                  {info}
                </div>
              ))}
            </div>
          </details>

          <div className="flex space-x-3">
            <button
              onClick={onCancel}
              className="py-2 px-4 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
            >
              Go Back
            </button>
            <button
              onClick={() => window.location.reload()}
              className="py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
      );
    }
  

  return (
    <div className="bg-[#EFE4D2] p-4 sm:p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-700">Resize Image</h3>
        <details className="text-sm">
          <summary className="cursor-pointer text-blue-600">Debug Info</summary>
          <div className="absolute z-10 mt-2 w-96 bg-white border rounded-lg shadow-lg p-3 max-h-64 overflow-y-auto">
            {debugInfo.map((info, index) => (
              <div key={index} className="text-xs mb-1 text-gray-600">
                {info}
              </div>
            ))}
          </div>
        </details>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-48">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600 mb-2"></div>
            <p className="text-gray-600">Loading image...</p>
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1">
              <div className="mb-4">
                <p className="mb-2 text-sm text-gray-600">Preview:</p>
                <div className="border border-gray-200 rounded-md p-2 max-h-[400px] overflow-auto flex justify-center items-center bg-gray-50">
                  {preview ? (
                    <NextImage
                      src={preview}
                      alt="Resized preview"
                      width={Math.min(width, 400)}
                      height={Math.min(height, 300)}
                      className="max-w-full h-auto object-contain"
                      style={{ maxHeight: "380px" }}
                      priority
                      unoptimized
                    />
                  ) : (
                    <div className="text-gray-400 text-center p-8">
                      Preview not available
                    </div>
                  )}
                </div>
              </div>
              <div className="text-xs text-gray-500 space-y-1">
                <p>
                  Original: {originalWidth}px × {originalHeight}px
                </p>
                <p>
                  New: {width}px × {height}px
                </p>
                <p>Aspect Ratio: {aspectRatio.toFixed(3)}</p>
              </div>
            </div>

            <div className="lg:w-64">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Width (px):
                </label>
                <input
                  type="number"
                  min="1"
                  max="10000"
                  value={width}
                  onChange={handleWidthChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Height (px):
                </label>
                <input
                  type="number"
                  min="1"
                  max="10000"
                  value={height}
                  onChange={handleHeightChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="mb-4 flex items-center">
                <input
                  type="checkbox"
                  id="aspectRatio"
                  checked={maintainAspectRatio}
                  onChange={toggleAspectRatio}
                  className="mr-2 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
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

          <canvas ref={canvasRef} style={{ display: "none" }} />

          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={onCancel}
              className="py-2 px-4 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={width <= 0 || height <= 0}
              className="py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Apply Resize
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default ImageResizer;