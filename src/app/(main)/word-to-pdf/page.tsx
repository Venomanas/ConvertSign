"use client";

import React, { useState, useRef, useCallback } from "react";
import mammoth from "mammoth";
import jsPDF from "jspdf";
import PageTransition from "@/components/PageTransition";
import Animatedbutton from "@/components/Animatedbutton";
import { useToast } from "@/context/ToastContext";
import {
  DocumentIcon,
  ArrowDownTrayIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

const WordToPdf: React.FC = () => {
  const { showToast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [plainText, setPlainText] = useState("");
  const [htmlContent, setHtmlContent] = useState("");
  const [isDocx, setIsDocx] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setHtmlContent("");
    setPlainText("");

    try {
      const fileName = selectedFile.name.toLowerCase();

      if (fileName.endsWith(".docx") || fileName.endsWith(".doc")) {
        // Use mammoth to parse .docx files into HTML
        const arrayBuffer = await selectedFile.arrayBuffer();
        const result = await mammoth.convertToHtml({ arrayBuffer });

        if (result.value) {
          setHtmlContent(result.value);
          setIsDocx(true);
          showToast("Word document loaded! Preview ready.", "success");
        } else {
          showToast("Could not extract content from this file.", "error");
        }

        if (result.messages && result.messages.length > 0) {
          console.warn("Mammoth warnings:", result.messages);
        }
      } else {
        // Plain text fallback for .txt files
        const text = await selectedFile.text();
        setPlainText(text);
        setIsDocx(false);
        showToast("Text file loaded!", "success");
      }
    } catch (error) {
      console.error("File reading error:", error);
      showToast("Could not read file. Try a different format.", "error");
    }
  };

  const hasContent = isDocx
    ? htmlContent.trim().length > 0
    : plainText.trim().length > 0;

  const convertToPdf = useCallback(async () => {
    if (!hasContent) {
      showToast("Please upload a file or enter text content", "error");
      return;
    }

    setIsConverting(true);

    try {
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 15;
      const usableWidth = pageWidth - margin * 2;

      if (isDocx && htmlContent) {
        // Create a temporary container to render the HTML for jsPDF
        const container = document.createElement("div");
        container.style.position = "absolute";
        container.style.left = "-9999px";
        container.style.top = "0px";
        container.style.width = `${usableWidth * 3.78}px`; // mm to px approx
        container.style.fontFamily = "Arial, Helvetica, sans-serif";
        container.style.fontSize = "12px";
        container.style.lineHeight = "1.6";
        container.style.color = "#000000";
        container.innerHTML = htmlContent;

        // Style headings, paragraphs, lists inside the container
        const style = document.createElement("style");
        style.textContent = `
          .pdf-render-container h1 { font-size: 22px; font-weight: bold; margin: 12px 0 6px; }
          .pdf-render-container h2 { font-size: 18px; font-weight: bold; margin: 10px 0 5px; }
          .pdf-render-container h3 { font-size: 15px; font-weight: bold; margin: 8px 0 4px; }
          .pdf-render-container p { margin: 4px 0; }
          .pdf-render-container ul, .pdf-render-container ol { margin: 4px 0; padding-left: 20px; }
          .pdf-render-container li { margin: 2px 0; }
          .pdf-render-container strong, .pdf-render-container b { font-weight: bold; }
          .pdf-render-container em, .pdf-render-container i { font-style: italic; }
          .pdf-render-container table { border-collapse: collapse; width: 100%; margin: 8px 0; }
          .pdf-render-container td, .pdf-render-container th { border: 1px solid #ccc; padding: 4px 8px; }
        `;
        container.classList.add("pdf-render-container");
        document.head.appendChild(style);
        document.body.appendChild(container);

        await pdf.html(container, {
          callback: doc => {
            doc.save(
              `${file?.name?.replace(/\.[^.]+$/, "") || "document"}.pdf`,
            );
            showToast("PDF downloaded successfully!", "success");
          },
          x: margin,
          y: margin,
          width: usableWidth,
          windowWidth: container.scrollWidth,
          html2canvas: {
            scale: 0.265, // Fine-tuned for A4
          },
        });

        // Clean up
        document.body.removeChild(container);
        document.head.removeChild(style);
      } else {
        // Plain text mode — use simple text rendering
        const fontSize = 12;
        const lineHeight = 7;
        const pageHeight = pdf.internal.pageSize.getHeight();
        let y = margin;

        pdf.setFontSize(fontSize);
        pdf.setFont("helvetica", "normal");

        const lines = pdf.splitTextToSize(plainText, usableWidth);

        for (const line of lines) {
          if (y + lineHeight > pageHeight - margin) {
            pdf.addPage();
            y = margin;
          }
          pdf.text(line, margin, y);
          y += lineHeight;
        }

        pdf.save(`${file?.name?.replace(/\.[^.]+$/, "") || "document"}.pdf`);
        showToast("PDF downloaded successfully!", "success");
      }
    } catch (error) {
      console.error("Conversion error:", error);
      showToast("Failed to create PDF. Please try again.", "error");
    } finally {
      setIsConverting(false);
    }
  }, [hasContent, isDocx, htmlContent, plainText, file, showToast]);

  const handleReset = () => {
    setFile(null);
    setPlainText("");
    setHtmlContent("");
    setIsDocx(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl mb-4">
            <DocumentIcon className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Word To PDF
          </h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            Convert Word documents (.docx) or text files to PDF
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.doc,.docx"
            onChange={handleFileUpload}
            className="hidden"
          />

          {/* Upload Button */}
          <Animatedbutton
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-4 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl hover:border-indigo-400 transition-colors flex items-center justify-center gap-2 mb-4"
          >
            <DocumentIcon className="w-6 h-6" />
            {file ? file.name : "Select Word (.docx) or Text File"}
          </Animatedbutton>

          {/* Show content preview or text input */}
          {isDocx && htmlContent ? (
            <div className="mb-4">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">
                📄 Document Preview:
              </p>
              <div
                ref={previewRef}
                className="w-full max-h-80 overflow-y-auto bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl py-3 px-4 text-slate-900 dark:text-white prose prose-sm dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: htmlContent }}
              />
            </div>
          ) : (
            <>
              <p className="text-center text-sm text-slate-500 mb-4">
                {file
                  ? "Content from file loaded below:"
                  : "Or paste text below:"}
              </p>
              <textarea
                value={plainText}
                onChange={e => {
                  setPlainText(e.target.value);
                  setIsDocx(false);
                }}
                placeholder="Paste your text here..."
                className="w-full h-48 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl py-3 px-4 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 resize-none mb-4"
              />
            </>
          )}

          {/* Action buttons */}
          <div className="flex gap-3">
            <Animatedbutton
              onClick={convertToPdf}
              disabled={isConverting || !hasContent}
              className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold rounded-xl flex items-center justify-center gap-2"
            >
              {isConverting ? (
                <>
                  <ArrowPathIcon className="w-5 h-5 animate-spin" />
                  Converting...
                </>
              ) : (
                <>
                  <ArrowDownTrayIcon className="w-5 h-5" />
                  Convert to PDF
                </>
              )}
            </Animatedbutton>

            {file && (
              <Animatedbutton
                onClick={handleReset}
                className="px-4 py-3 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-semibold rounded-xl transition-colors"
              >
                Reset
              </Animatedbutton>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default WordToPdf;
