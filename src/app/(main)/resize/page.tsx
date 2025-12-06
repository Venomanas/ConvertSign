"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useFileContext } from "@/context/FileContext";
import { useRouter } from "next/navigation";
// import Image from "next/image";
import AnimatedButton from "@/components/Animatedbutton";
import { FileObject } from "@/utils/authUtils";
import { useToast } from "@/context/ToastContext";
import { motion } from "framer-motion"; // 👈 only motion is enough here
import PageTransition from "@/components/PageTransition";

// Aspect ratio presets
const ASPECT_RATIOS = [
  { label: "Original", value: null },
  { label: "16:9 (Landscape)", value: 16 / 9 },
  { label: "9:16 (Portrait)", value: 9 / 16 },
  { label: "4:3", value: 4 / 3 },
  { label: "1:1 (Square)", value: 1 },
  { label: "21:9 (Ultrawide)", value: 21 / 9 },
];

// Size presets based on file size
const SIZE_PRESETS = [
  { label: "Small (< 100 KB)", maxWidth: 800, quality: 0.7 },
  { label: "Medium (< 300 KB)", maxWidth: 1200, quality: 0.8 },
  { label: "Large (< 500 KB)", maxWidth: 1600, quality: 0.85 },
  { label: "Original Quality", maxWidth: null, quality: 0.95 },
];

