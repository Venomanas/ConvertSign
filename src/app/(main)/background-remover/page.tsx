"use client";

import React, { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PhotoIcon,
  ArrowDownTrayIcon,
  ArrowPathIcon,
  SparklesIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import PageTransition from "@/components/PageTransition";
import { FaRemoveFormat } from "react-icons/fa";
import { CgRemoveR } from "react-icons/cg";

type Stage = "idle" | "processing" | "done" | "error";

export default function BackgroundRemoverPage() {
  const [originalSrc, setOriginalSrc] = useState<string | null>(null);
  const [resultSrc, setResultSrc] = useState<string | null>(null);
  const [stage, setStage] = useState<Stage>("idle");
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const [sliderX, setSliderX] = useState(50); // before/after slider %
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const readFileAsDataURL = (file: File): Promise<string> =>
    new Promise((res, rej) => {
      const reader = new FileReader();
      reader.onload = () => res(reader.result as string);
      reader.onerror = rej;
      reader.readAsDataURL(file);
    });

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setErrorMsg("Please upload an image file (JPG, PNG, WebP).");
      setStage("error");
      return;
    }
    setErrorMsg("");
    setResultSrc(null);
    setSliderX(50);
    setFileName(file.name);

    const dataUrl = await readFileAsDataURL(file);
    setOriginalSrc(dataUrl);
    setStage("processing");
    setProgress(10);

    try {
      // Dynamic import to avoid SSR issues
      const { removeBackground } = await import("@imgly/background-removal");

      setProgress(40);

      const blob = await removeBackground(file, {
        progress: (key: string, current: number, total: number) => {
          if (total > 0) {
            const pct = Math.round((current / total) * 50) + 40;
            setProgress(Math.min(pct, 90));
          }
        },
      });

      setProgress(95);
      const url = URL.createObjectURL(blob);
      setResultSrc(url);
      setStage("done");
      setProgress(100);
    } catch (err) {
      console.error(err);
      setErrorMsg("Background removal failed. Please try a different image.");
      setStage("error");
    }
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDownload = () => {
    if (!resultSrc) return;
    const a = document.createElement("a");
    a.href = resultSrc;
    const base = fileName.replace(/\.[^.]+$/, "");
    a.download = `${base}_no_bg.png`;
    a.click();
  };

  const handleReset = () => {
    setStage("idle");
    setOriginalSrc(null);
    setResultSrc(null);
    setProgress(0);
    setFileName("");
    setErrorMsg("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Slider drag logic
  const onSliderMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const pct = ((e.clientX - rect.left) / rect.width) * 100;
    setSliderX(Math.max(0, Math.min(100, pct)));
  };

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-sm font-medium mb-4">
            <CgRemoveR className="w-8 h-8 text-indigo-500 dark:text-indigo-400" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3">
            Background Remover
          </h1>
          <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
            Remove image backgrounds instantly — no upload to servers, no API
            keys, completely private. Powered by WebAssembly AI.
          </p>
        </div>

        {/* Upload Zone */}
        <AnimatePresence mode="wait">
          {stage === "idle" && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.25 }}
            >
              <div
                onDragEnter={() => setIsDragging(true)}
                onDragLeave={() => setIsDragging(false)}
                onDragOver={e => e.preventDefault()}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-3xl p-16 cursor-pointer transition-all duration-300 ${
                  isDragging
                    ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 scale-[1.01]"
                    : "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 hover:bg-indigo-50/40 dark:hover:bg-indigo-900/10"
                }`}
              >
                <div className="p-5 bg-indigo-100 dark:bg-indigo-900/40 rounded-2xl mb-5">
                  <PhotoIcon className="w-12 h-12 text-indigo-500 dark:text-indigo-400" />
                </div>
                <p className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-1">
                  Drop your image here
                </p>
                <p className="text-sm text-slate-400 dark:text-slate-500">
                  or click to browse &mdash; JPG, PNG, WebP supported
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={onFileChange}
                />
              </div>
            </motion.div>
          )}

          {/* Processing State */}
          {stage === "processing" && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700"
            >
              {originalSrc && (
                <div className="relative w-40 h-40 rounded-2xl overflow-hidden mb-8 shadow-md">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={originalSrc}
                    alt="Processing"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <ArrowPathIcon className="w-8 h-8 text-white animate-spin" />
                  </div>
                </div>
              )}
              <p className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-2">
                Removing background…
              </p>
              <p className="text-sm text-slate-400 mb-6">
                First run downloads the AI model (~50MB, cached after that)
              </p>
              {/* Progress bar */}
              <div className="w-72 bg-slate-100 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
                <motion.div
                  className="h-full bg-indigo-500 rounded-full"
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.4 }}
                />
              </div>
              <p className="text-xs text-slate-400 mt-2">{progress}%</p>
            </motion.div>
          )}

          {/* Result State */}
          {stage === "done" && originalSrc && resultSrc && (
            <motion.div
              key="done"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Before / After Slider */}
              <div
                ref={containerRef}
                className="relative w-full aspect-video rounded-3xl overflow-hidden cursor-col-resize border border-slate-200 dark:border-slate-700 shadow-lg select-none"
                onMouseMove={onSliderMouseMove}
                style={{
                  backgroundImage:
                    "repeating-conic-gradient(#e2e8f0 0% 25%, white 0% 50%)",
                  backgroundSize: "24px 24px",
                }}
              >
                {/* Result (transparent bg) */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={resultSrc}
                  alt="Result"
                  className="absolute inset-0 w-full h-full object-contain"
                />

                {/* Original overlaid on left side */}
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: `${sliderX}%` }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={originalSrc}
                    alt="Original"
                    className="absolute inset-0 w-full h-full object-contain"
                    style={{
                      width: `${containerRef.current?.offsetWidth ?? 600}px`,
                      maxWidth: "none",
                    }}
                  />
                </div>

                {/* Divider line */}
                <div
                  className="absolute inset-y-0 w-0.5 bg-white shadow-xl"
                  style={{ left: `${sliderX}%` }}
                >
                  <div className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg border border-slate-200 flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-slate-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 9l-4 3 4 3M16 9l4 3-4 3"
                      />
                    </svg>
                  </div>
                </div>

                {/* Labels */}
                <div className="absolute top-3 left-3 px-2 py-1 bg-black/50 text-white text-xs rounded-md">
                  Original
                </div>
                <div className="absolute top-3 right-3 px-2 py-1 bg-indigo-600/80 text-white text-xs rounded-md">
                  No Background
                </div>
              </div>

              <p className="text-center text-xs text-slate-400 dark:text-slate-500">
                Drag slider to compare · Checkered pattern shows transparency
              </p>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleDownload}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-md transition-colors"
                >
                  <ArrowDownTrayIcon className="w-5 h-5" />
                  Download PNG (Transparent)
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleReset}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-xl shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  <XMarkIcon className="w-5 h-5" />
                  Try Another Image
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Error State */}
          {stage === "error" && (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center py-16 bg-red-50 dark:bg-red-900/10 rounded-3xl border border-red-200 dark:border-red-900/40"
            >
              <XMarkIcon className="w-12 h-12 text-red-400 mb-4" />
              <p className="text-lg font-semibold text-red-700 dark:text-red-400 mb-1">
                Something went wrong
              </p>
              <p className="text-sm text-red-500 dark:text-red-500 mb-6 text-center max-w-sm">
                {errorMsg}
              </p>
              <button
                onClick={handleReset}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-colors"
              >
                Try Again
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Feature Highlights */}
        {stage === "idle" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4"
          >
            {[
              {
                icon: "🔒",
                title: "100% Private",
                desc: "Images never leave your device. Processed locally.",
              },
              {
                icon: "⚡",
                title: "Lightning Fast",
                desc: "Model is cached after first use — instant on repeat.",
              },
              {
                icon: "🎨",
                title: "Transparent PNG",
                desc: "Download with alpha channel, ready for any design.",
              },
            ].map(f => (
              <div
                key={f.title}
                className="p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm text-center"
              >
                <p className="text-2xl mb-2">{f.icon}</p>
                <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm mb-1">
                  {f.title}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {f.desc}
                </p>
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </PageTransition>
  );
}
