"use client";

import React, { JSX, useState, useEffect } from "react";
import Image from "next/image";
import {
  PhotoIcon,
  DocumentIcon,
  SparklesIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  ArrowDownTrayIcon,
  TrashIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  ArrowUpTrayIcon,
  DocumentArrowUpIcon,
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import { useFileContext } from "@/context/FileContext";
import { useAuth } from "@/context/AuthContext";
import { downloadFile } from "@/utils/fileUtils";
import { FileObject } from "@/utils/authUtils";
import { useRouter } from "next/navigation";
import PageTransition from "@/components/PageTransition";
import Animatedbutton from "@/components/Animatedbutton";

// Helper function to format bytes
const formatBytes = (bytes: number, decimals: number = 2) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
};

interface Base64ImageProps {
  src: string;
  alt: string;
  className?: string;
}

const Base64Image = ({ src, alt, className }: Base64ImageProps) => {
  const [dimensions, setDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const img = document.createElement("img");
    img.onload = () => {
      setDimensions({ width: img.width, height: img.height });
      setIsLoading(false);
    };
    img.onerror = () => {
      setIsLoading(false);
    };
    img.src = src;
  }, [src]);

  if (isLoading) {
    return (
      <div
        className={`bg-gray-200 animate-pulse flex items-center justify-center ${className}`}
      >
        <PhotoIcon className="w-8 h-8 text-gray-400" />
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={dimensions?.width || 200}
      height={dimensions?.height || 150}
      className={className}
    />
  );
};

// Define types for type safety
interface Tab {
  id: string;
  label: string;
  icon?: JSX.Element;
}

type SortBy = "dateAdded" | "name" | "type" | "size";
type SortDirection = "asc" | "desc";
type ActiveTab = "all" | "images" | "documents" | "signatures" | "processed";

// Helper function to get file icons
const getFileIcon = (file: FileObject): JSX.Element => {
  const fileType = file.type.split("/")[0];
  if (file.type.includes("pdf")) {
    return <DocumentIcon className="w-10 h-10 text-red-500" />;
  }
  if (file.type.includes("presentation") || file.type.includes("word")) {
    return <DocumentIcon className="w-10 h-10 text-orange-500" />;
  }

  switch (fileType) {
    case "image":
      return <PhotoIcon className="w-10 h-10 text-blue-500" />;
    case "application":
      return <DocumentIcon className="w-10 h-10 text-gray-500" />;
    default:
      return <DocumentIcon className="w-10 h-10 text-gray-400" />;
  }
};

