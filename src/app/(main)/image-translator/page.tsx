"use client";

import React, { useState, useRef, useCallback } from "react";
import Tesseract from "tesseract.js";
import PageTransition from "@/components/PageTransition";
import Animatedbutton from "@/components/Animatedbutton";
import { useToast } from "@/context/ToastContext";
import {
  LanguageIcon,
  PhotoIcon,
  ClipboardDocumentIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

const ImageTranslator: React.FC = () => {
  const { showToast } = useToast();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [sourceLanguage, setSourceLanguage] = useState("eng");
  const [targetLanguage, setTargetLanguage] = useState("es");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState<"idle" | "extracting" | "translating">(
    "idle",
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const languages = [
    { code: "eng", name: "English", translateCode: "en" },
    { code: "hin", name: "Hindi", translateCode: "hi" },
    { code: "spa", name: "Spanish", translateCode: "es" },
    { code: "fra", name: "French", translateCode: "fr" },
    { code: "deu", name: "German", translateCode: "de" },
    { code: "jpn", name: "Japanese", translateCode: "ja" },
    { code: "chi_sim", name: "Chinese", translateCode: "zh" },
    { code: "ara", name: "Arabic", translateCode: "ar" },
  ];

  const targetLanguages = [
    { code: "en", name: "English" },
    { code: "hi", name: "Hindi" },
    { code: "es", name: "Spanish" },
    { code: "fr", name: "French" },
    { code: "de", name: "German" },
    { code: "ja", name: "Japanese" },
    { code: "zh", name: "Chinese" },
    { code: "ar", name: "Arabic" },
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
      setTranslatedText("");
    };
    reader.readAsDataURL(file);
  };

  const processImage = useCallback(async () => {
    if (!selectedImage) {
      showToast("Please upload an image first", "error");
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setStep("extracting");
    setExtractedText("");
    setTranslatedText("");

    try {
      // Step 1: Extract text with OCR
      const result = await Tesseract.recognize(selectedImage, sourceLanguage, {
        logger: m => {
          if (m.status === "recognizing text") {
            setProgress(Math.round(m.progress * 50)); // 0-50%
          }
        },
      });

      const text = result.data.text.trim();
      if (!text) {
        throw new Error("No text found in image");
      }
      setExtractedText(text);

      // Step 2: Translate using free API
      setStep("translating");
      setProgress(60);

      const sourceLang =
        languages.find(l => l.code === sourceLanguage)?.translateCode || "en";

      // Using LibreTranslate or similar free API
      const response = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${targetLanguage}`,
      );

      if (!response.ok) {
        throw new Error("Translation failed");
      }

      const data = await response.json();
      setProgress(100);

      if (data.responseStatus === 200) {
        setTranslatedText(data.responseData.translatedText);
        showToast("Translation complete!", "success");
      } else {
        throw new Error("Translation API error");
      }
    } catch (error) {
      console.error("Processing error:", error);
      showToast(
        error instanceof Error ? error.message : "Processing failed",
        "error",
      );
    } finally {
      setIsProcessing(false);
      setStep("idle");
    }
  }, [selectedImage, sourceLanguage, targetLanguage, showToast]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast("Copied to clipboard!", "success");
    } catch {
      showToast("Failed to copy", "error");
    }
  };

  return (
    <PageTransition>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl mb-4">
            <LanguageIcon className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Image Translator
          </h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            Extract text from images and translate to another language
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload & Settings */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Upload Image
            </h2>

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
                  className="w-full max-h-48 object-contain rounded-xl bg-slate-100 dark:bg-slate-900"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute top-2 right-2 p-2 bg-indigo-600 text-white rounded-lg text-sm"
                >
                  Change
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="cursor-pointer p-8 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl text-center hover:border-indigo-400 transition-colors mb-4"
              >
                <PhotoIcon className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <p className="text-slate-500">Click to upload an image</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Source Language
                </label>
                <select
                  value={sourceLanguage}
                  onChange={e => setSourceLanguage(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl py-2.5 px-4"
                >
                  {languages.map(lang => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Target Language
                </label>
                <select
                  value={targetLanguage}
                  onChange={e => setTargetLanguage(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl py-2.5 px-4"
                >
                  {targetLanguages.map(lang => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {isProcessing && (
              <div className="mb-4">
                <div className="flex justify-between text-sm text-slate-500 mb-1">
                  <span>
                    {step === "extracting"
                      ? "Extracting text..."
                      : "Translating..."}
                  </span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-indigo-600 h-2 rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            <Animatedbutton
              onClick={processImage}
              disabled={isProcessing || !selectedImage}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold rounded-xl flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <ArrowPathIcon className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <LanguageIcon className="w-5 h-5" />
                  Translate Image
                </>
              )}
            </Animatedbutton>
          </div>

          {/* Results */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  Extracted Text
                </h3>
                {extractedText && (
                  <button
                    onClick={() => copyToClipboard(extractedText)}
                    className="text-indigo-600 hover:text-indigo-700"
                  >
                    <ClipboardDocumentIcon className="w-5 h-5" />
                  </button>
                )}
              </div>
              <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 min-h-20">
                <p className="text-slate-700 dark:text-slate-300 text-sm">
                  {extractedText || "Extracted text will appear here..."}
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  Translated Text
                </h3>
                {translatedText && (
                  <button
                    onClick={() => copyToClipboard(translatedText)}
                    className="text-indigo-600 hover:text-indigo-700"
                  >
                    <ClipboardDocumentIcon className="w-5 h-5" />
                  </button>
                )}
              </div>
              <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4 min-h-20">
                <p className="text-emerald-800 dark:text-emerald-200 text-sm">
                  {translatedText || "Translation will appear here..."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default ImageTranslator;
