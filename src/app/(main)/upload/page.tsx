"use client";
import React, { useState, useRef, DragEvent, ChangeEvent } from "react";
import { useFileContext } from "@/context/FileContext";
import { useToast } from "@/context/ToastContext";
import { ArrowUpTrayIcon, CheckCircleIcon } from "@heroicons/react/16/solid";
import Image from "next/image";
import { useRouter } from "next/navigation";

const FileUploader: React.FC = () => {
  const router = useRouter();
  const { addFile } = useFileContext();
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedCount, setUploadedCount] = useState(0);
  const [uploadError, setUploadError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();
  const acceptedFileTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/svg+xml",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/plain",
  ];

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.length) {
      await handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = async (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files?.length) {
      await handleFiles(e.target.files);
    }
  };

  const handleFiles = async (fileList: FileList) => {
    setIsUploading(true);
    setUploadError("");
    setUploadedCount(0);
    let successCount = 0;
    const errors: string[] = [];

    //loop
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      //validations
      if (!acceptedFileTypes.includes(file.type)) {
        errors.push(`${file.name}: Unsupported file type`);
        continue;
      }

      if (file.size > 10 * 1024 * 1024) {
        errors.push(`${file.name}: File too large (max 10MB)`);
        continue;
      }

      try {
        const objectUrl = URL.createObjectURL(file);

        // Fix: Add missing url property
        addFile({
          id: `${Date.now()}-${i}`,
          name: file.name,
          type: file.type,
          size: file.size,
          url: objectUrl,
          dateAdded: new Date().toISOString(),
          processed: false,
          isSignature: false,
          blob: file, // ✅ store the original file as Blob for persistence
        });

        successCount++;
        setUploadedCount(successCount);
      } catch (error) {
        console.error("Error processing file:", error);
        errors.push(`${file.name}: Failed to process`);
      }
    }

    if (successCount > 0) {
      showToast(
        `Uploaded ${successCount} file${successCount > 1 ? "s" : ""}`,
        "success"
      );
    }
    if (errors.length > 0) {
      showToast("Some files failed to upload. Check details below.", "error");
    }


    setIsUploading(false);
    if (errors.length > 0) {
      setUploadError(errors.join("\n"));
    }

    if (inputRef.current) {
      inputRef.current.value = "";
    }

    // if (successCount > 0) {
    //   setTimeout(() => {
    //     setUploadedCount(0);
    //   }, 3000);
    // }
  };

  const handleButtonClick = () => {
    inputRef.current?.click();
  };

  return (
    <div className="max-w-4xl mx-auto  p-6 bg-white rounded-xl shadow-lg border-none dark:bg-slate-100">
      <h2 className="text-2xl font-semibold tracking-tight text-slate-800 text-center mb-8">
        Upload Your Files
      </h2>

      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 ${
          dragActive ? "border-indigo-500 bg-white" : "border-black "
        } transition-all duration-200 flex flex-col items-center justify-center dark:bg-slate-100 bg-slate-100`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center text-center">
          <ArrowUpTrayIcon
            className={`w-16 h-16 mb-4 transition-colors duration-200 ${
              dragActive
                ? "text-indigo-400"
                : "text-gray-400 dark:text-slate-900"
            }`}
          />
          <p className="mb-2 text-black text-center">
            <span className=" text-indigo-500">
              {" "}
              Drag and drop{" "}
            </span>
            your files here
          </p>
          <p className="text-sm max-w-sm text-indigo-400 font-normal mb-4 text-center p-2">
            Max 10 MB per file.
          </p>
        </div>

        <button
          onClick={handleButtonClick}
          disabled={isUploading}
          className="px-6 py-3 bg-slate-900 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-slate-900 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
        >
          {isUploading ? "Uploading..." : "Click to upload"}
        </button>

        <input
          ref={inputRef}
          onChange={handleChange}
          type="file"
          multiple
          accept={acceptedFileTypes.join(",")}
          className="hidden"
          disabled={isUploading}
        />
      </div>

      {/* Upload Status */}
      {isUploading && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600 mr-3"></div>
            <p className="text-sm text-gray-700">
              Uploading files... ({uploadedCount} uploaded)
            </p>
          </div>
        </div>
      )}

      {/* Success Message */}
      {uploadedCount > 0 && !isUploading && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <CheckCircleIcon className="w-5 h-5 text-green-600 mr-3" />
            <p className="text-sm text-green-800">
              Successfully uploaded {uploadedCount} file
              {uploadedCount > 1 ? "s" : ""}!
            </p>
          </div>
        </div>
      )}

      {/* Error Messages */}
      {uploadError && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800 font-semibold mb-2">
            Upload errors:
          </p>
          <pre className="text-sm text-red-700 whitespace-pre-wrap">
            {uploadError}
          </pre>
        </div>
      )}

      {uploadedCount > 0 && !isUploading && (
        <div className="mt-6 flex flex-wrap gap-3 justify-center">
          <button
            onClick={() => router.push("/dashboard")}
            className="px-6 py-2 bg-indigo-600 dark:bg-slate-900 text-white rounded-md hover:bg-indigo-400 dark:hover:bg-indigo-700 transition-colors font-medium"
          >
            Go to Dashboard
          </button>

          <button
            onClick={() => router.push("/convert")}
            className="px-6 py-2 bg-indigo-100 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-medium"
          >
            Convert Files
          </button>

          <button
            onClick={() => router.push("/resize")}
            className="px-6 py-2 bg-indigo-100 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-medium"
          >
            Resize Images
          </button>
        </div>
      )}

      {/* Supported File Types */}
      <div className="mt-12">
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          Supported File Types
        </h3>
        <Image
          src="support.svg"
          alt="Supported files"
          width={150}
          height={150}
          className="mx-auto mb-4"
        />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 text-sm">
          <div className="bg-blue-100 rounded p-3 text-center text-black shadow-sm">
            Images (JPG, PNG, GIF)
          </div>
          <div className="bg-pink-100 rounded p-3 text-center text-black shadow-sm">
            Documents (PDF, DOC)
          </div>
          <div className="bg-green-100 rounded p-3 text-center text-black shadow-sm">
            Spreadsheets (XLS, XLSX)
          </div>
          <div className="bg-purple-100 rounded p-3 text-center text-black shadow-sm">
            Text files (TXT)
          </div>
        </div>
      </div>

      {/* How to Use */}
      <div className="mt-1  rounded-lg p-6">
        <h3 className="text-xl font-bold text-black mb-4">How to Use</h3>
        <ol className="space-y-3 space-x-1">
          {[
            "Upload your files using drag & drop or the upload button",
            "Files are stored securely in your browser",
            "Use the quick action buttons to convert, resize, or manage files",
            "Download or delete files anytime from your dashboard",
          ].map((step, index) => (
            <li key={index} className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                {index + 1}
              </div>
              <p className="text-gray-700 pt-0.5">{step}</p>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
};

export default FileUploader;
