"use client";

import React, { useState, useRef, useCallback } from "react";
import PageTransition from "@/components/PageTransition";
import Animatedbutton from "@/components/Animatedbutton";
import { useToast } from "@/context/ToastContext";
import {
  DocumentIcon,
  CodeBracketIcon,
  ArrowDownTrayIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

const HtmlToPdf: React.FC = () => {
  const { showToast } = useToast();
  const [htmlContent, setHtmlContent] = useState("");
  const [isConverting, setIsConverting] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const sampleHtml = `<!DOCTYPE html>
<html>
<head>
  <title>Sample Document</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; }
    h1 { color: #4f46e5; }
  </style>
</head>
<body>
  <h1>Hello World</h1>
  <p>This is a sample HTML document.</p>
</body>
</html>`;

  const loadSample = () => {
    setHtmlContent(sampleHtml);
    showToast("Sample HTML loaded!", "success");
  };

  const convertToPdf = useCallback(async () => {
    if (!htmlContent.trim()) {
      showToast("Please enter HTML content", "error");
      return;
    }

    setIsConverting(true);

    try {
      // Create a new window for printing
      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        throw new Error("Please allow popups for this site");
      }

      printWindow.document.write(htmlContent);
      printWindow.document.close();

      // Wait for content to load
      await new Promise(resolve => setTimeout(resolve, 500));

      printWindow.print();
      printWindow.close();

      showToast("Print dialog opened! Save as PDF", "success");
    } catch (error) {
      console.error("Conversion error:", error);
      showToast(
        error instanceof Error ? error.message : "Failed to convert",
        "error",
      );
    } finally {
      setIsConverting(false);
    }
  }, [htmlContent, showToast]);

  const previewHtml = () => {
    if (iframeRef.current) {
      const doc = iframeRef.current.contentDocument;
      if (doc) {
        doc.open();
        doc.write(htmlContent || "<p>Enter HTML to preview</p>");
        doc.close();
      }
    }
  };

  React.useEffect(() => {
    previewHtml();
  }, [htmlContent]);

  return (
    <PageTransition>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl mb-4">
            <CodeBracketIcon className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            HTML To PDF
          </h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            Convert HTML content to PDF document
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                HTML Code
              </h2>
              <button
                onClick={loadSample}
                className="text-sm text-indigo-600 hover:underline"
              >
                Load Sample
              </button>
            </div>

            <textarea
              value={htmlContent}
              onChange={e => setHtmlContent(e.target.value)}
              placeholder="Paste your HTML code here..."
              className="w-full h-72 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl py-3 px-4 text-slate-900 dark:text-white font-mono text-sm resize-none mb-4"
            />

            <Animatedbutton
              onClick={convertToPdf}
              disabled={isConverting || !htmlContent.trim()}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold rounded-xl flex items-center justify-center gap-2"
            >
              {isConverting ? (
                <>
                  <ArrowPathIcon className="w-5 h-5 animate-spin" />
                  Converting...
                </>
              ) : (
                <>
                  <DocumentIcon className="w-5 h-5" />
                  Convert to PDF
                </>
              )}
            </Animatedbutton>

            <p className="text-xs text-slate-500 mt-3 text-center">
              This will open the browser print dialog. Select &quot;Save as
              PDF&quot; as your destination.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Preview
            </h2>

            <iframe
              ref={iframeRef}
              className="w-full h-80 bg-white rounded-xl border border-slate-200 dark:border-slate-600"
              title="HTML Preview"
            />
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default HtmlToPdf;