const ResizePage: React.FC = () => {
  const router = useRouter();
  const { files, addFile, isLoading: filesLoading } = useFileContext();
  const [selectedFile, setSelectedFile] = useState<FileObject | null>(null);
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const [originalWidth, setOriginalWidth] = useState<number>(0);
  const [originalHeight, setOriginalHeight] = useState<number>(0);
  const [maintainAspectRatio, setMaintainAspectRatio] = useState<boolean>(true);
  const [aspectRatio, setAspectRatio] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false); // image preview loading
  const [preview, setPreview] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [customFileName, setCustomFileName] = useState<string>("");
  const [selectedPresetRatio, setSelectedPresetRatio] = useState<number | null>(
    null
  );
  const [selectedSizePreset, setSelectedSizePreset] = useState<number>(3);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const { showToast } = useToast();

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

      const nameWithoutExt = selectedFile.name.replace(/\.[^/.]+$/, "");
      setCustomFileName(`${nameWithoutExt}_resized`);
    };

    image.onerror = () => {
      setError("Failed to load image");
      setIsLoading(false);
    };

    image.crossOrigin = "anonymous";

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

      const preset = SIZE_PRESETS[selectedSizePreset];
      setPreview(canvas.toDataURL("image/png", preset.quality));
    } catch (err) {
      console.error("Preview error:", err);
    }
  }, [width, height, isLoading, selectedSizePreset]);

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
    setSelectedPresetRatio(null);
  };

  const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newHeight = Math.max(1, parseInt(e.target.value) || 1);
    setHeight(newHeight);
    if (maintainAspectRatio && aspectRatio > 0) {
      setWidth(Math.round(newHeight * aspectRatio));
    }
    setSelectedPresetRatio(null);
  };

  const handleAspectRatioPreset = (ratio: number | null) => {
    setSelectedPresetRatio(ratio);

    if (ratio === null) {
      setWidth(originalWidth);
      setHeight(originalHeight);
      setAspectRatio(originalWidth / originalHeight);
    } else {
      setAspectRatio(ratio);
      const newHeight = Math.round(width / ratio);
      setHeight(newHeight);
      setMaintainAspectRatio(true);
    }
  };

  const handleSizePreset = (presetIndex: number) => {
    setSelectedSizePreset(presetIndex);
    const preset = SIZE_PRESETS[presetIndex];

    if (preset.maxWidth && originalWidth > preset.maxWidth) {
      const newWidth = preset.maxWidth;
      setWidth(newWidth);
      if (maintainAspectRatio && aspectRatio > 0) {
        setHeight(Math.round(newWidth / aspectRatio));
      }
    }
  };

  const handleReset = () => {
    setWidth(originalWidth);
    setHeight(originalHeight);
    setAspectRatio(originalWidth / originalHeight);
    setSelectedPresetRatio(null);
    setSelectedSizePreset(3);
    setMaintainAspectRatio(true);
  };

  const handleSave = async () => {
    if (!canvasRef.current || !selectedFile) return;

    if (!customFileName.trim()) {
      setError("Please enter a file name");
      return;
    }

    setIsProcessing(true);
    setError("");

    try {
      const preset = SIZE_PRESETS[selectedSizePreset];
      const resizedBase64 = canvasRef.current.toDataURL(
        "image/png",
        preset.quality
      );

      const cleanFileName = customFileName.trim().replace(/\.png$/i, "");
      const finalFileName = `${cleanFileName}.png`;

      const resizedFile: FileObject = {
        id: `resized_${Date.now()}`,
        name: finalFileName,
        type: "image/png",
        size: Math.round((resizedBase64.length * 3) / 4),
        url: resizedBase64,
        base64: resizedBase64,
        dateAdded: new Date().toISOString(),
        processed: true,
      };

      addFile(resizedFile);
      setSelectedFile(null);
      setCustomFileName("");
      showToast("Image resized and saved to dashboard ", "success");
    } catch (err) {
      setError("Failed to save resized image");
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const estimatedSize = preview
    ? Math.round((preview.length * 3) / 4 / 1024)
    : 0;

  return (
    <PageTransition>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 sm:mb-8 text-center dark:text-slate-300">
          Image Resizer
        </h1>

        {filesLoading ? (
          // 🔹 Skeleton while files load from IndexedDB
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="lg:col-span-1 bg-white p-4 rounded-lg shadow-md">
              <div className="h-5 w-32 bg-gray-200 rounded mb-4 animate-pulse" />
              <div className="space-y-2 max-h-60 sm:max-h-96 overflow-y-auto">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="p-2 sm:p-3 rounded-md bg-gray-100 animate-pulse"
                  >
                    <div className="h-3 bg-gray-300 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              <div className="bg-white p-4 rounded-lg shadow-md">
                <div className="h-5 w-32 bg-gray-200 rounded mb-4 animate-pulse" />
                <div className="rounded-lg p-4 min-h-[200px] sm:min-h-[300px] bg-gray-100 animate-pulse" />
              </div>
              <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
                <div className="h-5 w-40 bg-gray-200 rounded mb-4 animate-pulse" />
                <div className="space-y-3">
                  <div className="h-10 bg-gray-100 rounded-md animate-pulse" />
                  <div className="h-10 bg-gray-100 rounded-md animate-pulse" />
                  <div className="h-10 bg-gray-100 rounded-md animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        ) : imageFiles.length === 0 ? (
          <div className="text-center py-8 sm:py-12 bg-white rounded-lg shadow-sm">
            <p className="text-gray-600 mb-4 px-4">
              No images available to resize.
            </p>
            <AnimatedButton
              onClick={() => router.push("/upload")}
              className="px-4 sm:px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm sm:text-base"
            >
              Upload Images
            </AnimatedButton>
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            {/* File Selection */}
            <div className="lg:col-span-1 bg-white p-4 rounded-lg shadow-md">
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-gray-800">
                Select Image
              </h3>
              <div className="space-y-2 max-h-60 sm:max-h-96 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {" "}
                {imageFiles.map((file, index) => (
                  <motion.button
                    key={file.id}
                    type="button"
                    onClick={() => setSelectedFile(file)}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.02 }}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full text-left p-2 sm:p-3 rounded-md cursor-pointer transition-colors ${
                      selectedFile?.id === file.id
                        ? "bg-indigo-50 border-2 border-indigo-700"
                        : "bg-gray-50 hover:bg-gray-100 border-2 border-transparent"
                    }`}
                  >
                    <p className="sm:text-sm font-medium text-gray-900 truncate">
                      {file.name}
                    </p>
                    <p className="text-gray-400">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Resize Controls & Preview */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              {selectedFile ? (
                <motion.div
                  className="bg-white p-4 sm:p-6 rounded-lg shadow-md"
                  whileHover={{
                    y: -2,
                    boxShadow: "0 15px 30px rgba(15,23,42,0.12)",
                  }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                >
                  {/* Preview */}
                  <div className="bg-white p-4 rounded-lg shadow-md">
                    <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-gray-800">
                      Preview
                    </h3>
                    <div className="rounded-lg p-4 flex items-center justify-center min-h-[200px] sm:min-h-[300px]">
                      {isLoading ? (
                        <motion.div className="text-center">
                          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-indigo-600 mx-auto"></div>
                          <p className="mt-4 text-gray-600 text-sm">
                            Loading image...
                          </p>
                        </motion.div>
                      ) : preview ? (
                        <motion.img
                          key={preview}
                          src={preview}
                          alt="Preview"
                          initial={{ opacity: 0, scale: 0.98 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.2, ease: "easeOut" }}
                          className="max-w-full max-h-[300px] sm:max-h-[400px] object-contain"
                        />
                      ) : (
                        <p className="text-gray-400 text-sm">
                          No preview available
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
                    <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-gray-800">
                      Resize Settings
                    </h3>

                    {error && (
                      <div className="mb-4 p-2 sm:p-3 bg-red-50 text-red-700 rounded-md  sm:text-sm break-words">
                        {error}
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4">
                      <div>
                        <label className="block sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                          Width (px)
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="10000"
                          value={width}
                          onChange={handleWidthChange}
                          className="w-full px-2 sm:px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 text-gray-900"
                        />
                      </div>
                      <div>
                        <label className="block sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                          Height (px)
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="10000"
                          value={height}
                          onChange={handleHeightChange}
                          className="w-full px-2 sm:px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 text-gray-900"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={maintainAspectRatio}
                          onChange={e =>
                            setMaintainAspectRatio(e.target.checked)
                          }
                          className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                        />
                        <span className="sm:text-sm text-gray-700">
                          Maintain aspect ratio
                        </span>
                      </label>
                      <AnimatedButton
                        onClick={handleReset}
                        className=" sm:flex-1 py-2 sm:py-3 px-4 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
                      >
                        Reset to original
                      </AnimatedButton>
                    </div>

                    {/* Aspect Ratio Presets */}
                    <div className="mb-4">
                      <label className="block sm:text-sm font-medium text-gray-700 mb-2">
                        Aspect Ratio Presets
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {ASPECT_RATIOS.map((preset, index) => (
                          <AnimatedButton
                            key={index}
                            onClick={() =>
                              handleAspectRatioPreset(preset.value)
                            }
                            className={`px-3 py-2 sm:text-sm rounded-md border transition-colors ${
                              selectedPresetRatio === preset.value
                                ? "bg-indigo-50 border-indigo-500 text-indigo-700"
                                : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                            }`}
                          >
                            {preset.label}
                          </AnimatedButton>
                        ))}
                      </div>
                    </div>

                    {/* Size Presets */}
                    <div className="mb-4">
                      <label className="block text-2xl sm:text-sm font-medium text-gray-700 mb-2">
                        File Size Presets
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {SIZE_PRESETS.map((preset, index) => (
                          <AnimatedButton
                            key={index}
                            onClick={() => handleSizePreset(index)}
                            className={`px-3 py-2 sm:text-sm rounded-md border transition-colors ${
                              selectedSizePreset === index
                                ? "bg-indigo-50 border-indigo-500 text-indigo-700"
                                : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                            }`}
                          >
                            {preset.label}
                          </AnimatedButton>
                        ))}
                      </div>
                    </div>

                    {/* File Name Input */}
                    <div className="mb-4">
                      <label className="block sm:text-sm font-medium text-gray-700 mb-2">
                        File Name
                      </label>
                      <input
                        type="text"
                        value={customFileName}
                        onChange={e => setCustomFileName(e.target.value)}
                        placeholder="Enter file name"
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 text-gray-900"
                      />
                      <p className="text-gray-500 mt-1">
                        File will be saved as: {customFileName || "untitled"}
                        .png
                      </p>
                    </div>

                    <div className="sm:text-sm text-gray-600 mb-4 sm:mb-6 p-2 sm:p-3 bg-gray-50 rounded-md space-y-1">
                      <p>
                        Original: {originalWidth} × {originalHeight} px (
                        {(selectedFile.size / 1024).toFixed(1)} KB)
                      </p>
                      <p>
                        New: {width} × {height} px (~{estimatedSize} KB)
                      </p>
                      <p className="text-indigo-600 font-medium">
                        Current Ratio: {(width / height).toFixed(2)}:1
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                      <AnimatedButton
                        onClick={() => {
                          setSelectedFile(null);
                          setCustomFileName("");
                          setError("");
                        }}
                        className="w-full sm:flex-1 py-2 sm:py-3 px-4 text-sm border border-gray-300 text-slate-700 rounded-md hover:bg-slate-50 font-medium"
                      >
                        Cancel
                      </AnimatedButton>
                      <AnimatedButton
                        onClick={handleSave}
                        disabled={
                          isProcessing ||
                          width <= 0 ||
                          height <= 0 ||
                          !customFileName.trim()
                        }
                        className="w-full sm:flex-1 py-2 sm:py-3 px-4 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
                      >
                        {isProcessing ? "Saving..." : "Save Resized Image"}
                      </AnimatedButton>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="bg-white p-8 sm:p-12 rounded-lg shadow-md text-center">
                  <div className="w-24 h-24 mx-auto mb-4 opacity-50 bg-gray-200 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-12 h-12 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-600 px-4">
                    Select an image from the list to start resizing
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        <canvas ref={canvasRef} className="hidden" />

        <div className="mt-6 sm:mt-8 ">
          <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center text-gray-800 dark:text-slate-300">
            How to use
          </h3>
          <div className="bg-white p-4 rounded-lg text-xs sm:text-sm text-gray-600 shadow-sm">
            <div className="mt-1  rounded-lg p-6">
              <ol className="space-y-3 space-x-1">
                {[
                  "Upload your image",
                  "preview chnages ",
                  "rename resized image",
                  "Download or Delete images anytime from your dashboard",
                ].map((step, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                      {index + 1}
                    </div>
                    <p className="text-gray-700 pt-0.5">{step}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default ResizePage;
