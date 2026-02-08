"use client";

import React, { useState, useRef, useCallback } from "react";
import PageTransition from "@/components/PageTransition";
import Animatedbutton from "@/components/Animatedbutton";
import { useToast } from "@/context/ToastContext";
import {
  DocumentIcon,
  DocumentTextIcon,
  ArrowDownTrayIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

const PdfToText: React.FC = () => {
  const { showToast } = useToast();
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
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
    setExtractedText("");
    showToast("PDF loaded!", "success");
  };

  const extractText = useCallback(async () => {
    if (!pdfFile) {
      showToast("Please upload a PDF first", "error");
      return;
    }

    setIsExtracting(true);
    setProgress(0);
    setExtractedText("");

    try {
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
      let fullText = "";

      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .map((item: any) => item.str)
          .join(" ");
        fullText += `--- Page ${i} ---\n${pageText}\n\n`;
        setProgress(Math.round((i / numPages) * 100));
      }

      setExtractedText(fullText);
      showToast(`Extracted text from ${numPages} page(s)!`, "success");
    } catch (error) {
      console.error("Extraction error:", error);
      showToast("Failed to extract text", "error");
    } finally {
      setIsExtracting(false);
    }
  }, [pdfFile, showToast]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(extractedText);
      showToast("Copied to clipboard!", "success");
    } catch {
      showToast("Failed to copy", "error");
    }
  };

  const downloadText = () => {
    const blob = new Blob([extractedText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = `${pdfFile?.name || "extracted"}.txt`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
    showToast("Text file downloaded!", "success");
  };

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl mb-4">
            <DocumentTextIcon className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            PDF To Text
          </h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            Extract text content from PDF files
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Upload PDF
            </h2>

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

            {isExtracting && (
              <div className="mb-4">
                <div className="flex justify-between text-sm text-slate-500 mb-1">
                  <span>Extracting...</span>
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

            <Animatedbutton
              onClick={extractText}
              disabled={!pdfFile || isExtracting}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold rounded-xl flex items-center justify-center gap-2"
            >
              {isExtracting ? (
                <>
                  <ArrowPathIcon className="w-5 h-5 animate-spin" />
                  Extracting...
                </>
              ) : (
                <>
                  <DocumentTextIcon className="w-5 h-5" />
                  Extract Text
                </>
              )}
            </Animatedbutton>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Extracted Text
              </h2>
              {extractedText && (
                <span className="text-sm text-slate-500">
                  {extractedText.length} chars
                </span>
              )}
            </div>

            {extractedText ? (
              <>
                <textarea
                  value={extractedText}
                  onChange={e => setExtractedText(e.target.value)}
                  className="w-full h-64 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl py-3 px-4 text-slate-900 dark:text-white resize-none mb-4"
                />
                <div className="flex gap-3">
                  <Animatedbutton
                    onClick={copyToClipboard}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl"
                  >
                    Copy
                  </Animatedbutton>
                  <Animatedbutton
                    onClick={downloadText}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl flex items-center gap-2"
                  >
                    <ArrowDownTrayIcon className="w-4 h-4" />
                    Download .txt
                  </Animatedbutton>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <DocumentTextIcon className="w-16 h-16 text-slate-300 dark:text-slate-600 mb-4" />
                <p className="text-slate-500">
                  Extracted text will appear here
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default PdfToText;
