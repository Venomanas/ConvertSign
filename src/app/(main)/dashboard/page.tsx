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
  BarsArrowDownIcon,
  BarsArrowUpIcon,
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import { useFileContext } from "@/context/FileContext";
import { useAuth } from "@/context/AuthContext";
import { downloadFile } from "@/utils/fileUtils";
import { FileObject } from "@/utils/authUtils";
import { useRouter } from "next/navigation";
import { useToast } from "@/context/ToastContext";
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
  const { showToast } = useToast();

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
    removeFile(fileId);
    showToast("File deleted", "info");
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
          <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-200">
            Welcome back &nbsp;
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              {currentUser.displayName ?? currentUser.email ?? "User"}
            </span>{" "}
            !
          </p>
        </div>

        {/* Search and Filter Controls */}
        <div className="mb-8 p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-indigo-500" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search files..."
                className="block w-full h-11 rounded-xl border-slate-200 dark:border-slate-600 pl-10 pr-3 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              />
            </div>

            {/* Sort Controls */}
            <div className="flex items-center gap-3">
              <div className="relative min-w-[140px]">
                <label htmlFor="sort-by" className="sr-only">Sort by</label>
                <select
                  id="sort-by"
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as SortBy)}
                  className="block w-full h-11 rounded-xl border-slate-200 dark:border-slate-600 pl-4 pr-10 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none cursor-pointer"
                >
                  <option value="dateAdded">Date</option>
                  <option value="name">Name</option>
                  <option value="type">Type</option>
                  <option value="size">Size</option>
                </select>
                {/* Manually placed Chevron for the Select box (Visual only) */}
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <ChevronDownIcon
                    className="h-4 w-4 text-slate-500"
                    aria-hidden="true"
                  />
                </div>
              </div>
              <Animatedbutton
                onClick={() =>
                  setSortDirection(sortDirection === "asc" ? "desc" : "asc")
                }
                className="h-11 w-11 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Toggle sort direction"
              >
                {sortDirection === "asc" ? (
                  <ChevronUpIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                ) : (
                  <ChevronDownIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                )}
              </Animatedbutton>
            </div>
          </div>
        </div>

        {/* Tab navigation */}
        <div className="mb-8">
          <div className="border-b border-slate-200 dark:border-slate-700">
            <nav className="-mb-px flex gap-6 overflow-x-auto scrollbar-hide px-1">
              {tabs.map(tab => {
                const isActive = activeTab === tab.id;

                return (
                  <Animatedbutton
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as ActiveTab)}
                    className={`
                      relative group flex items-center gap-2 py-4 px-2
                      text-sm font-medium outline-none transition-colors duration-300
                      ${
                        isActive
                          ? "text-indigo-600 dark:text-indigo-400"
                          : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                      }
                    `}
                  >
                    {/* Hover Background - Subtle Pill Effect */}
                    <span
                      className={`absolute inset-0 rounded-lg bg-slate-100 dark:bg-slate-800 opacity-0 scale-95 transition-all duration-200 ease-out
                      ${
                        !isActive
                          ? "group-hover:opacity-100 group-hover:scale-100"
                          : ""
                      }
                      `}
                    />
                    <span className="relative z-10 flex items-center gap-2">
                      {tab.icon &&
                        React.cloneElement(tab.icon, {
                          className: `w-5 h-5 transition-colors duration-300 ${
                            isActive
                              ? "text-indigo-500 dark:text-indigo-400 scale-110"
                              : "text-slate-400 dark:text-slate-500 group-hover:text-slate-500 dark:group-hover:text-slate-300"
                          }`,
                        })}
                      <span>{tab.label}</span>
                    </span>

                    {isActive && (
                      <motion.div
                        layoutId="activeTabIndicator"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 dark:bg-indigo-400 rounded-t-full"
                        initial={false}
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 30,
                        }}
                      />
                    )}
                  </Animatedbutton>
                );
              })}
            </nav>
          </div>
        </div>

        {/* File List */}
        {isLoading ? (
          // 🔹 Skeleton - Updated to match rounded-2xl look
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 animate-pulse flex flex-col h-[340px]"
              >
                <div className="h-48 bg-slate-100 dark:bg-slate-700 rounded-xl mb-4" />
                <div className="h-4 bg-slate-100 dark:bg-slate-700 rounded w-3/4 mb-3" />
                <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded w-1/2 mb-auto" />
                <div className="h-10 bg-slate-100 dark:bg-slate-700 rounded-lg w-full mt-4" />
              </div>
            ))}
          </div>
        ) : files.length === 0 ? (
          // 🔹 Empty State - "No files yet"
          <div className="flex flex-col items-center justify-center py-16 px-4 bg-white dark:bg-slate-800 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-center">
            <div className="bg-indigo-50 dark:bg-indigo-900/30 p-4 rounded-full mb-4">
              <ArrowUpTrayIcon className="h-10 w-10 text-indigo-500 dark:text-indigo-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              No files yet
            </h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-sm mb-8">
              Upload your documents or images to start converting, signing, and
              managing them.
            </p>

            <Animatedbutton
              onClick={() => router.push("/upload")}
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-indigo-200 dark:shadow-none hover:-translate-y-0.5"
            >
              <ArrowUpTrayIcon className="w-5 h-5" />
              Upload Your First File
            </Animatedbutton>
          </div>
        ) : filteredFiles.length === 0 ? (
          // 🔹 Empty Filter State
          <div className="text-center py-16 px-4 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700">
            <MagnifyingGlassIcon className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600" />
            <p className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
              No files found
            </p>
            <p className="mt-1 text-slate-500 dark:text-slate-400">
              Try adjusting your search or changing the active tab.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <AnimatePresence mode="popLayout">
                {filteredFiles.map((file, index) => (
                  <motion.div
                    key={file.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    className="group flex flex-col bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-lg hover:border-indigo-100 dark:hover:border-slate-600 transition-all duration-300"
                  >
                    {/* File Preview Area */}
                    <div className="relative h-48 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-center p-4 border-b border-slate-100 dark:border-slate-700/50">
                      {file.type.startsWith("image/") &&
                      (file.base64 || file.url) ? (
                        <div className="relative w-full h-full transition-transform duration-500 group-hover:scale-105">
                          <Base64Image
                            src={file.base64 || file.url}
                            alt={file.name}
                            className="w-full h-full object-contain drop-shadow-sm"
                          />
                        </div>
                      ) : (
                        <div className="text-5xl text-slate-400 transition-transform duration-300 group-hover:scale-110 group-hover:text-indigo-500">
                          {getFileIcon(file)}
                        </div>
                      )}

                      {/* Floating Badges */}
                      <div className="absolute top-3 right-3 flex flex-col items-end gap-2">
                        {file.processed && (
                          <span className="bg-emerald-100 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20">
                            Processed
                          </span>
                        )}
                        {file.isSignature && (
                          <span className="bg-purple-100 text-purple-700 border border-purple-200 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20">
                            Signature
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-5 flex flex-col grow">
                      <div className="mb-4">
                        <h4
                          className="font-bold text-slate-900 dark:text-slate-100 truncate text-base mb-1"
                          title={file.name}
                        >
                          {file.name}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
                          <span className="bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-300">
                            {file.type.split("/")[1]?.toUpperCase() || "FILE"}
                          </span>
                          <span>•</span>
                          <span>{formatBytes(file.size)}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-2">
                          {new Date(file.dateAdded).toLocaleDateString(
                            undefined,
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            }
                          )}
                        </p>
                      </div>

                      {/* Action Buttons - Pushed to bottom */}
                      <div className="mt-auto pt-4 flex gap-2 border-t border-slate-100 dark:border-slate-700/50">
                        <Animatedbutton
                          onClick={() => handleDownload(file)}
                          className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold text-white bg-indigo-600 shadow-[0_4px_0_rgb(67,56,202)] active:shadow-none active:translate-y-1 hover:bg-indigo-500 transition-all"
                        >
                          <ArrowDownTrayIcon className="w-4 h-4" />
                          <span className="hidden sm:inline">Save</span>
                        </Animatedbutton>

                        {/* Sign Button */}
                        {file.type.startsWith("image/") && (
                          <Animatedbutton
                            onClick={() =>
                              router.push(
                                `/sign-image?fileId=${encodeURIComponent(
                                  file.id
                                )}`
                              )
                            }
                            className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold text-indigo-700 bg-indigo-50 border-2 border-indigo-200 hover:bg-indigo-100 shadow-[0_4px_0_rgb(199,210,254)] active:shadow-none active:translate-y-1 transition-all dark:bg-slate-700 dark:text-indigo-300 dark:border-slate-600 dark:shadow-[0_4px_0_rgb(51,65,85)]"
                          >
                            Sign
                          </Animatedbutton>
                        )}

                        <Animatedbutton
                          onClick={() => handleDelete(file.id)}
                          className="w-10 flex-none inline-flex items-center justify-center rounded-xl bg-white border-2 border-red-100 text-red-500 hover:bg-red-50 hover:border-red-200 hover:text-red-600 shadow-[0_4px_0_rgb(254,226,226)] active:shadow-none active:translate-y-1 transition-all dark:bg-slate-800 dark:border-red-900/30 dark:shadow-none"
                          title="Delete file"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </Animatedbutton>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <p className="mt-10 mb-4 text-sm font-medium text-slate-400 text-center">
              Showing {filteredFiles.length} of {files.length} files
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
