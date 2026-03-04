"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PhotoIcon,
  ArrowDownTrayIcon,
  ArrowPathIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import PageTransition from "@/components/PageTransition";

type Stage = "idle" | "edit" | "error";

export default function CropRotatePage() {
  const [stage, setStage] = useState<Stage>("idle");
  const [origSrc, setOrigSrc] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);

  // Crop state (percent of image)
  const [crop, setCrop] = useState({ x: 0, y: 0, w: 100, h: 100 });
  const [dragging, setDragging] = useState<null | {
    edge: string;
    startX: number;
    startY: number;
    startCrop: typeof crop;
  }>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const imgNatW = useRef(0);
  const imgNatH = useRef(0);

  const loadImage = useCallback((src: string) => {
    const img = new Image();
    img.onload = () => {
      imgNatW.current = img.naturalWidth;
      imgNatH.current = img.naturalHeight;
      setOrigSrc(src);
      setRotation(0);
      setFlipH(false);
      setFlipV(false);
      setCrop({ x: 0, y: 0, w: 100, h: 100 });
      setStage("edit");
    };
    img.src = src;
  }, []);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) {
        setErrorMsg("Please upload an image (JPG, PNG, WebP).");
        setStage("error");
        return;
      }
      setFileName(file.name);
      setErrorMsg("");
      const reader = new FileReader();
      reader.onload = e => loadImage(e.target?.result as string);
      reader.readAsDataURL(file);
    },
    [loadImage],
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

  const rotate90 = (dir: 1 | -1) =>
    setRotation(r => (r + dir * 90 + 360) % 360);

  const handleDownload = useCallback(() => {
    if (!origSrc || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      const nw = img.naturalWidth;
      const nh = img.naturalHeight;

      // Crop region in pixels
      const cx = Math.round((crop.x / 100) * nw);
      const cy = Math.round((crop.y / 100) * nh);
      const cw = Math.round((crop.w / 100) * nw);
      const ch = Math.round((crop.h / 100) * nh);

      // Output size: rotated crop
      const rad = (rotation * Math.PI) / 180;
      const absCos = Math.abs(Math.cos(rad));
      const absSin = Math.abs(Math.sin(rad));
      const outW = Math.round(cw * absCos + ch * absSin);
      const outH = Math.round(cw * absSin + ch * absCos);

      canvas.width = outW;
      canvas.height = outH;

      ctx.clearRect(0, 0, outW, outH);
      ctx.translate(outW / 2, outH / 2);
      ctx.rotate(rad);
      ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
      ctx.drawImage(img, cx, cy, cw, ch, -cw / 2, -ch / 2, cw, ch);

      const a = document.createElement("a");
      a.href = canvas.toDataURL("image/png");
      a.download = fileName.replace(/\.[^.]+$/, "_edited.png");
      a.click();
    };
    img.src = origSrc;
  }, [origSrc, crop, rotation, flipH, flipV, fileName]);

  const handleReset = () => {
    setStage("idle");
    setOrigSrc(null);
    setErrorMsg("");
    setFileName("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Crop handle drag (simplified: drag edges of overlay)
  const previewStyle = {
    transform: `rotate(${rotation}deg) scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1})`,
    transition: "transform 0.25s",
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
            Image Crop & Rotate
          </h1>
          <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Rotate, flip, and crop your images instantly. Adjust and download as
            PNG — fully in-browser, no upload.
          </p>
        </div>

        <AnimatePresence mode="wait">
          {/* Upload */}
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

          {/* Edit */}
          {stage === "edit" && origSrc && (
            <motion.div
              key="edit"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-5"
            >
              {/* Preview */}
              <div
                ref={previewRef}
                className="relative flex items-center justify-center rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 min-h-48 max-h-72"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={origSrc}
                  alt="Preview"
                  style={previewStyle}
                  className="max-w-full max-h-72 object-contain select-none"
                />
              </div>

              {/* Controls */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-5">
                {/* Rotate buttons */}
                <div>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">
                    Rotate
                  </p>
                  <div className="flex gap-2">
                    {[
                      { label: "↺ 90° Left", dir: -1 as const },
                      { label: "↻ 90° Right", dir: 1 as const },
                    ].map(btn => (
                      <button
                        key={btn.label}
                        onClick={() => rotate90(btn.dir)}
                        className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                  <div className="mt-3">
                    <div className="flex justify-between text-sm text-slate-500 dark:text-slate-400 mb-1">
                      <span>Custom angle</span>
                      <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                        {rotation}°
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={359}
                      step={1}
                      value={rotation}
                      onChange={e => setRotation(Number(e.target.value))}
                      className="w-full accent-indigo-500"
                    />
                  </div>
                </div>

                {/* Flip */}
                <div>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">
                    Flip
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setFlipH(f => !f)}
                      className={`flex-1 py-2.5 rounded-xl border text-sm font-semibold transition-colors ${
                        flipH
                          ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
                          : "border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:border-indigo-400"
                      }`}
                    >
                      ↔ Flip Horizontal
                    </button>
                    <button
                      onClick={() => setFlipV(f => !f)}
                      className={`flex-1 py-2.5 rounded-xl border text-sm font-semibold transition-colors ${
                        flipV
                          ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
                          : "border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:border-indigo-400"
                      }`}
                    >
                      ↕ Flip Vertical
                    </button>
                  </div>
                </div>

                {/* Crop sliders */}
                <div>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">
                    Crop (% of original)
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    {(
                      [
                        { key: "x", label: "Left offset", max: 99 },
                        { key: "y", label: "Top offset", max: 99 },
                        { key: "w", label: "Width", max: 100 },
                        { key: "h", label: "Height", max: 100 },
                      ] as {
                        key: keyof typeof crop;
                        label: string;
                        max: number;
                      }[]
                    ).map(({ key, label, max }) => (
                      <div key={key}>
                        <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                          <span>{label}</span>
                          <span className="font-bold text-indigo-600 dark:text-indigo-400">
                            {crop[key]}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min={key === "w" || key === "h" ? 5 : 0}
                          max={max}
                          value={crop[key]}
                          onChange={e =>
                            setCrop(c => ({
                              ...c,
                              [key]: Number(e.target.value),
                            }))
                          }
                          className="w-full accent-indigo-500"
                        />
                      </div>
                    ))}
                  </div>
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
                  Download Edited Image
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
                icon: "✂️",
                title: "Crop",
                desc: "Trim any side with percentage sliders.",
              },
              {
                icon: "🔄",
                title: "Rotate",
                desc: "90° buttons or any custom angle.",
              },
              {
                icon: "↔️",
                title: "Flip",
                desc: "Mirror horizontally or vertically.",
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
