"use client";

import { useFileContext } from "@/context/FileContext";
import React, { useState } from "react";
import { FileObject } from "@/utils/authUtils";
import Image from "next/image";
import { useRouter } from "next/navigation";

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
  const { files, addFile } = useFileContext();
  const [selectedFile, setSelectedFile] = useState<FileObject | null>(null);
  const [targetFormat, setTargetFormat] = useState<FormatOption | "">("");
  const [isConverting, setIsConverting] = useState(false);
  const [conversionError, setConversionError] = useState("");
  const [convertedFile, setConvertedFile] = useState<FileObject | null>(null);

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
      const blob = await fetch(selectedFile.url).then(r => r.blob());
      formData.append(
        "file",
        new File([blob], selectedFile.name, { type: selectedFile.type })
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

      // Check if response is JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("Non-JSON response:", text.substring(0, 200));
        throw new Error(
          `Server returned ${response.status}: ${response.statusText}. Please check if the API route exists.`
        );
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `Conversion failed with status ${response.status}`
        );
      }

      const { convertedFile: convertedFileBase64, fileName } =
        await response.json();

      if (!convertedFileBase64) {
        throw new Error("No converted file data received from server");
      }

      // Convert base64 to blob
      const byteCharacters = atob(convertedFileBase64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);

      // Use proper MIME type
      const correctMimeType = getMimeTypeForFormat(
        targetFormat as FormatOption
      );
      const newBlob = new Blob([byteArray], {
        type: correctMimeType,
      });

      // Create new file object
      const newFile: FileObject = {
        id: `converted_${Date.now()}`,
        name: fileName,
        url: URL.createObjectURL(newBlob),
        size: newBlob.size,
        type: correctMimeType,
        dateAdded: new Date().toISOString(),
        processed: true,
        convertedFormat: targetFormat,
        dateProcessed: new Date().toISOString(),
      };

      addFile(newFile);
      setConvertedFile(newFile);

      console.log("Conversion successful!", newFile);
    } catch (error: unknown) {
      console.error("Conversion error:", error);
      setConversionError(
        error instanceof Error
          ? error.message
          : "An error occurred during conversion. Please try again."
      );
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
    URL.revokeObjectURL(file.url);
  };

   return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
      <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center text-gray-800 dark:text-slate-300">
        Convert Files
      </h2>
      {files.length === 0 ? (
        <div className="text-center py-6 sm:py-8 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-600 px-4">No files available for conversion.</p>
          <p className="text-red-500 text-sm mt-2 px-4">
            Please upload files first.
          </p>
          <button
            onClick={() => router.push("/upload")}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 text-slate-500 dark:text-white hover:text-white text-sm font-semibold rounded-md hover:bg-indigo-300 dark:hover:bg-slate-900 dark:bg-slate-700 transition-colors duration-200"
          >
            Click here to Upload
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
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
                  <p className="mb-2 text-xs sm:text-sm text-black">Selected File:</p>
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
                    className="w-full px-3 py-2 text-sm border border-black rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
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
                {convertedFile && (
                  <div className="mb-4 p-2 bg-green-50 text-green-700 text-xs sm:text-sm rounded-md">
                    <p>Conversion successful!</p>
                    <button
                      onClick={() => handleDownload(convertedFile)}
                      className="text-indigo-600 hover:underline mt-1"
                    >
                      Download Converted File
                    </button>
                  </div>
                )}

                <button
                  onClick={handleConvert}
                  disabled={!targetFormat || isConverting}
                  className={`w-full py-2 px-4 text-sm sm:text-base rounded-md transition-colors ${
                    !targetFormat || isConverting
                      ? "bg-gray-300 text-black cursor-not-allowed"
                      : "bg-indigo-600 hover:bg-indigo-700 dark:bg-slate-600 dark:hover:bg-slate-700 text-white"
                  }`}
                >
                  {isConverting ? "Converting..." : "Convert File"}
                </button>
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
  );
};


export default FileConverter;
