"use client";

import React, { useState, useRef, useCallback } from "react";
import Tesseract from "tesseract.js";
import { motion } from "framer-motion";
import PageTransition from "@/components/PageTransition";
import Animatedbutton from "@/components/Animatedbutton";
import { useToast } from "@/context/ToastContext";
import {
  DocumentTextIcon,
  PhotoIcon,
  ClipboardDocumentIcon,
  ArrowDownTrayIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

const ImageToText: React.FC = () => {
  const { showToast } = useToast();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [language, setLanguage] = useState("eng");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const languages = [
    { code: "eng", name: "English" },
    { code: "hin", name: "Hindi" },
    { code: "spa", name: "Spanish" },
    { code: "fra", name: "French" },
    { code: "deu", name: "German" },
    { code: "chi_sim", name: "Chinese (Simplified)" },
    { code: "jpn", name: "Japanese" },
    { code: "ara", name: "Arabic" },
  ];

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("Please upload an image file", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = e => {
      setSelectedImage(e.target?.result as string);
      setExtractedText("");
      setProgress(0);
    };
    reader.readAsDataURL(file);
  };

  const extractText = useCallback(async () => {
    if (!selectedImage) {
      showToast("Please upload an image first", "error");
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setExtractedText("");

    try {
      const result = await Tesseract.recognize(selectedImage, language, {
        logger: m => {
          if (m.status === "recognizing text") {
            setProgress(Math.round(m.progress * 100));
          }
        },
      });

      setExtractedText(result.data.text);
      showToast("Text extracted successfully!", "success");
    } catch (error) {
      console.error("OCR error:", error);
      showToast("Failed to extract text", "error");
    } finally {
      setIsProcessing(false);
    }
  }, [selectedImage, language, showToast]);

  const copyToClipboard = async () => {
    if (!extractedText) return;

    try {
      await navigator.clipboard.writeText(extractedText);
      showToast("Copied to clipboard!", "success");
    } catch (error) {
      console.error("Copy error:", error);
      showToast("Failed to copy", "error");
    }
  };

  const downloadAsText = () => {
    if (!extractedText) return;

    const blob = new Blob([extractedText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = `extracted-text-${Date.now()}.txt`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
    showToast("Text file downloaded!", "success");
  };

  const clearAll = () => {
    setSelectedImage(null);
    setExtractedText("");
    setProgress(0);
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
            <DocumentTextIcon className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Image To Text (OCR)
          </h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            Extract text from images using optical character recognition
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Upload Image
            </h2>

            {/* Language Selector */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Language
              </label>
              <select
                value={language}
                onChange={e => setLanguage(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl py-2.5 px-4 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              >
                {languages.map(lang => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Image Upload */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />

            {selectedImage ? (
              <div className="relative mb-4">
                <img
                  src={selectedImage}
                  alt="Uploaded"
                  className="w-full max-h-64 object-contain rounded-xl bg-slate-100 dark:bg-slate-900"
                />
                <Animatedbutton
                  onClick={clearAll}
                  className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg"
                >
                  <ArrowPathIcon className="w-4 h-4" />
                </Animatedbutton>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="cursor-pointer p-8 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl text-center hover:border-indigo-400 transition-colors mb-4"
              >
                <PhotoIcon className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <p className="text-slate-500 dark:text-slate-400">
                  Click to upload an image
                </p>
                <p className="text-sm text-slate-400 mt-1">
                  Supports JPG, PNG, GIF, BMP
                </p>
              </div>
            )}

            {/* Progress Bar */}
            {isProcessing && (
              <div className="mb-4">
                <div className="flex justify-between text-sm text-slate-500 mb-1">
                  <span>Processing...</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="bg-indigo-600 h-2 rounded-full"
                  />
                </div>
              </div>
            )}

            {/* Extract Button */}
            <Animatedbutton
              onClick={extractText}
              disabled={isProcessing || !selectedImage}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <ArrowPathIcon className="w-5 h-5 animate-spin" />
                  Extracting Text...
                </>
              ) : (
                <>
                  <DocumentTextIcon className="w-5 h-5" />
                  Extract Text
                </>
              )}
            </Animatedbutton>
          </div>

          {/* Result Section */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Extracted Text
              </h2>
              {extractedText && (
                <span className="text-sm text-slate-500">
                  {extractedText.length} characters
                </span>
              )}
            </div>

            {extractedText ? (
              <>
                <textarea
                  value={extractedText}
                  onChange={e => setExtractedText(e.target.value)}
                  className="w-full h-64 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl py-3 px-4 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none mb-4"
                />

                <div className="flex flex-wrap gap-3">
                  <Animatedbutton
                    onClick={copyToClipboard}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors flex items-center gap-2"
                  >
                    <ClipboardDocumentIcon className="w-4 h-4" />
                    Copy
                  </Animatedbutton>
                  <Animatedbutton
                    onClick={downloadAsText}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-colors flex items-center gap-2"
                  >
                    <ArrowDownTrayIcon className="w-4 h-4" />
                    Download .txt
                  </Animatedbutton>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <DocumentTextIcon className="w-16 h-16 text-slate-300 dark:text-slate-600 mb-4" />
                <p className="text-slate-500 dark:text-slate-400">
                  Extracted text will appear here
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default ImageToText;
