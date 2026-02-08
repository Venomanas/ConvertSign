"use client";

import React, { useState, useRef, useCallback } from "react";
import PageTransition from "@/components/PageTransition";
import Animatedbutton from "@/components/Animatedbutton";
import { useToast } from "@/context/ToastContext";
import {
  PhotoIcon,
  ArrowDownTrayIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

const TextToImage: React.FC = () => {
  const { showToast } = useToast();
  const [text, setText] = useState("");
  const [fontSize, setFontSize] = useState(24);
  const [textColor, setTextColor] = useState("#1e293b");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [fontFamily, setFontFamily] = useState("Arial");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const fonts = [
    "Arial",
    "Georgia",
    "Courier New",
    "Times New Roman",
    "Verdana",
  ];

  const generateImage = useCallback(() => {
    if (!text.trim()) {
      showToast("Please enter some text", "error");
      return;
    }

    setIsGenerating(true);

    try {
      const canvas = canvasRef.current;
      if (!canvas) throw new Error("Canvas not found");

      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not get canvas context");

      // Setup font for measuring
      ctx.font = `${fontSize}px ${fontFamily}`;

      // Split text into lines
      const lines = text.split("\n");
      const lineHeight = fontSize * 1.4;
      const padding = 40;

      // Measure max width
      let maxWidth = 0;
      for (const line of lines) {
        const metrics = ctx.measureText(line);
        maxWidth = Math.max(maxWidth, metrics.width);
      }

      // Set canvas size
      canvas.width = maxWidth + padding * 2;
      canvas.height = lines.length * lineHeight + padding * 2;

      // Fill background
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw text
      ctx.fillStyle = textColor;
      ctx.font = `${fontSize}px ${fontFamily}`;
      ctx.textBaseline = "top";

      lines.forEach((line, index) => {
        ctx.fillText(line, padding, padding + index * lineHeight);
      });

      // Convert to data URL
      const dataUrl = canvas.toDataURL("image/png");
      setImageUrl(dataUrl);
      showToast("Image generated!", "success");
    } catch (error) {
      console.error("Generation error:", error);
      showToast("Failed to generate image", "error");
    } finally {
      setIsGenerating(false);
    }
  }, [text, fontSize, textColor, bgColor, fontFamily, showToast]);

  const downloadImage = () => {
    if (!imageUrl) return;
    const link = document.createElement("a");
    link.download = `text-image-${Date.now()}.png`;
    link.href = imageUrl;
    link.click();
    showToast("Image downloaded!", "success");
  };

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl mb-4">
            <PhotoIcon className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Text To Image
          </h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            Convert text into a downloadable image
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Enter Text
            </h2>

            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Type your text here..."
              className="w-full h-32 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl py-3 px-4 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 resize-none mb-4"
            />

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Font Size: {fontSize}px
                </label>
                <input
                  type="range"
                  min="12"
                  max="72"
                  value={fontSize}
                  onChange={e => setFontSize(Number(e.target.value))}
                  className="w-full accent-indigo-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Font
                </label>
                <select
                  value={fontFamily}
                  onChange={e => setFontFamily(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl py-2 px-3"
                >
                  {fonts.map(font => (
                    <option key={font} value={font}>
                      {font}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Text Color
                </label>
                <input
                  type="color"
                  value={textColor}
                  onChange={e => setTextColor(e.target.value)}
                  className="w-full h-10 rounded-lg border border-slate-200 cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Background
                </label>
                <input
                  type="color"
                  value={bgColor}
                  onChange={e => setBgColor(e.target.value)}
                  className="w-full h-10 rounded-lg border border-slate-200 cursor-pointer"
                />
              </div>
            </div>

            <Animatedbutton
              onClick={generateImage}
              disabled={isGenerating || !text.trim()}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold rounded-xl flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <ArrowPathIcon className="w-5 h-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <PhotoIcon className="w-5 h-5" />
                  Generate Image
                </>
              )}
            </Animatedbutton>
          </div>

          {/* Preview Section */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Preview
            </h2>

            <div className="min-h-40 flex items-center justify-center bg-slate-100 dark:bg-slate-900 rounded-xl p-4 mb-4">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt="Generated"
                  className="max-w-full max-h-64 rounded-lg shadow-lg"
                />
              ) : (
                <p className="text-slate-400">
                  Generated image will appear here
                </p>
              )}
            </div>

            {imageUrl && (
              <Animatedbutton
                onClick={downloadImage}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2"
              >
                <ArrowDownTrayIcon className="w-5 h-5" />
                Download Image
              </Animatedbutton>
            )}

            <canvas ref={canvasRef} className="hidden" />
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default TextToImage;
