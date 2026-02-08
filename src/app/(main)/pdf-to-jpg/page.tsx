"use client";

import React, { useState, useRef, useCallback } from "react";
import PageTransition from "@/components/PageTransition";
import Animatedbutton from "@/components/Animatedbutton";
import { useToast } from "@/context/ToastContext";
import {
  DocumentIcon,
  PhotoIcon,
  ArrowDownTrayIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

const PdfToJpg: React.FC = () => {
  const { showToast } = useToast();
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      showToast("Please upload a PDF file", "error");
      return;
    }

    setPdfFile(file);
    setImages([]);
    showToast("PDF loaded!", "success");
  };

  const convertToImages = useCallback(async () => {
    if (!pdfFile) {
      showToast("Please upload a PDF first", "error");
      return;
    }

    setIsConverting(true);
    setProgress(0);
    setImages([]);

    try {
      // Dynamic import for client-side only
      const pdfjsLib = await import("pdfjs-dist");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pdfjsAny = pdfjsLib as any;

      if (pdfjsAny.GlobalWorkerOptions) {
        pdfjsAny.GlobalWorkerOptions.workerSrc = new URL(
          "pdfjs-dist/build/pdf.worker.mjs",
          import.meta.url,
        ).toString();
      }

      const arrayBuffer = await pdfFile.arrayBuffer();
      const loadingTask = pdfjsAny.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      const numPages = pdf.numPages;
      const newImages: string[] = [];

      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2 });

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        if (!context) continue;

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({
          canvasContext: context,
          viewport,
        }).promise;

        const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
        newImages.push(dataUrl);
        setProgress(Math.round((i / numPages) * 100));
      }

      setImages(newImages);
      showToast(`Converted ${numPages} page(s) to JPG!`, "success");
    } catch (error) {
      console.error("Conversion error:", error);
      showToast("Failed to convert PDF", "error");
    } finally {
      setIsConverting(false);
    }
  }, [pdfFile, showToast]);

  const downloadImage = (dataUrl: string, index: number) => {
    const link = document.createElement("a");
    link.download = `page-${index + 1}.jpg`;
    link.href = dataUrl;
    link.click();
  };

  const downloadAll = () => {
    images.forEach((img, index) => {
      setTimeout(() => downloadImage(img, index), index * 200);
    });
    showToast("Downloading all images...", "success");
  };

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl mb-4">
            <PhotoIcon className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            PDF To JPG
          </h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            Convert PDF pages to JPG images
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm mb-6">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleFileUpload}
            className="hidden"
          />

          <Animatedbutton
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-4 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl hover:border-indigo-400 transition-colors flex items-center justify-center gap-2 mb-4"
          >
            <DocumentIcon className="w-6 h-6" />
            {pdfFile ? pdfFile.name : "Select PDF File"}
          </Animatedbutton>

          {isConverting && (
            <div className="mb-4">
              <div className="flex justify-between text-sm text-slate-500 mb-1">
                <span>Converting...</span>
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

          <div className="flex gap-3 justify-center">
            <Animatedbutton
              onClick={convertToImages}
              disabled={!pdfFile || isConverting}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold rounded-xl flex items-center gap-2"
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

            {images.length > 0 && (
              <Animatedbutton
                onClick={downloadAll}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl flex items-center gap-2"
              >
                <ArrowDownTrayIcon className="w-5 h-5" />
                Download All
              </Animatedbutton>
            )}
          </div>
        </div>

        {images.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Converted Images ({images.length})
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {images.map((img, index) => (
                <div key={index} className="relative group">
                  <img
                    src={img}
                    alt={`Page ${index + 1}`}
                    className="w-full h-32 object-cover rounded-xl border border-slate-200 dark:border-slate-700"
                  />
                  <button
                    onClick={() => downloadImage(img, index)}
                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center"
                  >
                    <ArrowDownTrayIcon className="w-8 h-8 text-white" />
                  </button>
                  <span className="absolute bottom-1 left-1 text-xs bg-black/50 text-white px-2 py-0.5 rounded">
                    Page {index + 1}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
};

export default PdfToJpg;
