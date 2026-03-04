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

export default function WatermarkPage() {
  const [stage, setStage] = useState<Stage>("idle");
  const [origSrc, setOrigSrc] = useState<string | null>(null);
  const [resultSrc, setResultSrc] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [watermarkText, setWatermarkText] = useState("ConvertSign");
  const [opacity, setOpacity] = useState(30);
  const [fontSize, setFontSize] = useState(48);
  const [angle, setAngle] = useState(-30);
  const [color, setColor] = useState("#6366f1");
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const applyWatermark = useCallback(
    (
      src: string,
      text: string,
      alpha: number,
      size: number,
      deg: number,
      col: string,
    ) => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Draw original
        ctx.drawImage(img, 0, 0);

        // Watermark settings
        ctx.globalAlpha = alpha / 100;
        ctx.fillStyle = col;
        ctx.font = `bold ${size}px Inter, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        const rad = (deg * Math.PI) / 180;

        // Tile watermarks across the image
        const spacing = Math.max(size * 4, 200);
        for (let y = -canvas.height; y < canvas.height * 2; y += spacing) {
          for (let x = -canvas.width; x < canvas.width * 2; x += spacing) {
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(rad);
            ctx.fillText(text, 0, 0);
            ctx.restore();
          }
        }

        ctx.globalAlpha = 1;
        setResultSrc(canvas.toDataURL("image/png"));
        setStage("done");
      };
      img.onerror = () => {
        setErrorMsg("Could not load image.");
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
      setFileName(file.name);
      setErrorMsg("");
      const reader = new FileReader();
      reader.onload = e => {
        const src = e.target?.result as string;
        setOrigSrc(src);
        applyWatermark(src, watermarkText, opacity, fontSize, angle, color);
      };
      reader.readAsDataURL(file);
    },
    [applyWatermark, watermarkText, opacity, fontSize, angle, color],
  );

  const reapply = useCallback(
    (text: string, alpha: number, size: number, deg: number, col: string) => {
      if (origSrc) applyWatermark(origSrc, text, alpha, size, deg, col);
    },
    [origSrc, applyWatermark],
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

  const handleDownload = () => {
    if (!resultSrc) return;
    const a = document.createElement("a");
    a.href = resultSrc;
    a.download = fileName.replace(/\.[^.]+$/, "_watermarked.png");
    a.click();
  };

  const handleReset = () => {
    setStage("idle");
    setOrigSrc(null);
    setResultSrc(null);
    setErrorMsg("");
    setFileName("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const controlChange = (
    text: string,
    alpha: number,
    size: number,
    deg: number,
    col: string,
  ) => {
    setWatermarkText(text);
    setOpacity(alpha);
    setFontSize(size);
    setAngle(deg);
    setColor(col);
    reapply(text, alpha, size, deg, col);
  };

  return (
    <PageTransition>
      <canvas ref={canvasRef} className="hidden" />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 min-h-screen">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-sm font-medium mb-4">
            <PhotoIcon className="w-4 h-4" />
            100% In-Browser · No Upload · Free
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3">
            Watermark Adder
          </h1>
          <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Add a tiled text watermark to any image. Customize text, opacity,
            size, and angle — all in your browser.
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
                    ? "border-indigo-400 bg-indigo-50 dark:bg-indigo-900/10 scale-[1.01]"
                    : "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-indigo-400 dark:hover:border-indigo-700 hover:bg-indigo-50/40 dark:hover:bg-indigo-900/10"
                }`}
              >
                <div className="p-5 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl mb-5">
                  <PhotoIcon className="w-12 h-12 text-indigo-500 dark:text-indigo-400" />
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

          {/* Done / Controls */}
          {stage === "done" && resultSrc && (
            <motion.div
              key="done"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-5"
            >
              {/* Preview */}
              <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={resultSrc}
                  alt="Watermarked preview"
                  className="w-full max-h-64 object-contain bg-slate-100 dark:bg-slate-900"
                />
              </div>

              {/* Controls */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-5">
                {/* Text */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                    Watermark Text
                  </label>
                  <input
                    type="text"
                    value={watermarkText}
                    maxLength={40}
                    onChange={e =>
                      controlChange(
                        e.target.value,
                        opacity,
                        fontSize,
                        angle,
                        color,
                      )
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-400 outline-none transition"
                    placeholder="e.g. CONFIDENTIAL"
                  />
                </div>

                {/* Color */}
                <div className="flex items-center gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                      Color
                    </label>
                    <input
                      type="color"
                      value={color}
                      onChange={e =>
                        controlChange(
                          watermarkText,
                          opacity,
                          fontSize,
                          angle,
                          e.target.value,
                        )
                      }
                      className="w-10 h-10 rounded-lg cursor-pointer border border-slate-200 dark:border-slate-600"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                      <span>Opacity</span>
                      <span className="text-indigo-600 dark:text-indigo-400">
                        {opacity}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min={5}
                      max={80}
                      step={5}
                      value={opacity}
                      onChange={e =>
                        controlChange(
                          watermarkText,
                          Number(e.target.value),
                          fontSize,
                          angle,
                          color,
                        )
                      }
                      className="w-full accent-indigo-500"
                    />
                  </div>
                </div>

                {/* Font size */}
                <div>
                  <div className="flex justify-between text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                    <span>Font Size</span>
                    <span className="text-indigo-600 dark:text-indigo-400">
                      {fontSize}px
                    </span>
                  </div>
                  <input
                    type="range"
                    min={16}
                    max={120}
                    step={4}
                    value={fontSize}
                    onChange={e =>
                      controlChange(
                        watermarkText,
                        opacity,
                        Number(e.target.value),
                        angle,
                        color,
                      )
                    }
                    className="w-full accent-indigo-500"
                  />
                </div>

                {/* Angle */}
                <div>
                  <div className="flex justify-between text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                    <span>Angle</span>
                    <span className="text-indigo-600 dark:text-indigo-400">
                      {angle}°
                    </span>
                  </div>
                  <input
                    type="range"
                    min={-90}
                    max={90}
                    step={5}
                    value={angle}
                    onChange={e =>
                      controlChange(
                        watermarkText,
                        opacity,
                        fontSize,
                        Number(e.target.value),
                        color,
                      )
                    }
                    className="w-full accent-indigo-500"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleDownload}
                  className="flex-1 inline-flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors shadow-sm"
                >
                  <ArrowDownTrayIcon className="w-5 h-5" />
                  Download Watermarked Image
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
                icon: "🎨",
                title: "Full Control",
                desc: "Set text, color, opacity, size & angle.",
              },
              {
                icon: "🔒",
                title: "100% Private",
                desc: "Image never leaves your browser.",
              },
              {
                icon: "🖼️",
                title: "Live Preview",
                desc: "See changes update in real time.",
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
