/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React from "react";
import { useFileContext } from "@/context/FileContext";
import { downloadFile } from "@/utils/fileUtils";

const DownloadSignature: React.FC = () => {
  const { files } = useFileContext();
  const signatureFiles = files.filter(file => file.isSignature);

  const handleDownload = (file: any) => {
    downloadFile(file.base64, file.name, file.type);
  };

  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-slate-600">
        Your Saved Signatures
      </h3>
      {signatureFiles.length > 0 ? (
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {signatureFiles.map(file => (
            <li key={file.id} className=" p-4 rounded-lg ">
              <p className="text-gray-800 font-semibold">{file.name}</p>
              <button
                onClick={() => handleDownload(file)}
                className="mt-2 w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-800 dark:bg-slate-600 dark:hover:bg-slate-700 text-white rounded-md transition-colors"
              >
                Download Signature
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-600">No signatures found.</p>
      )}
    </div>
  );
};

export default DownloadSignature;
