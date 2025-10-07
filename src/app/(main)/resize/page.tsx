"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useFileContext } from "@/context/FileContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FileObject } from "@/utils/authUtils";

const ResizePage: React.FC = () => {
  const router = useRouter();
  const { files, addFile } = useFileContext();
  const [selectedFile, setSelectedFile] = useState<FileObject | null>(null);
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const [originalWidth, setOriginalWidth] = useState<number>(0);
  const [originalHeight, setOriginalHeight] = useState<number>(0);
  const [maintainAspectRatio, setMaintainAspectRatio] = useState<boolean>(true);
  const [aspectRatio, setAspectRatio] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [preview, setPreview] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  // Get image files only
  const imageFiles = files.filter(f => f.type.startsWith("image/"));

  // Load selected file
  useEffect(() => {
    if (!selectedFile) return;

    setError("");
    setIsLoading(true);

    const image = new window.Image();
    image.onload = () => {
      setOriginalWidth(image.width);
      setOriginalHeight(image.height);
      setWidth(image.width);
      setHeight(image.height);
      setAspectRatio(image.width / image.height);
      imageRef.current = image;
      setPreview(image.src);
      setIsLoading(false);
    };

    image.onerror = () => {
      setError("Failed to load image");
      setIsLoading(false);
    };

    image.crossOrigin = "anonymous";

    // Use base64 if available, otherwise use URL
    if (selectedFile.base64) {
      image.src = selectedFile.base64;
    } else {
      image.src = selectedFile.url;
    }
  }, [selectedFile]);

  // Update preview when dimensions change
  const updatePreview = useCallback(() => {
    if (
      isLoading ||
      !canvasRef.current ||
      !imageRef.current ||
      width <= 0 ||
      height <= 0
    ) {
      return;
    }

    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      canvas.width = width;
      canvas.height = height;

      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(imageRef.current, 0, 0, width, height);

      setPreview(canvas.toDataURL("image/png", 0.95));
    } catch (err) {
      console.error("Preview error:", err);
    }
  }, [width, height, isLoading]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      updatePreview();
    }, 300);

    return () => clearTimeout(debounce);
  }, [updatePreview]);

  const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newWidth = Math.max(1, parseInt(e.target.value) || 1);
    setWidth(newWidth);
    if (maintainAspectRatio && aspectRatio > 0) {
      setHeight(Math.round(newWidth / aspectRatio));
    }
  };

  const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newHeight = Math.max(1, parseInt(e.target.value) || 1);
    setHeight(newHeight);
    if (maintainAspectRatio && aspectRatio > 0) {
      setWidth(Math.round(newHeight * aspectRatio));
    }
  };

  const handleReset = () => {
    setWidth(originalWidth);
    setHeight(originalHeight);
  };

  const handleSave = async () => {
    if (!canvasRef.current || !selectedFile) return;

    setIsProcessing(true);
    setError("");

    try {
      const resizedBase64 = canvasRef.current.toDataURL("image/png", 0.95);

      // Create proper FileObject with all required properties
      const resizedFile: FileObject = {
        id: `resized_${Date.now()}`,
        name: `resized_${selectedFile.name}`,
        type: "image/png",
        size: Math.round((resizedBase64.length * 3) / 4),
        url: resizedBase64, // Use base64 as URL for preview
        base64: resizedBase64,
        dateAdded: new Date().toISOString(),
        processed: true,
      };

      addFile(resizedFile);
      setSelectedFile(null);
      alert("Image resized and saved to dashboard!");
    } catch (err) {
      setError("Failed to save resized image");
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center dark:text-slate-300">
        Image Resizer
      </h1>

      {imageFiles.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <p className="text-gray-600 mb-4">No images available to resize.</p>
          <button
            onClick={() => router.push("/upload")}
            className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Upload Images
          </button>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* File Selection */}
          <div className="lg:col-span-1 bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              Select Image
            </h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {imageFiles.map(file => (
                <div
                  key={file.id}
                  onClick={() => setSelectedFile(file)}
                  className={`p-3 rounded-md cursor-pointer transition-colors ${
                    selectedFile?.id === file.id
                      ? "bg-indigo-50 border-2 border-indigo-300"
                      : "bg-gray-50 hover:bg-gray-100 border-2 border-transparent"
                  }`}
                >
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Resize Controls & Preview */}
          <div className="lg:col-span-2 space-y-6">
            {selectedFile ? (
              <>
                {/* Preview */}
                <div className="bg-white p-4 rounded-lg shadow-md">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800">
                    Preview
                  </h3>
                  <div className="bg-gray-100 rounded-lg p-4 flex items-center justify-center min-h-[300px]">
                    {isLoading ? (
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading image...</p>
                      </div>
                    ) : preview ? (
                      <Image
                        src={preview}
                        alt="Preview"
                        className="max-w-full max-h-[400px] object-contain"
                      />
                    ) : (
                      <p className="text-gray-400">No preview available</p>
                    )}
                  </div>
                </div>

                {/* Controls */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800">
                    Resize Settings
                  </h3>

                  {error && (
                    <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
                      {error}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Width (px)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="10000"
                        value={width}
                        onChange={handleWidthChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Height (px)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="10000"
                        value={height}
                        onChange={handleHeightChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 text-gray-900"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-6">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={maintainAspectRatio}
                        onChange={e => setMaintainAspectRatio(e.target.checked)}
                        className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                      />
                      <span className="text-sm text-gray-700">
                        Maintain aspect ratio
                      </span>
                    </label>
                    <button
                      onClick={handleReset}
                      className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                    >
                      Reset to original
                    </button>
                  </div>

                  <div className="text-sm text-gray-600 mb-6 p-3 bg-gray-50 rounded-md">
                    <p>
                      Original: {originalWidth} × {originalHeight} px
                    </p>
                    <p>
                      New: {width} × {height} px
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setSelectedFile(null)}
                      className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={isProcessing || width <= 0 || height <= 0}
                      className="flex-1 py-3 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
                    >
                      {isProcessing ? "Saving..." : "Save Resized Image"}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white p-12 rounded-lg shadow-md text-center">
                <Image
                  src="choose2.svg"
                  alt="Select image"
                  width={120}
                  height={120}
                  className="mx-auto mb-4 opacity-50"
                />
                <p className="text-gray-600">
                  Select an image from the list to start resizing
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default ResizePage;
