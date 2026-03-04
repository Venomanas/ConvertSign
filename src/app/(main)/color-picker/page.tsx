"use client";

import React, { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PhotoIcon,
  XMarkIcon,
  ClipboardDocumentIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import PageTransition from "@/components/PageTransition";

type Stage = "idle" | "pick" | "error";

interface ColorSample {
  hex: string;
  rgb: string;
  hsl: string;
  x: number;
  y: number;
}

function hexToHsl(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  let h = 0,
    s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }
  return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
}

export default function ColorPickerPage() {
  const [stage, setStage] = useState<Stage>("idle");
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [picked, setPicked] = useState<ColorSample | null>(null);
  const [history, setHistory] = useState<ColorSample[]>([]);
  const [copied, setCopied] = useState<string | null>(null);
  const [magnifierPos, setMagnifierPos] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [hoverColor, setHoverColor] = useState<string>("#000000");

  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadImage = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setErrorMsg("Please upload an image (JPG, PNG, WebP).");
      setStage("error");
      return;
    }
    const reader = new FileReader();
    reader.onload = e => {
      setImgSrc(e.target?.result as string);
      setPicked(null);
      setHistory([]);
      setStage("pick");
    };
    reader.readAsDataURL(file);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) loadImage(file);
  }, []);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) loadImage(file);
  };

  const getPixelColor = (e: React.MouseEvent<HTMLImageElement>) => {
    const img = imgRef.current;
    const canvas = canvasRef.current;
    if (!img || !canvas) return null;

    const rect = img.getBoundingClientRect();
    const scaleX = img.naturalWidth / rect.width;
    const scaleY = img.naturalHeight / rect.height;
    const px = Math.floor((e.clientX - rect.left) * scaleX);
    const py = Math.floor((e.clientY - rect.top) * scaleY);

    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(img, 0, 0);
    const [r, g, b] = ctx.getImageData(px, py, 1, 1).data;
    const hex = `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
    return {
      hex,
      rgb: `rgb(${r}, ${g}, ${b})`,
      hsl: hexToHsl(hex),
      x: px,
      y: py,
    } as ColorSample;
  };

  const onMouseMove = (e: React.MouseEvent<HTMLImageElement>) => {
    const color = getPixelColor(e);
    if (color) {
      setHoverColor(color.hex);
      const rect = imgRef.current!.getBoundingClientRect();
      setMagnifierPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }
  };

  const onMouseLeave = () => {
    setMagnifierPos(null);
  };

  const onClick = (e: React.MouseEvent<HTMLImageElement>) => {
    const color = getPixelColor(e);
    if (!color) return;
    setPicked(color);
    setHistory(h => [color, ...h.slice(0, 11)]);
  };

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 1500);
    });
  };

  const handleReset = () => {
    setStage("idle");
    setImgSrc(null);
    setPicked(null);
    setHistory([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <PageTransition>
      <canvas ref={canvasRef} className="hidden" />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 min-h-screen">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-sm font-medium mb-4">
            <PhotoIcon className="w-4 h-4" />
            100% In-Browser · Click Any Pixel · Free
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3">
            Color Picker
          </h1>
          <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Upload any image and click a pixel to extract its exact color in
            HEX, RGB, and HSL. Build your palette instantly.
          </p>
        </div>

        <AnimatePresence mode="wait">
          {/* Upload */}
          {stage === "idle" && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
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

          {/* Picker */}
          {stage === "pick" && imgSrc && (
            <motion.div
              key="pick"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-5"
            >
              {/* Image canvas for picking */}
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm">
                {/* Hover magnifier dot */}
                {magnifierPos && (
                  <div
                    className="absolute w-6 h-6 rounded-full border-2 border-white shadow-lg pointer-events-none z-10 -translate-x-1/2 -translate-y-1/2"
                    style={{
                      left: magnifierPos.x,
                      top: magnifierPos.y,
                      background: hoverColor,
                      boxShadow: `0 0 0 2px ${hoverColor}, 0 2px 8px rgba(0,0,0,0.3)`,
                    }}
                  />
                )}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  ref={imgRef}
                  src={imgSrc}
                  alt="Pick colors"
                  className="w-full max-h-72 object-contain cursor-crosshair select-none bg-slate-100 dark:bg-slate-900"
                  onClick={onClick}
                  onMouseMove={onMouseMove}
                  onMouseLeave={onMouseLeave}
                  crossOrigin="anonymous"
                />
                <div className="absolute top-2 right-2 px-2 py-1 bg-black/60 text-white text-xs rounded-lg">
                  Click any pixel
                </div>
              </div>

              {/* Picked color display */}
              {picked && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5"
                >
                  <div className="flex items-center gap-5 mb-4">
                    <div
                      className="w-20 h-20 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700 shrink-0"
                      style={{ background: picked.hex }}
                    />
                    <div>
                      <p className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                        Selected Color
                      </p>
                      <p className="text-xs text-slate-400">
                        Pixel at ({picked.x}, {picked.y})
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {[
                      { label: "HEX", value: picked.hex },
                      { label: "RGB", value: picked.rgb },
                      { label: "HSL", value: picked.hsl },
                    ].map(({ label, value }) => (
                      <div
                        key={label}
                        className="flex items-center justify-between px-4 py-2.5 bg-slate-50 dark:bg-slate-900 rounded-xl"
                      >
                        <div>
                          <span className="text-xs font-bold text-slate-400 mr-2">
                            {label}
                          </span>
                          <span className="text-sm font-mono text-slate-800 dark:text-slate-100">
                            {value}
                          </span>
                        </div>
                        <button
                          onClick={() => copyText(value, `${label}`)}
                          className="p-1.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-slate-400 hover:text-indigo-600 transition-colors"
                          title={`Copy ${label}`}
                        >
                          {copied === label ? (
                            <CheckIcon className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <ClipboardDocumentIcon className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Color palette history */}
              {history.length > 1 && (
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
                  <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-3">
                    Picked Colors
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {history.map((c, i) => (
                      <button
                        key={i}
                        onClick={() => setPicked(c)}
                        title={c.hex}
                        className="w-8 h-8 rounded-lg border-2 border-white dark:border-slate-700 shadow-sm hover:scale-110 transition-transform"
                        style={{ background: c.hex }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Reset */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleReset}
                className="w-full flex items-center justify-center gap-2 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-xl transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
                Pick from Another Image
              </motion.button>
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
              <p className="text-sm text-red-500 mb-6 text-center px-4">
                {errorMsg}
              </p>
              <button
                onClick={handleReset}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl"
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
                icon: "🎯",
                title: "Click Any Pixel",
                desc: "Hover to preview, click to capture the exact color.",
              },
              {
                icon: "📋",
                title: "Copy Any Format",
                desc: "One-click copy for HEX, RGB, or HSL.",
              },
              {
                icon: "🎨",
                title: "Build a Palette",
                desc: "All picked colors saved in a visual history.",
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
