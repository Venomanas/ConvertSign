"use client";

import { useFileContext } from "@/context/FileContext";
import React, { useState } from "react";
import { FileObject } from "@/utils/authUtils";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useToast } from "@/context/ToastContext";
import { motion, AnimatePresence } from "framer-motion";
import PageTransition from "@/components/PageTransition";
import AnimatedButton from "@/components/Animatedbutton";

//define type for target formats
export type FormatOption =
  | "jpg"
  | "png"
  | "webp"
  | "gif"
  | "bmp"
  | "pdf"
  | "docx"
  | "txt"
  | "csv";

const FileConverter: React.FC = () => {
  const router = useRouter();
  const { files, addFile, isLoading } = useFileContext();
  const [selectedFile, setSelectedFile] = useState<FileObject | null>(null);
  const [targetFormat, setTargetFormat] = useState<FormatOption | "">("");
  const [isConverting, setIsConverting] = useState(false);
  const [conversionError, setConversionError] = useState("");
  const [convertedFile, setConvertedFile] = useState<FileObject | null>(null);
  const { showToast } = useToast();

  //list of possible target formats based on file type
  const getTargetFormats = (fileType: string): FormatOption[] => {
    if (!fileType) return [];

    // determine available target formats based on source format
    if (fileType.startsWith("image/")) {
      return ["jpg", "png", "webp", "gif", "bmp"];
    } else if (fileType === "application/pdf") {
      return ["jpg", "png", "docx", "txt"];
    } else if (
      fileType === "application/msword" ||
      fileType ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      return ["pdf", "txt"];
    } else if (
      fileType === "application/vnd.ms-excel" ||
      fileType ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ) {
      return ["pdf", "csv"];
    } else if (
      fileType === "application/vnd.ms-powerpoint" ||
      fileType ===
        "application/vnd.openxmlformats-officedocument.presentationml.presentation"
    ) {
      return ["pdf", "jpg"];
    } else {
      return [];
    }
  };

  // handle file selection
  const handleFileSelect = (fileId: string): void => {
    const file = files.find(f => f.id === fileId);
    if (file) {
      setSelectedFile(file);
      setTargetFormat("");
      setConversionError("");
      setConvertedFile(null);
    }
  };

  //handle format selection
  const handleFormatChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ): void => {
    setTargetFormat(e.target.value as FormatOption | "");
  };

  const getOriginalFormat = (file: FileObject | null): string => {
    if (!file) return "";

    const typeMap: Record<string, string> = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
      "image/gif": "gif",
      "image/bmp": "bmp",
      "application/pdf": "pdf",
      "application/msword": "doc",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        "docx",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
        "xlsx",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation":
        "pptx",
      "application/vnd.ms-excel": "xls",
      "application/vnd.ms-powerpoint": "ppt",
      "text/plain": "txt",
      "text/csv": "csv",
    };
    return typeMap[file.type] || file.type.split("/")[1];
  };

  // Add this function to properly map target formats to MIME types
  const getMimeTypeForFormat = (format: FormatOption): string => {
    const mimeMap: Record<FormatOption, string> = {
      jpg: "image/jpeg",
      png: "image/png",
      webp: "image/webp",
      gif: "image/gif",
      bmp: "image/bmp",
      pdf: "application/pdf",
      docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      txt: "text/plain",
      csv: "text/csv",
    };
    return mimeMap[format];
  };

  const handleConvert = async (): Promise<void> => {
    if (!selectedFile || !targetFormat) {
      setConversionError("Please select both a file and a target format");
      return;
    }

    setIsConverting(true);
    setConversionError("");

    try {
      const formData = new FormData();

      // Get the original file data back as a Blob
      const sourceBlob = await fetch(selectedFile.url).then(r => r.blob());

      formData.append(
        "file",
        new File([sourceBlob], selectedFile.name, { type: selectedFile.type })
      );
      formData.append("targetFormat", targetFormat);

      console.log("Sending conversion request...", {
        file: selectedFile.name,
        type: selectedFile.type,
        target: targetFormat,
      });

      const response = await fetch("/api/convert", {
        method: "POST",
        body: formData,
      });

      // If server sent JSON, treat as error payload (from NextResponse.json)
      const contentType = response.headers.get("content-type");

      if (contentType && contentType.includes("application/json")) {
        const errorData = await response.json();
        throw new Error(
          errorData.error ||
            `Conversion failed with status (${response.statusText})`
        );
      }

      if (!response.ok) {
        throw new Error(
          `Conversion failed with status ${response.status} : ${response.statusText}`
        );
      }

      // ✅ Now we expect raw binary (Blob) from the API (PNG/JPG/PDF/etc.)
      const convertedBlob = await response.blob();

      // try to read filename from Content-Disposition header

      const disposition = response.headers.get("content-disposition");
      let fileName =
        selectedFile.name.replace(/\.[^/.]+$/, "") + `.${targetFormat}`;

      if (disposition) {
        const match = /filename="?([^"]+)"?/i.exec(disposition);
        if (match?.[1]) {
          fileName = match[1];
        }
      }

      // Decide MIME type for the new file
      const correctMimeType =
        getMimeTypeForFormat(targetFormat as FormatOption) ||
        convertedBlob.type ||
        "application/octet-stream";

      const finalBlob =
        convertedBlob.type === correctMimeType
          ? convertedBlob
          : new Blob([await convertedBlob.arrayBuffer()], {
              type: correctMimeType,
            });

      // Create object URL for preview & download
      const objectUrl = URL.createObjectURL(finalBlob);

      const newFile: FileObject = {
        id: `converted_${Date.now()}`,
        name: fileName,
        url: objectUrl,
        size: convertedBlob.size,
        type: correctMimeType,
        dateAdded: new Date().toISOString(),
        processed: true,
        convertedFormat: targetFormat,
        dateProcessed: new Date().toISOString(),
        blob: finalBlob, // for persistence

        // no base64 on purpose (better for big files)
      };
      addFile(newFile);
      setConvertedFile(newFile);
      showToast("File converted and saved to dashboard", "success");

      console.log("Conversion successful!", newFile);
    } catch (error: unknown) {
      setConversionError(
        error instanceof Error
          ? error.message
          : "An error occurred during conversion. Please try again."
      );
      showToast("Conversion failed. Check details above.", "error");
    } finally {
      setIsConverting(false);
    }
  };

  const handleDownload = (file: FileObject | null) => {
    if (!file) return;
    const a = document.createElement("a");
    a.href = file.url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <PageTransition>
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
      <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center text-gray-800 dark:text-slate-300">
        Convert Files
      </h2>
      {isLoading ? (
        // 🔹 Skeleton while files load from IndexedDB
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
            <div className="h-5 w-44 bg-gray-200 rounded mb-4 animate-pulse" />
            <div className="max-h-60 sm:max-h-72 overflow-y-auto pr-2 space-y-2">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div
                  key={idx}
                  className="flex items-center p-2 sm:p-3 mb-2 rounded-md bg-gray-100 animate-pulse"
                >
                  <div className="w-8 h-8 rounded bg-gray-300 mr-3" />
                  <div className="flex-1">
                    <div className="h-3 bg-gray-300 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
            <div className="h-5 w-44 bg-gray-200 rounded mb-4 animate-pulse" />
            <div className="space-y-3">
              <div className="h-10 bg-gray-100 rounded-md animate-pulse" />
              <div className="h-10 bg-gray-100 rounded-md animate-pulse" />
              <div className="h-10 bg-gray-100 rounded-md animate-pulse" />
            </div>
          </div>
        </div>
      ) : files.length === 0 ? (
        // 🔹 No files yet
        <div className="text-center py-8 sm:py-12 bg-white rounded-lg shadow-sm ">
          <p className="text-gray-600 px-4">
            No files available for conversion.
          </p>

          <button
            onClick={() => router.push("/upload")}
            className="px-4 sm:px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm sm:text-base  transition-colors duration-200"
          >
            Upload to Convert{" "}
          </button>
        </div>
      ) : (
        // 🔹 Normal 2-column layout
        <motion.div
          className="gap-4 sm:gap-6 lg:gap-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
            {" "}
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-gray-700">
                Select File to Convert
              </h3>

              <div className="max-h-60 sm:max-h-72 overflow-y-auto pr-2">
                {files.map(file => (
                  <div
                    key={file.id}
                    onClick={() => handleFileSelect(file.id)}
                    className={`flex items-center p-2 sm:p-3 mb-2 rounded-md cursor-pointer transition-colors ${
                      selectedFile?.id === file.id
                        ? "bg-white hover:bg-indigo-100 border border-indigo-300"
                        : "bg-gray-50 hover:bg-gray-100"
                    }`}
                  >
                    {/* File type icon */}
                    <div className="mr-2 sm:mr-3 flex-shrink-0">
                      {file.type.startsWith("image/") ? (
                        <svg
                          className="w-5 h-5 sm:w-6 sm:h-6 text-black"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      ) : file.type.includes("pdf") ? (
                        <svg
                          className="w-5 h-5 sm:w-6 sm:h-6 text-red-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                      )}
                    </div>

                    {/* File name and info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-900">
                        {(file.size / 1024).toFixed(2)} KB •{" "}
                        {getOriginalFormat(file).toUpperCase()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-gray-700">
                Conversion Options
              </h3>

              {selectedFile ? (
                <>
                  <div className="mb-4">
                    <p className="mb-2 text-xs sm:text-sm text-black">
                      Selected File:
                    </p>
                    <div className="p-2 sm:p-3 bg-indigo-50 rounded-md">
                      <p className="text-xs sm:text-sm font-medium text-black break-words">
                        {selectedFile.name}
                      </p>
                      <p className="text-xs text-gray-900 mt-1">
                        Original format:{" "}
                        {getOriginalFormat(selectedFile).toUpperCase()}
                      </p>
                    </div>
                  </div>

                  <div className="mb-4 sm:mb-6">
                    <label className="block text-xs sm:text-sm font-medium text-black mb-1">
                      Convert to:
                    </label>
                    <select
                      value={targetFormat}
                      onChange={handleFormatChange}
                      className="w-full px-3 py-2 text-sm border border-black rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
                    >
                      <option value="">Select target format</option>
                      {getTargetFormats(selectedFile.type).map(format => (
                        <option key={format} value={format}>
                          {format.toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </div>

                  {conversionError && (
                    <div className="mb-4 p-2 bg-red-50 text-red-700 text-xs sm:text-sm rounded-md break-words">
                      {conversionError}
                    </div>
                  )}
                  <AnimatePresence mode="wait">
                    {convertedFile && (
                      <motion.div
                        key={convertedFile.id}
                        initial={{ opacity: 0, y: -8, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.98 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="mb-4 p-2 text-green-500 text-xs sm:text-sm rounded-md bg-blue-50 flex justify-between"
                      >
                        <p>Conversion successful! 🎉</p>
                        <button
                          onClick={() => handleDownload(convertedFile)}
                          className="text-black bg-yellow-300 hover:bg-yellow-400 mt-1 p-4 rounded-full border-spacing-0.5 border-black shadow-2xl border-b-1 cursor-pointer"
                        >
                          Download Converted File
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <AnimatedButton
                    onClick={handleConvert}
                    disabled={!targetFormat || isConverting}
                    className={`w-full py-2 px-4 text-sm sm:text-base rounded-md transition-colors ${
                      !targetFormat || isConverting
                        ? "bg-gray-300 text-black cursor-not-allowed"
                        : "bg-indigo-600 hover:bg-indigo-700 dark:bg-slate-600 dark:hover:bg-slate-700 text-white"
                    }`}
                  >
                    {isConverting ? "Converting..." : "Convert  File"}
                  </AnimatedButton>
                </>
              ) : (
                <div className="text-center py-8 sm:py-10">
                  <p className="text-sm text-gray-500 px-4">
                    Select a file to see conversion options
                  </p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      <div className="mt-6 sm:mt-8">
        <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-gray-700 dark:text-slate-300">
          About File Conversion
        </h3>
        <div className="bg-white p-4 rounded-lg text-xs sm:text-sm text-gray-600 shadow-sm">
          <Image
            src={"convert1.svg"}
            alt="Upload Files"
            width={120}
            height={120}
            className="mx-auto mb-3 transition-transform duration-300 group-hover:scale-110"
          />
          <p className="mb-2">Convert files between various formats:</p>
          <ul className="list-disc pl-5 mb-2 space-y-1">
            <li>Convert JPG, PNG, WebP, and more</li>
            <li>Convert documents between PDF, DOC, and TXT formats</li>
            <li>Convert spreadsheets to CSV or PDF</li>
            <li>Convert presentations to PDF or image formats</li>
          </ul>
          <p>
            All conversions are processed securely at your browser local storage
          </p>
          <div className="security-note mt-4 sm:mt-8 p-3 sm:p-4 bg-green-50 border border-green-200/80 rounded-lg">
            <p className="text-center font-medium">
              After conversion all the files will be displayed at Dashboard
            </p>
          </div>
        </div>
      </div>
    </div>
    </PageTransition>
  );
};

export default FileConverter;
