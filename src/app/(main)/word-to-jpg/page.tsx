"use client";

import React, { useState, useRef, useCallback } from "react";
import PageTransition from "@/components/PageTransition";
import Animatedbutton from "@/components/Animatedbutton";
import { useToast } from "@/context/ToastContext";
import {
  PhotoIcon,
  DocumentIcon,
  ArrowDownTrayIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

const WordToJpg: React.FC = () => {
  const { showToast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFile(file);
    setImageUrl(null);

    try {
      const content = await file.text();
      setText(content);
      showToast("File loaded!", "success");
    } catch {
      showToast("Could not read file. Enter text manually.", "info");
    }
  };

  const convertToImage = useCallback(() => {
    if (!text.trim()) {
      showToast("Please enter or upload text content", "error");
      return;
    }

    setIsConverting(true);

    try {
      const canvas = canvasRef.current;
      if (!canvas) throw new Error("Canvas not found");

      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not get canvas context");

      const fontSize = 16;
      const lineHeight = fontSize * 1.5;
      const padding = 40;
      ctx.font = `${fontSize}px Arial`;

      const lines = text.split("\n");
      let maxWidth = 0;
      for (const line of lines) {
        const metrics = ctx.measureText(line);
        maxWidth = Math.max(maxWidth, metrics.width);
      }

      canvas.width = Math.max(maxWidth + padding * 2, 400);
      canvas.height = lines.length * lineHeight + padding * 2;

      // White background
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw text
      ctx.fillStyle = "#1e293b";
      ctx.font = `${fontSize}px Arial`;
      ctx.textBaseline = "top";

      lines.forEach((line, index) => {
        ctx.fillText(line, padding, padding + index * lineHeight);
      });

      const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
      setImageUrl(dataUrl);
      showToast("Image created!", "success");
    } catch (error) {
      console.error("Conversion error:", error);
      showToast("Failed to create image", "error");
    } finally {
      setIsConverting(false);
    }
  }, [text, showToast]);

  const downloadImage = () => {
    if (!imageUrl) return;
    const link = document.createElement("a");
    link.download = `${file?.name || "document"}.jpg`;
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
            Word To JPG
          </h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            Convert text documents to JPG images
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.doc"
              onChange={handleFileUpload}
              className="hidden"
            />

            <Animatedbutton
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-4 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl hover:border-indigo-400 transition-colors flex items-center justify-center gap-2 mb-4"
            >
              <DocumentIcon className="w-6 h-6" />
              {file ? file.name : "Select Word/Text File"}
            </Animatedbutton>

            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Or paste your text here..."
              className="w-full h-40 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl py-3 px-4 text-slate-900 dark:text-white resize-none mb-4"
            />

            <Animatedbutton
              onClick={convertToImage}
              disabled={isConverting || !text.trim()}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold rounded-xl flex items-center justify-center gap-2"
            >
              {isConverting ? (
                <>
                  <ArrowPathIcon className="w-5 h-5 animate-spin" />
                  Converting...
                </>
              ) : (
                <>
                  <PhotoIcon className="w-5 h-5" />
                  Convert to JPG
                </>
              )}
            </Animatedbutton>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Preview
            </h2>

            {imageUrl ? (
              <>
                <img
                  src={imageUrl}
                  alt="Converted"
                  className="w-full rounded-xl shadow-lg mb-4"
                />
                <Animatedbutton
                  onClick={downloadImage}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2"
                >
                  <ArrowDownTrayIcon className="w-5 h-5" />
                  Download JPG
                </Animatedbutton>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-center">
                <PhotoIcon className="w-16 h-16 text-slate-300 dark:text-slate-600 mb-4" />
                <p className="text-slate-500">Image preview will appear here</p>
              </div>
            )}

            <canvas ref={canvasRef} className="hidden" />
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default WordToJpg;
