"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  Fragment,
} from "react";
import { Dialog, Transition } from "@headlessui/react";
import {
  CheckCircleIcon,
  XMarkIcon,
  AdjustmentsHorizontalIcon,
  LockClosedIcon,
  LockOpenIcon,
  ArrowPathIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";

// Define the file object interface
export interface FileObject {
  id: string;
  name: string;
  type: string;
  size: number;
  base64: string;
  width?: number; // Added for new dimensions
  height?: number; // Added for new dimensions
}

export interface ImageResizerProps {
  file: FileObject;
  onSave: (resizedFile: FileObject) => void;
  onCancel: () => void;
}

// Helper function to convert a file to a base64 string
const fileToBase64 = (file: File) => {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
    reader.readAsDataURL(file);
  });
};

const ImageResizer: React.FC<ImageResizerProps> = ({
  file,
  onSave,
  onCancel,
}) => {
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const [originalWidth, setOriginalWidth] = useState<number>(0);
  const [originalHeight, setOriginalHeight] = useState<number>(0);
  const [maintainAspectRatio, setMaintainAspectRatio] = useState<boolean>(true);
  const [aspectRatio, setAspectRatio] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [preview, setPreview] = useState<string>("");
  const [error, setError] = useState<string>("");

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  // Use a minimal approach to detect image type from base64 data
  const detectImageType = useCallback((base64: string): string => {
    if (base64.startsWith("data:image/jpeg")) return "image/jpeg";
    if (base64.startsWith("data:image/png")) return "image/png";
    if (base64.startsWith("data:image/gif")) return "image/gif";
    if (base64.startsWith("data:image/webp")) return "image/webp";
    return "image/png";
  }, []);

  // Load the image and set initial dimensions
  useEffect(() => {
    if (!file || !file.base64) {
      setError("No valid image file provided.");
      setIsLoading(false);
      return;
    }

    setError("");
    setIsLoading(true);

    const image = new window.Image();
    image.onload = () => {
      try {
        setOriginalWidth(image.width);
        setOriginalHeight(image.height);
        setWidth(image.width);
        setHeight(image.height);
        setAspectRatio(image.width / image.height);
        imageRef.current = image;
        setPreview(image.src);
        setIsLoading(false);
      } catch {
        setError("Failed to process image.");
        setIsLoading(false);
      }
    };
    image.onerror = () => {
      setError("Failed to load image. The image data may be corrupted.");
      setIsLoading(false);
    };

    image.crossOrigin = "anonymous";
    image.src = file.base64;
  }, [file]);

  // Update the canvas preview when dimensions change
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

      if (!ctx) {
        setError("Canvas context not available");
        return;
      }

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

      // Generate preview with detected image type
      const detectedType = detectImageType(file.base64);
      setPreview(canvas.toDataURL(detectedType, 0.95));
    } catch {
      setError("Failed to generate preview.");
    }
  }, [width, height, isLoading, file.base64, detectImageType]);

  useEffect(() => {
    updatePreview();
  }, [updatePreview]);

  // Handle width change, maintaining aspect ratio if needed
  const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newWidth = Math.max(1, parseInt(e.target.value, 10) || 1);
    setWidth(newWidth);

    if (maintainAspectRatio && aspectRatio > 0) {
      setHeight(Math.max(1, Math.round(newWidth / aspectRatio)));
    }
  };

  // Handle height change, maintaining aspect ratio if needed
  const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newHeight = Math.max(1, parseInt(e.target.value, 10) || 1);
    setHeight(newHeight);

    if (maintainAspectRatio && aspectRatio > 0) {
      setWidth(Math.max(1, Math.round(newHeight * aspectRatio)));
    }
  };

  // Toggle aspect ratio lock
  const toggleAspectRatio = () => {
    setMaintainAspectRatio(prev => !prev);
  };

  // Reset to original dimensions
  const handleReset = () => {
    setWidth(originalWidth);
    setHeight(originalHeight);
  };

  // Save the resized image
  const handleSave = () => {
    if (!canvasRef.current) {
      setError("Canvas not available for save");
      return;
    }

    try {
      const detectedType = detectImageType(file.base64);
      const resizedBase64 = canvasRef.current.toDataURL(detectedType, 0.95);

      if (!resizedBase64 || resizedBase64 === "data:,") {
        setError("Failed to generate valid base64 data.");
        return;
      }

      // Create a new file object with resized dimensions and correct type
      const resizedFile: FileObject = {
        ...file,
        base64: resizedBase64,
        type: detectedType,
        width,
        height,
        size: Math.round((resizedBase64.length * 3) / 4),
      };

      onSave(resizedFile);
    } catch {
      setError("Failed to save resized image.");
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 p-6 rounded-xl bg-slate-50 border border-slate-200 shadow-md">
      {/* Resizer Controls */}
      <div className="flex-1 md:order-2">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-800">Resize Image</h3>
          <button
            onClick={onCancel}
            className="p-1 rounded-full text-gray-500 hover:bg-gray-200 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-48">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-500 mb-4"></div>
              <p className="text-gray-600 font-medium">Loading image...</p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center p-8 bg-red-100 border border-red-300 rounded-lg">
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        ) : (
          <>
            <div className="space-y-4 mb-6">
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Width (px)
                </label>
                <input
                  type="number"
                  min="1"
                  max="10000"
                  value={width}
                  onChange={handleWidthChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                />
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Height (px)
                </label>
                <input
                  type="number"
                  min="1"
                  max="10000"
                  value={height}
                  onChange={handleHeightChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-sm text-gray-700 mr-2">
                    Maintain Aspect Ratio
                  </span>
                  <button
                    onClick={toggleAspectRatio}
                    className="p-1 rounded-full text-blue-500 hover:bg-blue-100 transition-colors"
                  >
                    {maintainAspectRatio ? (
                      <LockClosedIcon className="w-5 h-5" />
                    ) : (
                      <LockOpenIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>
                <button
                  onClick={handleReset}
                  className="inline-flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <ArrowPathIcon className="w-4 h-4" />
                  Reset
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={onCancel}
                className="flex-1 py-3 px-6 rounded-xl border border-gray-300 text-gray-800 font-semibold shadow-sm hover:bg-gray-100 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={width <= 0 || height <= 0}
                className="flex-1 py-3 px-6 rounded-xl bg-blue-600 text-white font-semibold shadow-md hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-all"
              >
                Apply Resize
              </button>
            </div>
          </>
        )}
      </div>

      {/* Preview Section */}
      <div className="flex-1 md:order-1">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-inner">
          <div className="flex items-center gap-2 mb-2">
            <AdjustmentsHorizontalIcon className="w-5 h-5 text-gray-500" />
            <span className="text-sm text-gray-600 font-medium">
              Original: {originalWidth}x{originalHeight}px
            </span>
            <span className="text-sm text-gray-600 font-medium">|</span>
            <span className="text-sm text-gray-600 font-medium">
              New: {width}x{height}px
            </span>
          </div>
          <div className="relative w-full h-auto max-h-[400px] overflow-hidden rounded-lg">
            {preview ? (
              <Image
                src={preview}
                alt="Resized preview"
                className="w-full h-auto object-contain"
                style={{ maxHeight: "380px" }}
              />
            ) : (
              <div className="flex justify-center items-center h-full min-h-[200px] bg-gray-100 text-gray-400 text-center p-8">
                Preview not available
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hidden canvas for image processing */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

// Main App Component to demonstrate the ImageResizer
export default function App() {
  const [file, setFile] = useState<FileObject | null>(null);
  const [resizedFile, setResizedFile] = useState<FileObject | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      try {
        const base64 = await fileToBase64(selectedFile);
        const newFileObject: FileObject = {
          id: crypto.randomUUID(),
          name: selectedFile.name,
          type: selectedFile.type,
          size: selectedFile.size,
          base64: base64,
        };
        setFile(newFileObject);
        setResizedFile(null); // Clear previous resized file
      } catch (err) {
        console.error("Error converting file to base64:", err);
      }
    }
  };

  const handleSave = (newFile: FileObject) => {
    setResizedFile(newFile);
    setFile(null); // Hide the resizer component
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setFile(null);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Function to handle the download of the resized image
  const handleDownload = () => {
    if (resizedFile) {
      const link = document.createElement("a");
      link.href = resizedFile.base64;
      link.download = `resized-${resizedFile.name}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 min-h-screen bg-gray-100 font-sans">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Image Resizer</h1>

      {!file && (
        <div className="w-full max-w-lg p-8 bg-white rounded-xl shadow-md border border-gray-200 text-center">
          <label htmlFor="file-upload" className="block w-full cursor-pointer">
            <div className="bg-blue-600 text-white rounded-lg px-6 py-3 font-semibold hover:bg-blue-700 transition-colors">
              Select an Image to Resize
            </div>
          </label>
          <input
            id="file-upload"
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      )}

      {file && (
        <div className="w-full max-w-4xl">
          <ImageResizer
            file={file}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        </div>
      )}

      <Transition appear show={isModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/30" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900 flex items-center gap-2"
                  >
                    <CheckCircleIcon className="w-6 h-6 text-green-500" />
                    Image Resized!
                  </Dialog.Title>
                  <div className="mt-2">
                    {resizedFile && (
                      <div className="text-sm text-gray-500">
                        <p>Your image was successfully resized to:</p>
                        <p className="font-semibold text-gray-700">
                          {resizedFile.name}
                        </p>
                        <Image
                          src={resizedFile.base64}
                          alt="Resized Image"
                          className="mt-4 max-w-full h-auto rounded-lg shadow-sm"
                        />
                        <div className="mt-4 text-xs text-gray-500">
                          <p>
                            New Size: {(resizedFile.size / 1024).toFixed(2)} KB
                          </p>
                          <p>
                            New Dimensions: {resizedFile.width}x
                            {resizedFile.height}px
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex flex-col sm:flex-row justify-end gap-2">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      onClick={handleDownload}
                    >
                      <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
                      Download Image
                    </button>
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      onClick={closeModal}
                    >
                      Got it!
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}
