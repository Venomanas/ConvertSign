"use client";

import React, { useState, useRef, DragEvent, ChangeEvent } from "react";
import { useFileContext } from "../context/FileContext";
import { fileToBase64 } from "../utils/fileUtils";

const FileUploader: React.FC = () => {
  const { addFile } = useFileContext();
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Accepted file types
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
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
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

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = async (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      await handleFiles(e.target.files);
    }
  };

  const handleFiles = async (files: FileList) => {
    setIsUploading(true);
    setUploadProgress(0);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Check if file type is accepted
      if (!acceptedFileTypes.includes(file.type)) {
        alert(`File type ${file.type} is not supported!`);
        continue;
      }

      try {
        // Convert file to base64 for preview and manipulation
        const base64 = await fileToBase64(file);

        // Simulate upload progress
        setUploadProgress(Math.round(((i + 1) / files.length) * 100));

        // Add file to context
        addFile({
          id: `${Date.now()}-${i}`,
          name: file.name,
          type: file.type,
          size: file.size,
          base64: base64,
          dateAdded: new Date().toISOString(),
          processed: false,
          isSignature: false,
        });
      } catch (error) {
        console.error("Error processing file:", error);
      }
    }

    setTimeout(() => {
      setIsUploading(false);
      setUploadProgress(0);
      // Reset file input
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }, 500);
  };

  const handleButtonClick = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2
        className="text-2xl mb-6 text-center 
      font-extrabold font-stretch-condensed text-[#574964]"
      >
        Upload Files
      </h2>

      <div
        className={`border-2 border-dashed rounded-lg p-8 ${
          dragActive ? "border-[#574964] bg-blue-50" : "border-gray-300"
        } transition-all duration-200 flex flex-col items-center justify-center`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <svg
          className={`w-16 h-16 mb-4 ${
            dragActive ? "text-blue-500" : "text-gray-900"
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>

        <p className="mb-2 text-[#574964] text-center">
          <span className="font-medium">Click to upload</span> or drag and drop
        </p>
        <p className="text-xs text-[#574964] mb-4 text-center font-stretch-condensed p-2 ">
          PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, JPG, PNG, GIF and more
        </p>

        <button
          onClick={handleButtonClick}
          className="px-4 py-2 bg-[#C8AAAA] text-white rounded-md hover:bg-[#574964] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors"
          disabled={isUploading}
        >
          {isUploading ? "Uploading..." : "Select Files"}
        </button>

        <input
          ref={inputRef}
          onChange={handleChange}
          type="file"
          multiple
          className="hidden"
        />
      </div>

      {isUploading && (
        <div className="mt-6">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-200 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <p className="mt-2 text-sm text-center text-gray-900">
            Uploading... {uploadProgress}%
          </p>
        </div>
      )}

      <div className="mt-8">
        <h3 className="text-lg font-stretch-condensed mb-4 text-gray-900">
          Supported File Types
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 text-sm">
          <div className="bg-blue-50 rounded p-2 text-center text-black shadow-black shadow-2xs cursor-default">
            Images (JPG, PNG, GIF)
          </div>
          <div className="bg-green-50  rounded p-2 text-center text-black shadow-black shadow-2xs cursor-default">
            Documents (PDF, DOC)
          </div>
          <div className="bg-yellow-50  rounded p-2 text-center text-black shadow-black shadow-2xs cursor-default">
            Spreadsheets (XLS, XLSX)
          </div>
          <div className="bg-purple-100  rounded p-2 text-center text-black shadow-black shadow-2xs cursor-default">
            Presentations (PPT, PPTX)
          </div>
          <div className="bg-red-100 rounded p-2 text-center text-black shadow-black shadow-2xs cursor-default">
            Text files (TXT)
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUploader;
