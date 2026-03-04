"use client";

import React, { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DocumentIcon,
  ArrowDownTrayIcon,
  ArrowPathIcon,
  XMarkIcon,
  DocumentArrowUpIcon,
  ScissorsIcon,
} from "@heroicons/react/24/outline";
import PageTransition from "@/components/PageTransition";

type Stage = "idle" | "processing" | "done" | "error";

interface SplitPage {
  index: number;
  blob: Blob;
  size: number;
}

const formatBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

export default function PdfSplitPage() {
  const [stage, setStage] = useState<Stage>("idle");
  const [fileName, setFileName] = useState("");
  const [totalPages, setTotalPages] = useState(0);
  const [pages, setPages] = useState<SplitPage[]>([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(async (file: File) => {
    if (file.type !== "application/pdf") {
      setErrorMsg("Please upload a valid PDF file.");
      setStage("error");
      return;
    }

    setFileName(file.name);
    setPages([]);
    setErrorMsg("");
    setStage("processing");
    setProgress(5);

    try {
      const { PDFDocument } = await import("pdf-lib");
      const arrayBuffer = await file.arrayBuffer();
      const srcDoc = await PDFDocument.load(arrayBuffer, {
        ignoreEncryption: true,
      });

      const numPages = srcDoc.getPageCount();
      setTotalPages(numPages);

      if (numPages < 2) {
        setErrorMsg("This PDF has only 1 page — nothing to split.");
        setStage("error");
        return;
      }

      const splitPages: SplitPage[] = [];

      for (let i = 0; i < numPages; i++) {
        const newDoc = await PDFDocument.create();
        const [copied] = await newDoc.copyPages(srcDoc, [i]);
        newDoc.addPage(copied);
        const bytes = await newDoc.save({ useObjectStreams: true });
        const safeCopy = new Uint8Array(bytes);
        const blob = new Blob([safeCopy], { type: "application/pdf" });
        splitPages.push({ index: i + 1, blob, size: blob.size });
        setProgress(Math.round(((i + 1) / numPages) * 90) + 5);
      }

      setPages(splitPages);
      setStage("done");
      setProgress(100);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to split PDF. It may be encrypted or corrupted.");
      setStage("error");
    }
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile],
  );

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const downloadPage = (page: SplitPage) => {
    const url = URL.createObjectURL(page.blob);
    const a = document.createElement("a");
    a.href = url;
    const base = fileName.replace(".pdf", "");
    a.download = `${base}_page_${page.index}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadAll = () => {
    pages.forEach((p, i) => {
      setTimeout(() => downloadPage(p), i * 200);
    });
  };

  const handleReset = () => {
    setStage("idle");
    setPages([]);
    setErrorMsg("");
    setFileName("");
    setProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <PageTransition>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 min-h-screen">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 text-sm font-medium mb-4">
            <ScissorsIcon className="w-4 h-4" />
            100% In-Browser · No Upload · Free
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3">
            PDF Splitter
          </h1>
          <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Split a multi-page PDF into individual pages. Works entirely in your
            browser — your file never leaves your device.
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
                    ? "border-orange-400 bg-orange-50 dark:bg-orange-900/10 scale-[1.01]"
                    : "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-orange-400 dark:hover:border-orange-700 hover:bg-orange-50/40 dark:hover:bg-orange-900/10"
                }`}
              >
                <div className="p-5 bg-orange-100 dark:bg-orange-900/30 rounded-2xl mb-5">
                  <DocumentArrowUpIcon className="w-12 h-12 text-orange-500 dark:text-orange-400" />
                </div>
                <p className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-1">
                  Drop your PDF here
                </p>
                <p className="text-sm text-slate-400 dark:text-slate-500">
                  or click to browse — PDF files only
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={onFileChange}
                />
              </div>
            </motion.div>
          )}

          {/* Processing */}
          {stage === "processing" && (
            <motion.div
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center py-20 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700"
            >
              <div className="p-5 bg-orange-100 dark:bg-orange-900/30 rounded-2xl mb-6">
                <ArrowPathIcon className="w-12 h-12 text-orange-500 animate-spin" />
              </div>
              <p className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-2">
                Splitting pages…
              </p>
              <p className="text-sm text-slate-400 mb-5">{fileName}</p>
              <div className="w-64 bg-slate-100 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
                <motion.div
                  className="h-full bg-orange-500 rounded-full"
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <p className="text-xs text-slate-400 mt-2">{progress}%</p>
            </motion.div>
          )}

          {/* Done */}
          {stage === "done" && pages.length > 0 && (
            <motion.div
              key="done"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Summary */}
              <div className="flex items-center justify-between p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-200 dark:border-emerald-900/40">
                <div>
                  <p className="font-semibold text-emerald-700 dark:text-emerald-400 text-sm">
                    ✅ Split complete
                  </p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-500 mt-0.5">
                    {totalPages} pages extracted from {fileName}
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={downloadAll}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-colors"
                >
                  <ArrowDownTrayIcon className="w-4 h-4" />
                  Download All
                </motion.button>
              </div>

              {/* Page list */}
              <div className="space-y-2 max-h-[400px] overflow-y-auto scrollbar-hide">
                {pages.map(page => (
                  <motion.div
                    key={page.index}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: page.index * 0.03 }}
                    className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                        <DocumentIcon className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                          Page {page.index}
                        </p>
                        <p className="text-xs text-slate-400">
                          {formatBytes(page.size)}
                        </p>
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => downloadPage(page)}
                      className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
                      title={`Download page ${page.index}`}
                    >
                      <ArrowDownTrayIcon className="w-4 h-4" />
                    </motion.button>
                  </motion.div>
                ))}
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleReset}
                className="w-full flex items-center justify-center gap-2 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-xl transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
                Split Another PDF
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
              <p className="text-lg font-semibold text-red-700 dark:text-red-400 mb-2">
                Split Failed
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
                title: "Every Page Separate",
                desc: "Each page becomes its own downloadable PDF.",
              },
              {
                icon: "🔒",
                title: "100% Private",
                desc: "PDF never leaves your browser.",
              },
              {
                icon: "⚡",
                title: "Batch Download",
                desc: "Download all pages at once.",
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