const DashboardContent = (): JSX.Element => {
  const { files, removeFile, isLoading } = useFileContext();
  const { currentUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<SortBy>("dateAdded");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [activeTab, setActiveTab] = useState<ActiveTab>("all");
  const router = useRouter();

  const handleDownload = (file: FileObject): void => {
    try {
      // Extract filename and type from the file object
      const fileName = file.name;
      const fileType = file.type;

      // Use base64 if available, otherwise use URL
      const fileData = file.base64 || file.url;

      if (!fileData) {
        alert("File data not available for download.");
        return;
      }

      // Use the downloadFile utility from fileUtils
      downloadFile(fileData, fileName, fileType);
    } catch (error) {
      console.error("Error downloading file:", error);
      alert("Failed to download file. Please try again.");
    }
  };

  const handleDelete = (fileId: string): void => {
    if (window.confirm("Are you sure you want to delete this file?")) {
      removeFile(fileId);
    }
  };

  const getFilteredFiles = (): FileObject[] => {
    let filtered: FileObject[] = [...files];

    if (activeTab === "images") {
      filtered = filtered.filter((file: FileObject) =>
        file.type.startsWith("image/")
      );
    } else if (activeTab === "documents") {
      filtered = filtered.filter(
        (file: FileObject) =>
          file.type.startsWith("application/") || file.type.startsWith("text/")
      );
    } else if (activeTab === "signatures") {
      filtered = filtered.filter(
        (file: FileObject) => file.isSignature === true
      );
    } else if (activeTab === "processed") {
      filtered = filtered.filter((file: FileObject) => file.processed === true);
    }

    if (searchQuery.trim()) {
      filtered = filtered.filter((file: FileObject) =>
        file.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    filtered.sort((a: FileObject, b: FileObject) => {
      let aValue: string | number | Date;
      let bValue: string | number | Date;

      switch (sortBy) {
        case "name":
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case "type":
          aValue = a.type;
          bValue = b.type;
          break;
        case "size":
          aValue = a.size;
          bValue = b.size;
          break;
        case "dateAdded":
        default:
          aValue = new Date(a.dateAdded);
          bValue = new Date(b.dateAdded);
          break;
      }

      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      if (bValue > aValue) return sortDirection === "asc" ? -1 : 1;
      return 0;
    });

    return filtered;
  };

  const tabs: Tab[] = [
    {
      id: "all",
      label: "All Files",
      icon: <DocumentArrowUpIcon className="w-5 h-5" />,
    },
    { id: "images", label: "Images", icon: <PhotoIcon className="w-5 h-5" /> },
    {
      id: "documents",
      label: "Documents",
      icon: <DocumentIcon className="w-5 h-5" />,
    },
    {
      id: "signatures",
      label: "Signatures",
      icon: <SparklesIcon className="w-5 h-5" />,
    },
    {
      id: "processed",
      label: "Processed",
      icon: <ArrowPathIcon className="w-5 h-5" />,
    },
  ];

  const filteredFiles = getFilteredFiles();

  // Show login message if user is not authenticated
  if (!currentUser) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200 shadow-sm">
          <DocumentArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-semibold text-gray-900">
            Please sign in to view your dashboard
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Sign in to access your uploaded files and dashboard features.
          </p>
        </div>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-slate-50 rounded-4xl dark:bg-slate-900 min-h-screen">
        <div className="mb-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Your Dashboard
          </h2>
          <p className="mt-2  text-green-600 dark:text-green-400">
            Welcome back, {currentUser.email}!
          </p>
        </div>

        {/* Search and Filter Controls */}
        <div className="mb-6 p-4 bg-white dark:bg-slate-400 rounded-lg shadow-sm">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-indigo-500" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search files..."
                className="block w-full rounded-md border-gray-300 dark:border-slate-600 pl-10 pr-3 py-2 bg-gray-50 dark:bg-slate-100 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-slate-400 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <label
                htmlFor="sort-by"
                className="text-sm font-medium text-gray-700 dark:text-slate-300"
              ></label>
              <select
                id="sort-by"
                value={sortBy}
                onChange={e => setSortBy(e.target.value as SortBy)}
                className="block w-full rounded-md border-gray-300 dark:border-slate-600 py-2 pl-3 pr-8  bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="dateAdded">Date</option>
                <option value="name">Name</option>
                <option value="type">Type</option>
                <option value="size">Size</option>
              </select>
              <button
                onClick={() =>
                  setSortDirection(sortDirection === "asc" ? "desc" : "asc")
                }
                className="p-2 rounded-md  hover:bg-gray-100 dark:hover:bg-slate-900"
                aria-label="Toggle sort direction"
              >
                {sortDirection === "asc" ? (
                  <ChevronUpIcon className="w-5 h-5 text-black dark:text-white" />
                ) : (
                  <ChevronDownIcon className="w-5 h-5 text-black dark:text-white" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Tab navigation */}
        <div className="mb-6">
          <div className="border-b border-gray-200 dark:border-slate-300">
            <nav className="-mb-px flex space-x-4 overflow-x-auto">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as ActiveTab)}
                  className={`group inline-flex items-center gap-2 py-3 px-1 sm:px-3 border-b-2 transition-colors duration-200 whitespace-nowrap tracking-tight ${
                    activeTab === tab.id
                      ? "border-indigo-500 text-indigo-600 dark:text-indigo-400"
                      : "border-transparent text-gray-500 dark:text-slate-500 hover:text-gray-700 hover:border-gray-400 dark:hover:text-slate-100 dark:hover:border-slate-200"
                  }`}
                >
                  {tab.icon &&
                    React.cloneElement(tab.icon, {
                      className: `w-5 h-5 ${
                        activeTab === tab.id
                          ? "text-indigo-500 dark:text-indigo-400"
                          : "text-gray-400 dark:text-slate-500 group-hover:text-gray-500 dark:group-hover:text-slate-400"
                      }`,
                    })}
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* File List */}
        {isLoading ? (
          // 🔹 Skeleton while IndexedDB is loading
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-slate-700 rounded-xl shadow-md p-4 animate-pulse flex flex-col"
              >
                <div className="h-40 bg-gray-200 dark:bg-slate-600 rounded-md mb-4" />
                <div className="h-4 bg-gray-200 dark:bg-slate-600 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-1/2 mb-2" />
                <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : files.length === 0 ? (
          // 🔹 Your original "No files yet" empty state
          <div className="text-center py-12 px-4 bg-white dark:bg-slate-100 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm">
            <ArrowUpTrayIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-slate-500" />
            <h3 className="mt-2 text-lg font-semibold text-gray-900 dark:text-black">
              No files yet
            </h3>
            <p className="mt-1 text-sm text-gray-500 ">
              Upload files to get started.
            </p>
            <Image
              src={"choose2.svg"}
              alt="Upload Files"
              width={150}
              height={150}
              className="mx-auto mb-10 mt-10 transition-transform duration-300 group-hover:scale-110"
            />
            <Animatedbutton
              onClick={() => router.push("/upload")}
              className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-md hover:bg-indigo-700 transition-colors duration-200"
            >
              <ArrowUpTrayIcon className="w-4 h-4" />
              Upload Your First File
            </Animatedbutton>
          </div>
        ) : filteredFiles.length === 0 ? (
          // 🔹 "No files found" for search/filter, when you DO have some files
          <div className="text-center py-12 px-4 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm">
            <MagnifyingGlassIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-slate-500" />
            <p className="mt-2 text-lg font-semibold text-gray-900 dark:text-white">
              No files found
            </p>
            <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
              Try adjusting your search or changing the active tab.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <AnimatePresence>
                {filteredFiles.map((file, index) => (
                  <motion.div
                    key={file.id}
                    layout
                    initial={{ opacity: 0, y: 15, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 15, scale: 0.98 }}
                    transition={{
                      duration: 0.25,
                      delay: index * 0.03,
                      ease: "easeOut",
                    }}
                    whileHover={{ scale: 1.02, translateY: -2 }}
                    className="bg-white dark:bg-slate-700 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden group flex flex-col"
                  >
                    {/* File Preview */}
                    <div className="h-48 bg-gray-100 dark:bg-slate-300 flex items-center justify-center relative p-2">
                      {file.type.startsWith("image/") &&
                      (file.base64 || file.url) ? (
                        <Base64Image
                          src={file.base64 || file.url}
                          alt={file.name}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="text-4xl">{getFileIcon(file)}</div>
                      )}
                      {/* Badges */}
                      <div className="absolute top-2 right-2 flex flex-col items-end gap-1.5">
                        {file.processed && (
                          <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-green-900 dark:text-green-300">
                            Processed
                          </span>
                        )}
                        {file.isSignature && (
                          <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-purple-900 dark:text-purple-300">
                            Signature
                          </span>
                        )}
                      </div>
                    </div>

                    {/* File Info */}
                    <div className="p-4 border-t border-gray-200 dark:border-slate-700 flex flex-col flex-grow">
                      <p
                        className="text-gray-900 dark:text-white truncate"
                        title={file.name}
                      >
                        {file.name}
                      </p>
                      <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
                        {formatBytes(file.size)} •{" "}
                        {file.type.split("/")[1]?.toUpperCase() || "UNKNOWN"}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-slate-500 mt-2">
                        Added: {new Date(file.dateAdded).toLocaleDateString()}
                      </p>

                      {/* Actions */}
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700 flex gap-2 justify-end">
                        <Animatedbutton
                          onClick={() => handleDownload(file)}
                          className="flex-1 inline-flex items-center justify-center gap-2 py-2 px-3 rounded-md bg-indigo-600 text-white text-sm transition-colors duration-200 hover:bg-indigo-700"
                        >
                          <ArrowDownTrayIcon className="w-4 h-4" />
                          Download
                        </Animatedbutton>

                        {/* NEW: Sign button only for images */}

                        {file.type.startsWith("image/") && (
                          <Animatedbutton
                            onClick={() =>
                              router.push(
                                `/sign-image?fileId=${encodeURIComponent(
                                  file.id
                                )}`
                              )
                            }
                            className="px-3 py-2 rounded-md border border-inidgo-200 text-black text-sm hover:bg-indigo-50 dark:hover:bg-indigo-300 hover:text-black hover:dark:text-white dark:text-white"
                          >
                            Sign
                          </Animatedbutton>
                        )}

                        <Animatedbutton
                          onClick={() => handleDelete(file.id)}
                          className="p-2 rounded-md bg-red-100 text-red-600 hover:bg-red-200"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </Animatedbutton>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <p className="mt-8 text-sm text-gray-500 dark:text-slate-400 text-center">
              Showing {filteredFiles.length} of {files.length} files.
            </p>
          </>
        )}
      </div>
    </PageTransition>
  );
};

export default function Dashboard(): JSX.Element {
  return <DashboardContent />;
}
