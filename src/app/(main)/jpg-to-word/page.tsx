"use client";

import React, { useState, useRef } from "react";
import PageTransition from "@/components/PageTransition";
import Animatedbutton from "@/components/Animatedbutton";
import { useToast } from "@/context/ToastContext";
import Link from "next/link";
import {
  DocumentIcon,
  ArrowDownTrayIcon,
  ArrowPathIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";

const JpgToWord: React.FC = () => {
  const { showToast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFile(file);
      showToast("Image loaded!", "success");
    }
  };

  const process = async () => {
    if (!file) return;
    setIsProcessing(true);

    // Redirect to OCR first, then explain the workflow
    showToast(
      "For best results, use Image to Text first, then Text to Word",
      "info",
    );
    setTimeout(() => {
      setIsProcessing(false);
    }, 1000);
  };

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl mb-4">
            <DocumentIcon className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            JPG To Word
          </h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            Convert images to Word documents
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm mb-6">
          <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-4 mb-6 flex items-start gap-3">
            <InformationCircleIcon className="w-6 h-6 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-indigo-800 dark:text-indigo-200 font-medium">
                Recommended Workflow
              </p>
              <p className="text-indigo-700 dark:text-indigo-300 text-sm mt-1">
                For best results: Use{" "}
                <Link href="/image-to-text" className="underline">
                  Image to Text (OCR)
                </Link>{" "}
                to extract text, then{" "}
                <Link href="/text-to-word" className="underline">
                  Text to Word
                </Link>{" "}
                to create your document.
              </p>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />

          <Animatedbutton
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-4 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl hover:border-indigo-400 transition-colors flex items-center justify-center gap-2 mb-4"
          >
            <DocumentIcon className="w-6 h-6" />
            {file ? file.name : "Select Image File"}
          </Animatedbutton>

          <div className="flex gap-3 justify-center">
            <Link href="/image-to-text">
              <Animatedbutton className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl flex items-center gap-2">
                Go to Image to Text
              </Animatedbutton>
            </Link>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default JpgToWord;
