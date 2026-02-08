"use client";

import React, { useState, useRef } from "react";
import PageTransition from "@/components/PageTransition";
import Animatedbutton from "@/components/Animatedbutton";
import { useToast } from "@/context/ToastContext";
import Link from "next/link";
import {
  PhotoIcon,
  TableCellsIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";

const ExcelToJpg: React.FC = () => {
  const { showToast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFile(file);
      showToast("Excel file loaded!", "success");
    }
  };

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl mb-4">
            <PhotoIcon className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Excel To JPG
          </h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            Convert Excel spreadsheets to JPG images
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
          <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-4 mb-6 flex items-start gap-3">
            <InformationCircleIcon className="w-6 h-6 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-indigo-800 dark:text-indigo-200 font-medium">
                Recommended Approach
              </p>
              <p className="text-indigo-700 dark:text-indigo-300 text-sm mt-1">
                For best results: Take a screenshot of your Excel sheet or use
                Excel&apos;s built-in &quot;Copy as Picture&quot; feature, then
                save that image.
              </p>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileUpload}
            className="hidden"
          />

          <Animatedbutton
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-4 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl hover:border-indigo-400 transition-colors flex items-center justify-center gap-2 mb-4"
          >
            <TableCellsIcon className="w-6 h-6" />
            {file ? file.name : "Select Excel File"}
          </Animatedbutton>

          <div className="text-center py-8">
            <p className="text-slate-500 dark:text-slate-400">
              This feature requires server-side rendering of Excel files.
            </p>
            <p className="text-sm text-slate-400 mt-2">
              For complex spreadsheets, we recommend using Excel&apos;s native
              export features.
            </p>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default ExcelToJpg;
