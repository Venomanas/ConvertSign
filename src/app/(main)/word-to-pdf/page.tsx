"use client";

import React, { useState, useRef, useCallback } from "react";
import { PDFDocument } from "pdf-lib";
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
  const [text, setText] = useState("");
  const [isConverting, setIsConverting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFile(file);

    // Read text content from file
    try {
      const text = await file.text();
      setText(text);
      showToast("File loaded! Text content extracted.", "success");
    } catch {
      showToast("Could not read file content. Enter text manually.", "info");
    }
  };

  const convertToPdf = useCallback(async () => {
    if (!text.trim()) {
      showToast("Please enter or upload text content", "error");
      return;
    }

    setIsConverting(true);

    try {
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([612, 792]); // US Letter size
      const { height } = page.getSize();
      const fontSize = 12;
      const margin = 50;
      const lineHeight = fontSize * 1.5;

      const lines = text.split("\n");
      let y = height - margin;

      for (const line of lines) {
        if (y < margin) {
          // Add new page if needed
          const newPage = pdfDoc.addPage([612, 792]);
          y = newPage.getHeight() - margin;
          newPage.drawText(line, { x: margin, y, size: fontSize });
        } else {
          page.drawText(line, { x: margin, y, size: fontSize });
        }
        y -= lineHeight;
      }

      const pdfBytes = await pdfDoc.save();
      const arrayBuffer = new ArrayBuffer(pdfBytes.length);
      new Uint8Array(arrayBuffer).set(pdfBytes);
      const blob = new Blob([arrayBuffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.download = `${file?.name || "document"}.pdf`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);

      showToast("PDF downloaded!", "success");
    } catch (error) {
      console.error("Conversion error:", error);
      showToast("Failed to create PDF", "error");
    } finally {
      setIsConverting(false);
    }
  }, [text, file, showToast]);

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
            Convert text documents to PDF format
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

          <Animatedbutton
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-4 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl hover:border-indigo-400 transition-colors flex items-center justify-center gap-2 mb-4"
          >
            <DocumentIcon className="w-6 h-6" />
            {file ? file.name : "Select Word/Text File"}
          </Animatedbutton>

          <p className="text-center text-sm text-slate-500 mb-4">
            Or paste text below:
          </p>

          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Paste your text here..."
            className="w-full h-48 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl py-3 px-4 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 resize-none mb-4"
          />

          <Animatedbutton
            onClick={convertToPdf}
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
                <ArrowDownTrayIcon className="w-5 h-5" />
                Convert to PDF
              </>
            )}
          </Animatedbutton>
        </div>
      </div>
    </PageTransition>
  );
};

export default WordToPdf;
