"use client";

import React, { useState, useRef } from "react";
import PageTransition from "@/components/PageTransition";
import Animatedbutton from "@/components/Animatedbutton";
import { useToast } from "@/context/ToastContext";
import Link from "next/link";
import {
  TableCellsIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";

const PdfToExcel: React.FC = () => {
  const { showToast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFile(file);
      showToast("PDF loaded!", "success");
    }
  };

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl mb-4">
            <TableCellsIcon className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            PDF To Excel
          </h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            Extract tabular data from PDF to Excel spreadsheets
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
          <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 mb-6 flex items-start gap-3">
            <InformationCircleIcon className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-amber-800 dark:text-amber-200 font-medium">
                Complex Feature
              </p>
              <p className="text-amber-700 dark:text-amber-300 text-sm mt-1">
                This feature requires advanced table detection. For now, use{" "}
                <Link href="/pdf-to-text" className="underline">
                  PDF to Text
                </Link>{" "}
                to extract the content, then manually format in Excel.
              </p>
            </div>
          </div>

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
            <TableCellsIcon className="w-6 h-6" />
            {file ? file.name : "Select PDF File"}
          </Animatedbutton>

          <div className="flex gap-3 justify-center">
            <Link href="/pdf-to-text">
              <Animatedbutton className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl">
                Use PDF to Text
              </Animatedbutton>
            </Link>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default PdfToExcel;
