"use client";

import React, { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PhotoIcon,
  ArrowDownTrayIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import PageTransition from "@/components/PageTransition";

type Stage = "idle" | "done" | "error";

const formatBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const savings = (orig: number, compressed: number) =>
  Math.round(((orig - compressed) / orig) * 100);

export default function ImageCompressorPage() {
  const [stage, setStage] = useState<Stage>("idle");
  const [origSrc, setOrigSrc] = useState<string | null>(null);
  const [resultSrc, setResultSrc] = useState<string | null>(null);
  const [origSize, setOrigSize] = useState(0);
  const [resultSize, setResultSize] = useState(0);
  const [quality, setQuality] = useState(80);
  const [fileName, setFileName] = useState("");
  const [mimeType, setMimeType] = useState("image/jpeg");
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const compress = useCallback(
    (src: string, mime: string, q: number, origBytes: number) => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // White bg for JPEGs
        if (mime === "image/jpeg") {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        ctx.drawImage(img, 0, 0);
        const dataUrl = canvas.toDataURL(mime, q / 100);
        // Estimate size from base64
        const base64 = dataUrl.split(",")[1];
        const approxBytes = Math.round((base64.length * 3) / 4);
        setResultSrc(dataUrl);
        setResultSize(approxBytes);
        setOrigSize(origBytes);
        setStage("done");
      };
      img.onerror = () => {
        setErrorMsg("Could not load this image.");
        setStage("error");
      };
      img.src = src;
    },
    [],
  );

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) {
        setErrorMsg("Please upload an image file (JPG, PNG, WebP).");
        setStage("error");
        return;
      }
      const mime = file.type === "image/png" ? "image/png" : "image/jpeg";
      setMimeType(mime);
      setFileName(file.name);
      setErrorMsg("");

      const reader = new FileReader();
      reader.onload = e => {
        const src = e.target?.result as string;
        setOrigSrc(src);
        compress(src, mime, quality, file.size);
      };
      reader.readAsDataURL(file);
    },
    [compress, quality],
  );

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

  const recompress = (q: number) => {
    setQuality(q);
    if (origSrc && fileName) {
      const mime = fileName.toLowerCase().endsWith(".png")
        ? "image/png"
        : "image/jpeg";
      compress(origSrc, mime, q, origSize);
    }
  };

  const handleDownload = () => {
    if (!resultSrc) return;
    const a = document.createElement("a");
    a.href = resultSrc;
    const ext = mimeType === "image/png" ? "png" : "jpg";
    a.download = fileName.replace(/\.[^.]+$/, `_compressed.${ext}`);
    a.click();
  };

  const handleReset = () => {
    setStage("idle");
    setOrigSrc(null);
    setResultSrc(null);
    setErrorMsg("");
    setFileName("");
    setQuality(80);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const pct =
    stage === "done" && resultSize < origSize
      ? savings(origSize, resultSize)
      : 0;

  return (
    <PageTransition>
      {/* Hidden canvas for compression */}
      <canvas ref={canvasRef} className="hidden" />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 min-h-screen">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-sm font-medium mb-4">
            <PhotoIcon className="w-4 h-4" />
            100% In-Browser · No Upload · Free
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3">
            Image Compressor
          </h1>
          <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Reduce image file size with adjustable quality. Works entirely in
            your browser — your image never leaves your device.
          </p>
        </div>

        <AnimatePresence mode="wait">
          {/* Upload Zone */}
          {stage === "idle" && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
            >
              <div
                onDragEnter={() => setIsDragging(true)}
                onDragLeave={() => setIsDragging(false)}
                onDragOver={e => e.preventDefault()}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`flex flex-col items-center justify-center border-2 border-dashed rounded-3xl p-16 cursor-pointer transition-all duration-300 ${
                  isDragging
                    ? "border-blue-400 bg-blue-50 dark:bg-blue-900/10 scale-[1.01]"
                    : "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-blue-400 dark:hover:border-blue-700 hover:bg-blue-50/40 dark:hover:bg-blue-900/10"
                }`}
              >
                <div className="p-5 bg-blue-100 dark:bg-blue-900/30 rounded-2xl mb-5">
                  <PhotoIcon className="w-12 h-12 text-blue-500 dark:text-blue-400" />
                </div>
                <p className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-1">
                  Drop your image here
                </p>
                <p className="text-sm text-slate-400 dark:text-slate-500">
                  or click to browse — JPG, PNG, WebP
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

          {/* Done */}
          {stage === "done" && origSrc && resultSrc && (
            <motion.div
              key="done"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-5"
            >
              {/* Preview */}
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={origSrc}
                    alt="Original"
                    className="w-full h-40 object-cover"
                  />
                  <div className="p-3 bg-white dark:bg-slate-800 text-center">
                    <p className="text-xs text-slate-400 mb-0.5">Original</p>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                      {formatBytes(origSize)}
                    </p>
                  </div>
                </div>
                <div className="rounded-2xl overflow-hidden border border-blue-200 dark:border-blue-900/40 shadow-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={resultSrc}
                    alt="Compressed"
                    className="w-full h-40 object-cover"
                  />
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-center">
                    <p className="text-xs text-blue-400 mb-0.5">Compressed</p>
                    <p className="text-sm font-bold text-blue-600 dark:text-blue-400">
                      {formatBytes(resultSize)}{" "}
                      {pct > 0 && (
                        <span className="text-emerald-500">(-{pct}%)</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Quality Slider */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                    Quality
                  </label>
                  <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                    {quality}%
                  </span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={100}
                  step={5}
                  value={quality}
                  onChange={e => recompress(Number(e.target.value))}
                  className="w-full accent-blue-500"
                />
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                  <span>Smaller file</span>
                  <span>Better quality</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleDownload}
                  className="flex-1 inline-flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors shadow-sm"
                >
                  <ArrowDownTrayIcon className="w-5 h-5" />
                  Download Compressed Image
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleReset}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-xl transition-colors"
                >
                  <XMarkIcon className="w-5 h-5" />
                  New Image
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Error */}
          {stage === "error" && (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center py-16 bg-red-50 dark:bg-red-900/10 rounded-3xl border border-red-200 dark:border-red-900/40"
            >
              <XMarkIcon className="w-12 h-12 text-red-400 mb-4" />
              <p className="text-lg font-semibold text-red-700 dark:text-red-400 mb-1">
                Failed
              </p>
              <p className="text-sm text-red-500 mb-6 text-center max-w-sm px-4">
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

        {/* Info cards */}
        {stage === "idle" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4"
          >
            {[
              {
                icon: "🎚️",
                title: "Adjustable Quality",
                desc: "Drag the slider to find your perfect balance.",
              },
              {
                icon: "🔒",
                title: "100% Private",
                desc: "Image stays on your device — no server.",
              },
              {
                icon: "🖼️",
                title: "JPG + PNG",
                desc: "All common image formats supported.",
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
