"use client";

import React, {
  JSX,
  useState,
  useEffect,
  useRef,
  DragEvent,
  ChangeEvent,
} from "react";
import Image from "next/image";
import {
  PhotoIcon,
  DocumentIcon,
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
  DocumentTextIcon,
  PencilSquareIcon,
  ArrowsPointingOutIcon,
  QrCodeIcon,
  LanguageIcon,
  DocumentDuplicateIcon,
  TableCellsIcon,
  CodeBracketIcon,
  CameraIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  XMarkIcon,
  FolderOpenIcon,
  ClockIcon,
  SparklesIcon,
  BugAntIcon,
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
import { useSound } from "@/hooks/useSound";
import { PiIcon } from "lucide-react";
import { FcRemoveImage } from "react-icons/fc";
import { CgRemoveR } from "react-icons/cg";

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
  emptyTitle: string;
  emptyDesc: string;
  emptyHref?: string;
  emptyCTA?: string;
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

// Feature cards configuration for quick actions grid
interface FeatureCard {
  id: string;
  label: string;
  icon: JSX.Element;
  href: string;
  description?: string;
}

const featureCards: FeatureCard[] = [
  {
    id: "background-remover",
    label: "Background Remover",
    icon: <CgRemoveR className="w-8 h-8" />,
    href: "/background-remover",
    description: "Remove image background instantly",
  },
  {
    id: "pdf-compress",
    label: "PDF Compressor",
    icon: <DocumentIcon className="w-8 h-8" />,
    href: "/pdf-compress",
    description: "Reduce PDF file size",
  },
  {
    id: "image-compressor",
    label: "Image Compressor",
    icon: <PhotoIcon className="w-8 h-8" />,
    href: "/image-compressor",
    description: "Compress images with quality control",
  },
  {
    id: "pdf-split",
    label: "PDF Splitter",
    icon: <DocumentIcon className="w-8 h-8" />,
    href: "/pdf-split",
    description: "Split PDF into individual pages",
  },
  {
    id: "watermark",
    label: "Watermark Adder",
    icon: <PhotoIcon className="w-8 h-8" />,
    href: "/watermark",
    description: "Add text watermark to images",
  },
  {
    id: "crop-rotate",
    label: "Crop & Rotate",
    icon: <PhotoIcon className="w-8 h-8" />,
    href: "/crop-rotate",
    description: "Crop, rotate and flip images",
  },
  {
    id: "color-picker",
    label: "Color Picker",
    icon: <PhotoIcon className="w-8 h-8" />,
    href: "/color-picker",
    description: "Pick HEX/RGB/HSL from any image",
  },
  {
    id: "image-to-text",
    label: "Image To Text",
    icon: <DocumentTextIcon className="w-8 h-8" />,
    href: "/image-to-text",
  },
  {
    id: "jpg-to-word",
    label: "Jpg To Word",
    icon: <DocumentIcon className="w-8 h-8" />,
    href: "/jpg-to-word",
  },
  {
    id: "pdf-to-text",
    label: "Pdf To Text",
    icon: <DocumentTextIcon className="w-8 h-8" />,
    href: "/pdf-to-text",
  },
  {
    id: "pdf-to-word",
    label: "Pdf To Word",
    icon: <DocumentIcon className="w-8 h-8" />,
    href: "/pdf-to-word",
  },
  {
    id: "text-to-word",
    label: "Text To Word",
    icon: <DocumentIcon className="w-8 h-8" />,
    href: "/text-to-word",
  },
  {
    id: "invert-image",
    label: "Invert Image",
    icon: <CameraIcon className="w-8 h-8" />,
    href: "/invert-image",
  },
  {
    id: "text-to-image",
    label: "Text To Image",
    icon: <PhotoIcon className="w-8 h-8" />,
    href: "/text-to-image",
  },
  {
    id: "image-to-pdf",
    label: "Image To Pdf",
    icon: <DocumentIcon className="w-8 h-8" />,
    href: "/image-to-pdf",
  },
  {
    id: "image-translator",
    label: "Image Translator",
    icon: <LanguageIcon className="w-8 h-8" />,
    href: "/image-translator",
  },
  {
    id: "qr-code-scanner",
    label: "Qr Code Scanner",
    icon: <QrCodeIcon className="w-8 h-8" />,
    href: "/qr-scanner",
  },
  {
    id: "word-to-pdf",
    label: "Word To Pdf",
    icon: <DocumentIcon className="w-8 h-8" />,
    href: "/word-to-pdf",
  },
  {
    id: "pdf-to-jpg",
    label: "Pdf To Jpg",
    icon: <PhotoIcon className="w-8 h-8" />,
    href: "/pdf-to-jpg",
  },
  {
    id: "merge-pdf",
    label: "Merge Pdf",
    icon: <DocumentDuplicateIcon className="w-8 h-8" />,
    href: "/merge-pdf",
  },
  {
    id: "jpg-to-excel",
    label: "Jpg To Excel",
    icon: <TableCellsIcon className="w-8 h-8" />,
    href: "/jpg-to-excel",
  },
  {
    id: "qr-code-generator",
    label: "Qr Code Generator",
    icon: <QrCodeIcon className="w-8 h-8" />,
    href: "/qr-generator",
  },
  {
    id: "word-to-jpg",
    label: "Word To Jpg",
    icon: <PhotoIcon className="w-8 h-8" />,
    href: "/word-to-jpg",
  },
  {
    id: "pdf-to-excel",
    label: "Pdf To Excel",
    icon: <TableCellsIcon className="w-8 h-8" />,
    href: "/pdf-to-excel",
  },
  {
    id: "barcode-scanner",
    label: "Barcode Scanner",
    icon: <QrCodeIcon className="w-8 h-8" />,
    href: "/barcode-scanner",
  },
  {
    id: "excel-to-jpg",
    label: "Excel To Jpg",
    icon: <PhotoIcon className="w-8 h-8" />,
    href: "/excel-to-jpg",
  },
  {
    id: "pdf-to-csv",
    label: "Pdf To Csv",
    icon: <TableCellsIcon className="w-8 h-8" />,
    href: "/convert",
  },
  {
    id: "html-to-pdf",
    label: "Html To Pdf",
    icon: <CodeBracketIcon className="w-8 h-8" />,
    href: "/html-to-pdf",
  },
  {
    id: "pdf-to-html",
    label: "Pdf To Html",
    icon: <CodeBracketIcon className="w-8 h-8" />,
    href: "/convert",
  },
  {
    id: "resize-image",
    label: "Resize Image",
    icon: <ArrowsPointingOutIcon className="w-8 h-8" />,
    href: "/resize",
  },
  {
    id: "signature",
    label: "Create Signature",
    icon: <PencilSquareIcon className="w-8 h-8" />,
    href: "/signature",
  },
];

const INITIAL_VISIBLE = 8;

// Quick Actions Grid Component
const QuickActionsGrid = ({
  router,
}: {
  router: ReturnType<typeof useRouter>;
}): JSX.Element => {
  const [expanded, setExpanded] = useState(false);
  const { play } = useSound();
  const visibleCards = expanded
    ? featureCards
    : featureCards.slice(0, INITIAL_VISIBLE);

  return (
    <div className="mb-8">
      <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4 mt-5">
        Quick Actions
      </h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
        All your conversion tools in one place. Click to get started.
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        <AnimatePresence initial={false}>
          {visibleCards.map(card => (
            <motion.div
              key={card.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.18 }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                play("click");
                router.push(card.href);
              }}
              className="group cursor-pointer p-4 sm:p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-lg hover:border-indigo-200 dark:hover:border-slate-600 transition-all duration-300"
            >
              <div className="flex flex-col items-center text-center gap-3">
                <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/50 transition-colors duration-300">
                  <div className="text-indigo-600 dark:text-indigo-400">
                    {card.icon}
                  </div>
                </div>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-300">
                  {card.label}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Expand / Collapse button */}
      <div className="mt-5 flex justify-center">
        <Animatedbutton
          onClick={() => setExpanded(prev => !prev)}
          soundType={expanded ? "collapse" : "expand"}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all shadow-sm"
        >
          {expanded ? (
            <>
              <ChevronUpIcon className="w-4 h-4" />
              Show fewer tools
            </>
          ) : (
            <>
              <ChevronRightIcon className="w-4 h-4" />
              Show all {featureCards.length} tools
            </>
          )}
        </Animatedbutton>
      </div>
    </div>
  );
};

// Stats Bar Component
const StatsBar = ({ files }: { files: FileObject[] }): JSX.Element => {
  const total = files.length;
  const signatures = files.filter(f => f.isSignature).length;
  const processed = files.filter(f => f.processed).length;

  const stats = [
    {
      label: "Total Files",
      value: total,
      color: "indigo",
      icon: <FolderOpenIcon className="w-5 h-5" />,
    },
    {
      label: "Signatures",
      value: signatures,
      color: "purple",
      icon: <PencilSquareIcon className="w-5 h-5" />,
    },
    {
      label: "Processed",
      value: processed,
      color: "emerald",
      icon: <CheckCircleIcon className="w-5 h-5" />,
    },
  ];

  const colorMap: Record<string, string> = {
    indigo:
      "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/40",
    purple:
      "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-900/40",
    emerald:
      "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/40",
  };
  const iconColorMap: Record<string, string> = {
    indigo: "text-indigo-500 dark:text-indigo-400",
    purple: "text-purple-500 dark:text-purple-400",
    emerald: "text-emerald-500 dark:text-emerald-400",
  };

  return (
    <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-8">
      {stats.map(s => (
        <motion.div
          key={s.label}
          whileHover={{ y: -2 }}
          className={`flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-3 p-3 sm:p-4 rounded-2xl border ${colorMap[s.color]}`}
        >
          <div className={`shrink-0 ${iconColorMap[s.color]}`}>{s.icon}</div>
          <div className="text-center sm:text-left">
            <p className="text-xl sm:text-2xl font-bold leading-none">
              {s.value}
            </p>
            <p className="text-xs sm:text-sm font-medium opacity-80 mt-0.5">
              {s.label}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

// Recent Activity Strip
const RecentActivityStrip = ({
  files,
  onDownload,
  router,
}: {
  files: FileObject[];
  onDownload: (f: FileObject) => void;
  router: ReturnType<typeof useRouter>;
}): JSX.Element | null => {
  const recent = [...files]
    .sort(
      (a, b) =>
        new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime(),
    )
    .slice(0, 3);

  if (recent.length === 0) return null;

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-3">
        <ClockIcon className="w-5 h-5 text-slate-400 dark:text-slate-500" />
        <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
          Recent Activity
        </h3>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
        {recent.map(file => (
          <motion.div
            key={`recent-${file.id}`}
            whileHover={{ y: -2 }}
            className="shrink w-52 flex items-center gap-3 p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm"
          >
            <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center shrink-0 overflow-hidden">
              {file.type.startsWith("image/") && (file.base64 || file.url) ? (
                <img
                  src={file.base64 || file.url}
                  alt={file.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="scale-75">{getFileIcon(file)}</div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">
                {file.name}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {formatBytes(file.size)}
              </p>
            </div>
            <Animatedbutton
              onClick={() => onDownload(file)}
              soundType="save"
              className="shrink-0 p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
              title="Download"
            >
              <ArrowDownTrayIcon className="w-3.5 h-3.5" />
            </Animatedbutton>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// Tab-specific empty state config
const tabEmptyConfig: Record<
  ActiveTab,
  {
    title: string;
    desc: string;
    icon: JSX.Element;
    cta?: string;
    href?: string;
  }
> = {
  all: {
    title: "No files yet",
    desc: "Upload your documents or images to start converting, signing, and managing them.",
    icon: (
      <ArrowUpTrayIcon className="h-10 w-10 text-indigo-500 dark:text-indigo-400" />
    ),
    cta: "Upload Your First File",
    href: "/upload",
  },
  images: {
    title: "No images yet",
    desc: "Upload a JPG, PNG or any image to get started with conversion and editing tools.",
    icon: <PhotoIcon className="h-10 w-10 text-blue-500 dark:text-blue-400" />,
    cta: "Upload an Image",
    href: "/upload",
  },
  documents: {
    title: "No documents yet",
    desc: "Upload a PDF, Word or Excel file to convert, merge, or extract content.",
    icon: (
      <DocumentIcon className="h-10 w-10 text-orange-500 dark:text-orange-400" />
    ),
    cta: "Upload a Document",
    href: "/upload",
  },
  signatures: {
    title: "No signatures yet",
    desc: "Draw or type your signature and save it here for reuse on any document.",
    icon: (
      <PencilSquareIcon className="h-10 w-10 text-purple-500 dark:text-purple-400" />
    ),
    cta: "Create a Signature",
    href: "/signature",
  },
  processed: {
    title: "Nothing processed yet",
    desc: "Use any conversion tool — your processed results will appear here automatically.",
    icon: (
      <ArrowPathIcon className="h-10 w-10 text-emerald-500 dark:text-emerald-400" />
    ),
    cta: "Try a Conversion",
    href: "/convert",
  },
};

const DashboardContent = (): JSX.Element => {
  const { files, removeFile, isLoading } = useFileContext();
  const { currentUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<SortBy>("dateAdded");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [activeTab, setActiveTab] = useState<ActiveTab>("all");

  // Bulk select state
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const router = useRouter();
  const { showToast } = useToast();
  const { play } = useSound();

  // Exit select mode if no files remain
  useEffect(() => {
    if (files.length === 0) {
      setIsSelectMode(false);
      setSelectedIds(new Set());
    }
  }, [files.length]);

  const handleDownload = (file: FileObject): void => {
    try {
      const fileData = file.base64 || file.url;
      if (!fileData) {
        alert("File data not available for download.");
        return;
      }
      downloadFile(fileData, file.name, file.type);
    } catch (error) {
      console.error("Error downloading file:", error);
      alert("Failed to download file. Please try again.");
    }
  };

  const handleDelete = (fileId: string): void => {
    removeFile(fileId);
    showToast("File deleted", "info");
  };

  const handleBulkDelete = (): void => {
    selectedIds.forEach(id => removeFile(id));
    showToast(`${selectedIds.size} file(s) deleted`, "info");
    setSelectedIds(new Set());
    setIsSelectMode(false);
  };

  const toggleSelectFile = (fileId: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(fileId) ? next.delete(fileId) : next.add(fileId);
      return next;
    });
  };

  const toggleSelectAll = (currentFiles: FileObject[]) => {
    if (selectedIds.size === currentFiles.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(currentFiles.map(f => f.id)));
    }
  };

  const getFilteredFiles = (): FileObject[] => {
    let filtered: FileObject[] = [...files];

    if (activeTab === "images") {
      filtered = filtered.filter(f => f.type.startsWith("image/"));
    } else if (activeTab === "documents") {
      filtered = filtered.filter(
        f => f.type.startsWith("application/") || f.type.startsWith("text/"),
      );
    } else if (activeTab === "signatures") {
      filtered = filtered.filter(f => f.isSignature === true);
    } else if (activeTab === "processed") {
      filtered = filtered.filter(f => f.processed === true);
    }

    if (searchQuery.trim()) {
      filtered = filtered.filter(f =>
        f.name.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    filtered.sort((a, b) => {
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
      emptyTitle: "No files yet",
      emptyDesc: "Upload files to get started.",
    },
    {
      id: "images",
      label: "Images",
      icon: <PhotoIcon className="w-5 h-5" />,
      emptyTitle: "No images yet",
      emptyDesc: "Upload an image to begin.",
    },
    {
      id: "documents",
      label: "Documents",
      icon: <DocumentIcon className="w-5 h-5" />,
      emptyTitle: "No documents yet",
      emptyDesc: "Upload a PDF or Word file.",
    },
    {
      id: "signatures",
      label: "Signatures",
      icon: <PencilSquareIcon className="w-5 h-5" />,
      emptyTitle: "No signatures yet",
      emptyDesc: "Create a signature to save here.",
    },
    {
      id: "processed",
      label: "Processed",
      icon: <ArrowPathIcon className="w-5 h-5" />,
      emptyTitle: "Nothing processed yet",
      emptyDesc: "Use a conversion tool to see results here.",
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

  const emptyConfig = tabEmptyConfig[activeTab];

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-slate-50 rounded-4xl dark:bg-slate-900 min-h-screen">
        <div className="mb-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Explore
          </h2>
        </div>

        {/* Stats Bar */}
        {files.length > 0 && <StatsBar files={files} />}

        {/* Recent Activity Strip */}
        <RecentActivityStrip
          files={files}
          onDownload={handleDownload}
          router={router}
        />

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
                <label htmlFor="sort-by" className="sr-only">
                  Sort by
                </label>
                <select
                  id="sort-by"
                  value={sortBy}
                  onChange={e => {
                    setSortBy(e.target.value as SortBy);
                    play("toggle");
                  }}
                  className="block w-full h-11 rounded-xl border-slate-200 dark:border-slate-600 pl-4 pr-10 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none cursor-pointer"
                >
                  <option value="dateAdded">Date</option>
                  <option value="name">Name</option>
                  <option value="type">Type</option>
                  <option value="size">Size</option>
                </select>
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

              {/* Select Mode Toggle */}
              {files.length > 0 && (
                <Animatedbutton
                  onClick={() => {
                    setIsSelectMode(p => !p);
                    setSelectedIds(new Set());
                  }}
                  soundType="toggle"
                  className={`h-11 px-4 rounded-xl border text-sm font-semibold transition-all ${
                    isSelectMode
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  {isSelectMode ? "Cancel" : "Select"}
                </Animatedbutton>
              )}
            </div>
          </div>

          {/* Bulk Action Bar */}
          <AnimatePresence>
            {isSelectMode && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginTop: 12 }}
                animate={{ opacity: 1, height: "auto", marginTop: 12 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                className="flex items-center gap-3 overflow-hidden"
              >
                <Animatedbutton
                  onClick={() => toggleSelectAll(filteredFiles)}
                  soundType="select"
                  className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  {selectedIds.size === filteredFiles.length
                    ? "Deselect all"
                    : "Select all"}
                </Animatedbutton>
                <span className="text-slate-300 dark:text-slate-600">|</span>
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  {selectedIds.size} selected
                </span>
                {selectedIds.size > 0 && (
                  <Animatedbutton
                    onClick={handleBulkDelete}
                    soundType="delete"
                    className="ml-auto inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-bold shadow-sm transition-all"
                  >
                    <TrashIcon className="w-4 h-4" />
                    Delete {selectedIds.size} file
                    {selectedIds.size > 1 ? "s" : ""}
                  </Animatedbutton>
                )}
              </motion.div>
            )}
          </AnimatePresence>
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
                    soundType="tab"
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
                    <span
                      className={`absolute inset-0 rounded-lg bg-slate-100 dark:bg-slate-800 opacity-0 scale-95 transition-all duration-200 ease-out
                      ${!isActive ? "group-hover:opacity-100 group-hover:scale-100" : ""}
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
          // Global empty state (no files at all)
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
          // Tab / search empty state
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-16 px-4 bg-white dark:bg-slate-800 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-center"
          >
            <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-full mb-4">
              {emptyConfig.icon}
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              {emptyConfig.title}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-sm mb-8">
              {emptyConfig.desc}
            </p>
            {emptyConfig.cta && emptyConfig.href && (
              <Animatedbutton
                onClick={() => router.push(emptyConfig.href!)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-indigo-200 dark:shadow-none hover:-translate-y-0.5"
              >
                {emptyConfig.cta}
              </Animatedbutton>
            )}
          </motion.div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <AnimatePresence mode="popLayout">
                {filteredFiles.map((file, index) => {
                  const isSelected = selectedIds.has(file.id);
                  return (
                    <motion.div
                      key={file.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                      onClick={() => isSelectMode && toggleSelectFile(file.id)}
                      className={`group flex flex-col bg-white dark:bg-slate-800 rounded-2xl shadow-sm border overflow-hidden transition-all duration-300 ${
                        isSelectMode ? "cursor-pointer" : ""
                      } ${
                        isSelected
                          ? "border-indigo-400 dark:border-indigo-500 ring-2 ring-indigo-300 dark:ring-indigo-700 shadow-lg"
                          : "border-slate-200 dark:border-slate-700 hover:shadow-lg hover:border-indigo-100 dark:hover:border-slate-600"
                      }`}
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

                        {/* Select checkbox overlay */}
                        {isSelectMode && (
                          <div
                            className={`absolute top-3 left-3 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                              isSelected
                                ? "bg-indigo-600 border-indigo-600"
                                : "bg-white/80 border-slate-300 dark:bg-slate-700/80 dark:border-slate-500"
                            }`}
                          >
                            {isSelected && (
                              <CheckCircleIcon className="w-4 h-4 text-white" />
                            )}
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
                              },
                            )}
                          </p>
                        </div>

                        {/* Action Buttons */}
                        {!isSelectMode && (
                          <div className="mt-auto pt-4 flex gap-2 border-t border-slate-100 dark:border-slate-700/50">
                            <Animatedbutton
                              onClick={() => handleDownload(file)}
                              soundType="save"
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
                                    `/sign-image?fileId=${encodeURIComponent(file.id)}`,
                                  )
                                }
                                soundType="click"
                                className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold text-indigo-700 bg-indigo-50 border-2 border-indigo-200 hover:bg-indigo-100 shadow-[0_4px_0_rgb(199,210,254)] active:shadow-none active:translate-y-1 transition-all dark:bg-slate-700 dark:text-indigo-300 dark:border-slate-600 dark:shadow-[0_4px_0_rgb(51,65,85)]"
                              >
                                Sign
                              </Animatedbutton>
                            )}

                            <Animatedbutton
                              onClick={() => handleDelete(file.id)}
                              soundType="delete"
                              className="w-10 flex-none inline-flex items-center justify-center rounded-xl bg-white border-2 border-red-100 text-red-500 hover:bg-red-50 hover:border-red-200 hover:text-red-600 shadow-[0_4px_0_rgb(254,226,226)] active:shadow-none active:translate-y-1 transition-all dark:bg-slate-800 dark:border-red-900/30 dark:shadow-none"
                              title="Delete file"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </Animatedbutton>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            <p className="mt-10 mb-4 text-sm font-medium text-slate-400 text-center">
              Showing {filteredFiles.length} of {files.length} files
            </p>
          </>
        )}

        {/* Quick Actions Grid */}
        <QuickActionsGrid router={router} />
      </div>
    </PageTransition>
  );
};

export default function Dashboard(): JSX.Element {
  return <DashboardContent />;
}
