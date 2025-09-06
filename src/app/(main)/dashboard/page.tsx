"use client";

import React, {
  JSX,
  useState,
  createContext,
  useContext,
  useEffect,
} from "react";
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

// Mock implementations to make the component self-contained
const formatBytes = (bytes: number, decimals: number = 2) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
};

const downloadFile = (base64: string, name: string) => {
  const link = document.createElement("a");
  link.href = base64;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Mock FileContext and its hook for demonstration
interface FileObject {
  id: string;
  name: string;
  type: string;
  size: number;
  base64: string;
  dateAdded: string | Date;
  processed?: boolean;
  isSignature?: boolean;
}

interface FileContextType {
  files: FileObject[];
  removeFile: (id: string) => void;
  addFile: (file: FileObject) => void;
}

const FileContext = createContext<FileContextType | undefined>(undefined);

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

const mockFiles: FileObject[] = [
  {
    id: "1",
    name: "report.pdf",
    type: "application/pdf",
    size: 150000,
    base64: "data:application/pdf;base64,...",
    dateAdded: "2023-01-15T10:00:00Z",
    processed: false,
  },
  {
    id: "2",
    name: "photo.jpg",
    type: "image/jpeg",
    size: 2500000,
    base64: "data:image/jpeg;base64,...",
    dateAdded: "2023-01-16T11:30:00Z",
    processed: true,
  },
  {
    id: "3",
    name: "signature.png",
    type: "image/png",
    size: 12000,
    base64: "data:image/png;base64,...",
    dateAdded: "2023-01-17T12:00:00Z",
    isSignature: true,
  },
  {
    id: "4",
    name: "presentation.pptx",
    type: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    size: 500000,
    base64:
      "data:application/vnd.openxmlformats-officedocument.presentationml.presentation;base64,...",
    dateAdded: "2023-01-18T13:00:00Z",
    processed: false,
  },
  {
    id: "5",
    name: "invoice.pdf",
    type: "application/pdf",
    size: 300000,
    base64: "data:application/pdf;base64,...",
    dateAdded: "2023-01-19T14:00:00Z",
    processed: true,
    isSignature: true,
  },
  {
    id: "6",
    name: "drawing.svg",
    type: "image/svg+xml",
    size: 25000,
    base64: "data:image/svg+xml;base64,...",
    dateAdded: "2023-01-20T15:00:00Z",
    processed: false,
  },
  {
    id: "7",
    name: "report_new.pdf",
    type: "application/pdf",
    size: 180000,
    base64: "data:application/pdf;base64,...",
    dateAdded: "2023-01-21T16:00:00Z",
    processed: false,
  },
  {
    id: "8",
    name: "image_2.jpeg",
    type: "image/jpeg",
    size: 2100000,
    base64: "data:image/jpeg;base64,...",
    dateAdded: "2023-01-22T17:00:00Z",
    processed: true,
  },
];

// Context Provider for demonstration
const FileProvider = ({ children }: { children: React.ReactNode }) => {
  const [files, setFiles] = useState(mockFiles);
  const removeFile = (id: string) => {
    setFiles(prevFiles => prevFiles.filter(file => file.id !== id));
  };
  const addFile = (file: FileObject) => {
    setFiles(prevFiles => [...prevFiles, file]);
  };
  return (
    <FileContext.Provider value={{ files, removeFile, addFile }}>
      {children}
    </FileContext.Provider>
  );
};

const useFileContext = () => {
  const context = useContext(FileContext);
  if (!context) {
    throw new Error("useFileContext must be used within a FileProvider");
  }
  return context;
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
  const { files, removeFile } = useFileContext();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<SortBy>("dateAdded");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [activeTab, setActiveTab] = useState<ActiveTab>("all");

  const handleDownload = (file: FileObject): void => {
    downloadFile(file.base64, file.name);
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
      filtered = filtered.filter((file: FileObject) => file.isSignature);
    } else if (activeTab === "processed") {
      filtered = filtered.filter((file: FileObject) => file.processed);
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

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <h2 className="text-3xl font-bold tracking-tight text-gray-900 text-center mb-8 dark:text-slate-400">
        Your Dashboard
      </h2>

      {/* Search and Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ">
            <MagnifyingGlassIcon className="h-5 w-5 text-blue-500 dark:text-slate-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search files..."
            className="block w-full rounded-md border-red-800 pl-10 pr-3 py-2 text-sm placeholder-gray-800 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-black dark:text-slate-100 dark:placeholder-gray-400"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-900 dark:text-slate-400">
            Sort by:
          </span>
          <div className="flex items-center space-x-2 ">
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as SortBy)}
              className="block w-full rounded-md border-gray-900 py-2 pl-3 pr-8 text-sm focus:border-indigo-500 focus:ring-slate-100 text-black dark:bg-slate-400 dark:text-slate-800"
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
              className="p-2 rounded-md hover:bg-gray-100"
              aria-label="Toggle sort direction"
            >
              {sortDirection === "asc" ? (
                <ChevronUpIcon className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronDownIcon className="w-5 h-5 text-gray-500" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="mb-6 border-b border-gray-200 overflow-x-auto">
        <nav className="-mb-px flex space-x-4">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as ActiveTab)}
              className={`group inline-flex items-center gap-2 py-2 px-3 border-b-2 text-sm font-medium transition-colors duration-200 whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-slate-400"
              }`}
            >
              {React.cloneElement(tab.icon as JSX.Element, {
                className: `w-5 h-5 ${
                  activeTab === tab.id
                    ? "text-indigo-500"
                    : "text-gray-400 group-hover:text-gray-500"
                }`,
              })}
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* File List */}
      {files.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200 shadow-sm">
          <ArrowUpTrayIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">
            No files yet
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Upload files to get started.
          </p>
        </div>
      ) : filteredFiles.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200 shadow-sm">
          <MagnifyingGlassIcon className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm font-semibold text-gray-900">
            No files match your search.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFiles.map(file => (
              <div
                key={file.id}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden group"
              >
                {/* File Preview */}
                <div className="h-44 bg-gray-100 flex items-center justify-center relative p-4">
                  {file.type.startsWith("image/") ? (
                    <Base64Image
                      src={file.base64}
                      alt={file.name}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="text-4xl">{getFileIcon(file)}</div>
                  )}
                  {file.processed && (
                    <div className="absolute top-3 right-3 bg-indigo-500 text-white text-xs font-semibold px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      Processed
                    </div>
                  )}
                  {file.isSignature && (
                    <div className="absolute top-3 left-3 bg-rose-500 text-white text-xs font-semibold px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      Signature
                    </div>
                  )}
                </div>

                {/* File Info */}
                <div className="p-5 border-t border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <p
                        className="font-semibold text-gray-900 truncate"
                        title={file.name}
                      >
                        {file.name}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        {formatBytes(file.size)} •{" "}
                        {file.type.split("/")[1]?.toUpperCase() || "UNKNOWN"}
                      </p>
                    </div>
                    <div className="ml-4 flex-shrink-0 text-gray-400">
                      {getFileIcon(file)}
                    </div>
                  </div>

                  <p className="text-xs text-gray-400 mt-2">
                    Added: {new Date(file.dateAdded).toLocaleDateString()}
                  </p>

                  {/* Actions */}
                  <div className="mt-4 flex gap-2 justify-end">
                    <button
                      onClick={() => handleDownload(file)}
                      className="flex-1 inline-flex items-center justify-center gap-1 py-2 px-3 rounded-md bg-indigo-500 text-white text-sm font-semibold hover:bg-indigo-600 transition-colors duration-200"
                    >
                      <ArrowDownTrayIcon className="w-4 h-4" />
                      Download
                    </button>
                    <button
                      onClick={() => handleDelete(file.id)}
                      className="flex-1 inline-flex items-center justify-center gap-1 py-2 px-3 rounded-md bg-white border border-gray-300 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors duration-200"
                    >
                      <TrashIcon className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-8 text-sm text-gray-500 text-center dark:text-slate-400">
            Showing {filteredFiles.length} of {files.length} files
          </p>
        </>
      )}
    </div>
  );
};

export default function Dashboard(): JSX.Element {
  return (
    <FileProvider>
      <DashboardContent />
    </FileProvider>
  );
}
