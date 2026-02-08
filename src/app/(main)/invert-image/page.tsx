"use client";

import React, { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import PageTransition from "@/components/PageTransition";
import Animatedbutton from "@/components/Animatedbutton";
import { useToast } from "@/context/ToastContext";
import {
  PhotoIcon,
  ArrowDownTrayIcon,
  ArrowPathIcon,
  ArrowsRightLeftIcon,
} from "@heroicons/react/24/outline";

const InvertImage: React.FC = () => {
  const { showToast } = useToast();
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [invertedImage, setInvertedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("Please upload an image file", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = e => {
      setOriginalImage(e.target?.result as string);
      setInvertedImage(null);
    };
    reader.readAsDataURL(file);
  };

  const invertColors = useCallback(async () => {
    if (!originalImage || !canvasRef.current) return;

    setIsProcessing(true);

    try {
      const img = new Image();
      img.crossOrigin = "anonymous";

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Failed to load image"));
        img.src = originalImage;
      });

      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not get canvas context");

      canvas.width = img.width;
      canvas.height = img.height;

      // Draw original image
      ctx.drawImage(img, 0, 0);

      // Get image data
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Invert colors
      for (let i = 0; i < data.length; i += 4) {
        data[i] = 255 - data[i]; // Red
        data[i + 1] = 255 - data[i + 1]; // Green
        data[i + 2] = 255 - data[i + 2]; // Blue
        // Alpha channel (data[i + 3]) stays the same
      }

      // Put inverted data back
      ctx.putImageData(imageData, 0, 0);

      // Convert to data URL
      const dataUrl = canvas.toDataURL("image/png");
      setInvertedImage(dataUrl);
      showToast("Image inverted successfully!", "success");
    } catch (error) {
      console.error("Invert error:", error);
      showToast("Failed to invert image", "error");
    } finally {
      setIsProcessing(false);
    }
  }, [originalImage, showToast]);

  const downloadImage = () => {
    if (!invertedImage) return;

    const link = document.createElement("a");
    link.download = `inverted-${Date.now()}.png`;
    link.href = invertedImage;
    link.click();
    showToast("Image downloaded!", "success");
  };

  const clearAll = () => {
    setOriginalImage(null);
    setInvertedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <PageTransition>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl mb-4">
            <ArrowsRightLeftIcon className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Invert Image
          </h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            Invert the colors of any image instantly
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
          {/* Upload */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />

          {!originalImage && (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="cursor-pointer p-12 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl text-center hover:border-indigo-400 transition-colors"
            >
              <PhotoIcon className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <p className="text-lg text-slate-500 dark:text-slate-400">
                Click to upload an image
              </p>
              <p className="text-sm text-slate-400 mt-1">
                Supports JPG, PNG, GIF, BMP
              </p>
            </div>
          )}

          {/* Image Comparison */}
          {originalImage && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Original */}
                <div>
                  <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
                    Original
                  </h3>
                  <div className="bg-slate-100 dark:bg-slate-900 rounded-xl p-2 overflow-hidden">
                    <img
                      src={originalImage}
                      alt="Original"
                      className="w-full max-h-80 object-contain rounded-lg"
                    />
                  </div>
                </div>

                {/* Inverted */}
                <div>
                  <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
                    Inverted
                  </h3>
                  <div className="bg-slate-100 dark:bg-slate-900 rounded-xl p-2 overflow-hidden min-h-40 flex items-center justify-center">
                    {invertedImage ? (
                      <motion.img
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        src={invertedImage}
                        alt="Inverted"
                        className="w-full max-h-80 object-contain rounded-lg"
                      />
                    ) : (
                      <p className="text-slate-400">
                        Click &quot;Invert Colors&quot; to see result
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-3 justify-center">
                <Animatedbutton
                  onClick={invertColors}
                  disabled={isProcessing}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold rounded-xl transition-colors flex items-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <ArrowPathIcon className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <ArrowsRightLeftIcon className="w-5 h-5" />
                      Invert Colors
                    </>
                  )}
                </Animatedbutton>

                {invertedImage && (
                  <Animatedbutton
                    onClick={downloadImage}
                    className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-colors flex items-center gap-2"
                  >
                    <ArrowDownTrayIcon className="w-5 h-5" />
                    Download
                  </Animatedbutton>
                )}

                <Animatedbutton
                  onClick={clearAll}
                  className="px-6 py-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  Clear
                </Animatedbutton>
              </div>
            </>
          )}

          {/* Hidden canvas for processing */}
          <canvas ref={canvasRef} className="hidden" />
        </div>
      </div>
    </PageTransition>
  );
};

export default InvertImage;
