"use client";

import React, { useState, useRef, useCallback } from "react";
import PageTransition from "@/components/PageTransition";
import Animatedbutton from "@/components/Animatedbutton";
import { useToast } from "@/context/ToastContext";
import {
  DocumentTextIcon,
  ArrowDownTrayIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

const TextToWord: React.FC = () => {
  const { showToast } = useToast();
  const [text, setText] = useState("");
  const [isConverting, setIsConverting] = useState(false);

  const convertToWord = useCallback(() => {
    if (!text.trim()) {
      showToast("Please enter some text", "error");
      return;
    }

    setIsConverting(true);

    try {
      // Create a simple HTML structure for Word
      const htmlContent = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" 
              xmlns:w="urn:schemas-microsoft-com:office:word"
              xmlns="http://www.w3.org/TR/REC-html40">
        <head>
          <meta charset="utf-8">
          <title>Document</title>
        </head>
        <body>
          ${text
            .split("\n")
            .map(line => `<p>${line || "&nbsp;"}</p>`)
            .join("")}
        </body>
        </html>
      `;

      const blob = new Blob([htmlContent], { type: "application/msword" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = `document-${Date.now()}.doc`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);

      showToast("Word document downloaded!", "success");
    } catch (error) {
      console.error("Conversion error:", error);
      showToast("Failed to create document", "error");
    } finally {
      setIsConverting(false);
    }
  }, [text, showToast]);

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl mb-4">
            <DocumentTextIcon className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Text To Word
          </h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            Convert plain text to Word document
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Enter Text
          </h2>

          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Type or paste your text here..."
            className="w-full h-64 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl py-3 px-4 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 resize-none mb-4"
          />

          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">
              {text.length} characters
            </span>
            <Animatedbutton
              onClick={convertToWord}
              disabled={isConverting || !text.trim()}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold rounded-xl flex items-center gap-2"
            >
              {isConverting ? (
                <>
                  <ArrowPathIcon className="w-5 h-5 animate-spin" />
                  Converting...
                </>
              ) : (
                <>
                  <ArrowDownTrayIcon className="w-5 h-5" />
                  Download Word Document
                </>
              )}
            </Animatedbutton>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default TextToWord;
