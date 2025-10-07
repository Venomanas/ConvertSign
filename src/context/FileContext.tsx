"use client";

import React, {
  useContext,
  useEffect,
  useState,
  ReactNode,
  createContext,
} from "react";
import { useAuth } from "@/context/AuthContext";
import { getUserFiles, updateUserFiles, FileObject } from "@/utils/authUtils";

interface FileContextType {
  files: FileObject[];
  addFile: (file: FileObject) => void;
  updateFile: (fileId: string, updates: Partial<FileObject>) => void;
  removeFile: (fileId: string) => void;
  getFile: (fileId: string) => FileObject | undefined;
  clearFiles: () => void;
  updateResizedImage: (fileId: string, resizedBase64: string) => void;
  selectedFile: FileObject | null;
  setSelectedFile: (file: FileObject | null) => void;
}

const FileContext = createContext<FileContextType | undefined>(undefined);

interface FileProviderProps {
  children: ReactNode;
}

export const useFileContext = (): FileContextType => {
  const context = useContext(FileContext);
  if (!context) {
    throw new Error("useFileContext must be used within a FileProvider");
  }
  return context;
};

export const FileProvider: React.FC<FileProviderProps> = ({ children }) => {
  const { currentUser } = useAuth();
  const [files, setFiles] = useState<FileObject[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileObject | null>(null);

  // Load user-specific files when user changes
  useEffect(() => {
    if (currentUser) {
      const userFiles = getUserFiles(currentUser.uid);
      setFiles(userFiles);
    } else {
      setFiles([]);
      setSelectedFile(null);
    }
  }, [currentUser]);

  // Update storage whenever files change
  useEffect(() => {
    if (currentUser && files.length >= 0) {
      updateUserFiles(currentUser.uid, files);
    }
  }, [files, currentUser]);

  // Add a new file
  const addFile = (file: FileObject): void => {
    setFiles(prevFiles => {
      // Check for duplicates
      const exists = prevFiles.some(f => f.id === file.id);
      if (exists) {
        console.warn("File already exists:", file.id);
        return prevFiles;
      }
      return [...prevFiles, file];
    });
  };

  // Update an existing file
  const updateFile = (fileId: string, updates: Partial<FileObject>): void => {
    setFiles(prevFiles =>
      prevFiles.map(file =>
        file.id === fileId ? { ...file, ...updates } : file
      )
    );
  };

  // Remove a file
  const removeFile = (fileId: string): void => {
    setFiles(prevFiles => prevFiles.filter(file => file.id !== fileId));

    // Clear selected file if it was deleted
    if (selectedFile?.id === fileId) {
      setSelectedFile(null);
    }
  };

  // Clear all files
  const clearFiles = (): void => {
    if (window.confirm("Are you sure you want to clear all files?")) {
      setFiles([]);
      setSelectedFile(null);
    }
  };

  // Get a single file by ID
  const getFile = (fileId: string): FileObject | undefined => {
    return files.find(file => file.id === fileId);
  };

  // Update resized image - creates new file instead of updating
 const updateResizedImage = (fileId: string, resizedBase64: string): void => {
   const originalFile = files.find(f => f.id === fileId);
   if (!originalFile) return;

   const resizedFile: FileObject = {
     ...originalFile,
     id: `resized_${Date.now()}`,
     name: `resized_${originalFile.name}`,
     base64: resizedBase64,
     size: Math.round((resizedBase64.length * 3) / 4),
     processed: true,
     dateProcessed: new Date().toISOString(), // Fixed spelling
   };

   addFile(resizedFile);
 };

  const contextValue: FileContextType = {
    files,
    addFile,
    updateFile,
    getFile,
    clearFiles,
    removeFile,
    updateResizedImage,
    selectedFile,
    setSelectedFile,
  };

  return (
    <FileContext.Provider value={contextValue}>{children}</FileContext.Provider>
  );
};
