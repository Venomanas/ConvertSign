"use client";

import React, { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DocumentIcon,
  ArrowDownTrayIcon,
  ArrowPathIcon,
  XMarkIcon,
  DocumentArrowUpIcon,
} from "@heroicons/react/24/outline";
import PageTransition from "@/components/PageTransition";

type Stage = "idle" | "processing" | "done" | "error";

const formatBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const savings = (orig: number, compressed: number) =>
  Math.round(((orig - compressed) / orig) * 100);

export default function PdfCompressPage() {
  const [stage, setStage] = useState<Stage>("idle");
  const [fileName, setFileName] = useState("");
  const [origSize, setOrigSize] = useState(0);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultSize, setResultSize] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(async (file: File) => {
    if (file.type !== "application/pdf") {
      setErrorMsg("Please upload a valid PDF file.");
      setStage("error");
      return;
    }

    setFileName(file.name);
    setOrigSize(file.size);
    setResultBlob(null);
    setErrorMsg("");
    setStage("processing");

    try {
      const { PDFDocument } = await import("pdf-lib");

      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer, {
        ignoreEncryption: true,
      });

      // Remove unused objects and compress streams
      const compressed = await pdfDoc.save({
        useObjectStreams: true,
        addDefaultPage: false,
        objectsPerTick: 50,
      });

      const safeCopy = new Uint8Array(compressed);
      const blob = new Blob([safeCopy], { type: "application/pdf" });
      setResultBlob(blob);
      setResultSize(blob.size);
      setStage("done");
    } catch (err) {
      console.error(err);
      setErrorMsg("Compression failed. The PDF may be encrypted or corrupted.");
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

  const handleDownload = () => {
    if (!resultBlob) return;
    const url = URL.createObjectURL(resultBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName.replace(".pdf", "_compressed.pdf");
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setStage("idle");
    setResultBlob(null);
    setErrorMsg("");
    setFileName("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const pct = stage === "done" ? savings(origSize, resultSize) : 0;

  return (
    <PageTransition>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 min-h-screen">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-medium mb-4">
            <DocumentIcon className="w-4 h-4" />
            100% In-Browser · No Upload · Free
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3">
            PDF Compressor
          </h1>
          <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Reduce PDF file size without losing quality. Works entirely in your
            browser — your file never leaves your device.
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
                    ? "border-red-400 bg-red-50 dark:bg-red-900/10 scale-[1.01]"
                    : "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-red-400 dark:hover:border-red-700 hover:bg-red-50/40 dark:hover:bg-red-900/10"
                }`}
              >
                <div className="p-5 bg-red-100 dark:bg-red-900/30 rounded-2xl mb-5">
                  <DocumentArrowUpIcon className="w-12 h-12 text-red-500 dark:text-red-400" />
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
              className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700"
            >
              <div className="p-5 bg-red-100 dark:bg-red-900/30 rounded-2xl mb-6">
                <ArrowPathIcon className="w-12 h-12 text-red-500 animate-spin" />
              </div>
              <p className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-1">
                Compressing PDF…
              </p>
              <p className="text-sm text-slate-400">
                {fileName} · {formatBytes(origSize)}
              </p>
            </motion.div>
          )}

          {/* Done */}
          {stage === "done" && (
            <motion.div
              key="done"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-5"
            >
              {/* Result card */}
              <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-8 shadow-sm">
                {/* Savings badge */}
                <div className="flex justify-center mb-6">
                  <div
                    className={`inline-flex flex-col items-center justify-center w-28 h-28 rounded-full border-4 ${
                      pct > 0
                        ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400"
                        : "border-amber-400 bg-amber-50 dark:bg-amber-900/20 text-amber-600"
                    }`}
                  >
                    <span className="text-3xl font-extrabold">
                      {pct > 0 ? `-${pct}%` : "~0%"}
                    </span>
                    <span className="text-xs font-medium mt-0.5">smaller</span>
                  </div>
                </div>

                {/* Size comparison */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl">
                    <p className="text-xs text-slate-400 mb-1 uppercase tracking-wide">
                      Original
                    </p>
                    <p className="text-xl font-bold text-slate-700 dark:text-slate-200">
                      {formatBytes(origSize)}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl">
                    <p className="text-xs text-emerald-500 mb-1 uppercase tracking-wide">
                      Compressed
                    </p>
                    <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                      {formatBytes(resultSize)}
                    </p>
                  </div>
                </div>

                {pct <= 0 && (
                  <p className="text-sm text-amber-600 dark:text-amber-400 text-center mb-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3">
                    ℹ️ This PDF is already well-optimized — minimal reduction
                    possible.
                  </p>
                )}

                <div className="flex flex-col sm:flex-row gap-3">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleDownload}
                    className="flex-1 inline-flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-colors shadow-sm"
                  >
                    <ArrowDownTrayIcon className="w-5 h-5" />
                    Download Compressed PDF
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleReset}
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-xl transition-colors"
                  >
                    <XMarkIcon className="w-5 h-5" />
                    New File
                  </motion.button>
                </div>
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
                Compression Failed
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
                icon: "🔒",
                title: "100% Private",
                desc: "PDF never leaves your device.",
              },
              {
                icon: "⚡",
                title: "Instant",
                desc: "No waiting — compresses in seconds.",
              },
              {
                icon: "📄",
                title: "Lossless Text",
                desc: "Text and vectors stay crisp.",
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
