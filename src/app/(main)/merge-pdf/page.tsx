"use client";

import React, { useState, useRef, useCallback } from "react";
import { PDFDocument } from "pdf-lib";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import PageTransition from "@/components/PageTransition";
import Animatedbutton from "@/components/Animatedbutton";
import { useToast } from "@/context/ToastContext";
import {
  DocumentIcon,
  ArrowDownTrayIcon,
  ArrowPathIcon,
  TrashIcon,
  PlusIcon,
  Bars3Icon,
} from "@heroicons/react/24/outline";

interface PdfFile {
  id: string;
  name: string;
  file: File;
  pageCount: number;
}

const MergePdf: React.FC = () => {
  const { showToast } = useToast();
  const [pdfFiles, setPdfFiles] = useState<PdfFile[]>([]);
  const [isMerging, setIsMerging] = useState(false);
  const [mergedPdfUrl, setMergedPdfUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = event.target.files;
    if (!files) return;

    const newFiles: PdfFile[] = [];

    for (const file of Array.from(files)) {
      if (file.type !== "application/pdf") {
        showToast(`${file.name} is not a PDF file`, "error");
        continue;
      }

      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        const pageCount = pdfDoc.getPageCount();

        newFiles.push({
          id: `${file.name}-${Date.now()}-${Math.random()}`,
          name: file.name,
          file,
          pageCount,
        });
      } catch (error) {
        console.error("PDF load error:", error);
        showToast(`Failed to load ${file.name}`, "error");
      }
    }

    if (newFiles.length > 0) {
      setPdfFiles(prev => [...prev, ...newFiles]);
      setMergedPdfUrl(null);
      showToast(`Added ${newFiles.length} PDF(s)`, "success");
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeFile = (id: string) => {
    setPdfFiles(prev => prev.filter(f => f.id !== id));
    setMergedPdfUrl(null);
  };

  const mergePdfs = useCallback(async () => {
    if (pdfFiles.length < 2) {
      showToast("Please add at least 2 PDFs to merge", "error");
      return;
    }

    setIsMerging(true);

    try {
      const mergedPdf = await PDFDocument.create();

      for (const pdfFile of pdfFiles) {
        const arrayBuffer = await pdfFile.file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        const pages = await mergedPdf.copyPages(
          pdfDoc,
          pdfDoc.getPageIndices(),
        );
        pages.forEach(page => mergedPdf.addPage(page));
      }

      const mergedPdfBytes = await mergedPdf.save();
      // Create ArrayBuffer from Uint8Array to satisfy TypeScript
      const arrayBuffer = new ArrayBuffer(mergedPdfBytes.length);
      new Uint8Array(arrayBuffer).set(mergedPdfBytes);
      const blob = new Blob([arrayBuffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      setMergedPdfUrl(url);
      showToast("PDFs merged successfully!", "success");
    } catch (error) {
      console.error("Merge error:", error);
      showToast("Failed to merge PDFs", "error");
    } finally {
      setIsMerging(false);
    }
  }, [pdfFiles, showToast]);

  const downloadMergedPdf = () => {
    if (!mergedPdfUrl) return;

    const link = document.createElement("a");
    link.download = `merged-${Date.now()}.pdf`;
    link.href = mergedPdfUrl;
    link.click();
    showToast("Merged PDF downloaded!", "success");
  };

  const clearAll = () => {
    setPdfFiles([]);
    setMergedPdfUrl(null);
  };

  const totalPages = pdfFiles.reduce((sum, f) => sum + f.pageCount, 0);

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl mb-4">
            <DocumentIcon className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Merge PDF
          </h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            Combine multiple PDF files into one document
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
          {/* Upload Button */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            multiple
            onChange={handleFileUpload}
            className="hidden"
          />

          <Animatedbutton
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-4 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl text-slate-600 dark:text-slate-300 hover:border-indigo-400 hover:text-indigo-600 transition-colors flex items-center justify-center gap-2 mb-6"
          >
            <PlusIcon className="w-6 h-6" />
            Add PDF Files
          </Animatedbutton>

          {/* File List */}
          {pdfFiles.length > 0 && (
            <>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  PDF Files ({pdfFiles.length})
                </h2>
                <span className="text-sm text-slate-500">
                  Total: {totalPages} pages
                </span>
              </div>

              <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                Drag to reorder files
              </p>

              <Reorder.Group
                axis="y"
                values={pdfFiles}
                onReorder={newOrder => {
                  setPdfFiles(newOrder);
                  setMergedPdfUrl(null);
                }}
                className="space-y-2 mb-6"
              >
                <AnimatePresence>
                  {pdfFiles.map((pdfFile, index) => (
                    <Reorder.Item
                      key={pdfFile.id}
                      value={pdfFile}
                      className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 cursor-grab active:cursor-grabbing"
                    >
                      <Bars3Icon className="w-5 h-5 text-slate-400" />
                      <span className="w-6 h-6 flex items-center justify-center bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-sm font-medium rounded-full">
                        {index + 1}
                      </span>
                      <DocumentIcon className="w-8 h-8 text-red-500" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-900 dark:text-white truncate">
                          {pdfFile.name}
                        </p>
                        <p className="text-sm text-slate-500">
                          {pdfFile.pageCount} page
                          {pdfFile.pageCount > 1 ? "s" : ""}
                        </p>
                      </div>
                      <Animatedbutton
                        onClick={() => removeFile(pdfFile.id)}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </Animatedbutton>
                    </Reorder.Item>
                  ))}
                </AnimatePresence>
              </Reorder.Group>

              {/* Actions */}
              <div className="flex flex-wrap gap-3 justify-center">
                <Animatedbutton
                  onClick={mergePdfs}
                  disabled={isMerging || pdfFiles.length < 2}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold rounded-xl transition-colors flex items-center gap-2"
                >
                  {isMerging ? (
                    <>
                      <ArrowPathIcon className="w-5 h-5 animate-spin" />
                      Merging...
                    </>
                  ) : (
                    <>
                      <DocumentIcon className="w-5 h-5" />
                      Merge PDFs
                    </>
                  )}
                </Animatedbutton>

                {mergedPdfUrl && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <Animatedbutton
                      onClick={downloadMergedPdf}
                      className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-colors flex items-center gap-2"
                    >
                      <ArrowDownTrayIcon className="w-5 h-5" />
                      Download Merged PDF
                    </Animatedbutton>
                  </motion.div>
                )}

                <Animatedbutton
                  onClick={clearAll}
                  className="px-6 py-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  Clear All
                </Animatedbutton>
              </div>
            </>
          )}

          {/* Empty State */}
          {pdfFiles.length === 0 && (
            <div className="text-center py-8">
              <DocumentIcon className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <p className="text-slate-500 dark:text-slate-400">
                No PDF files added yet
              </p>
              <p className="text-sm text-slate-400 mt-1">
                Add at least 2 PDFs to merge them
              </p>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
};

export default MergePdf;
