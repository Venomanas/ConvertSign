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
import { get, set } from "idb-keyval";

const FILES_KEY = "convertSign_files_v1";

interface FileContextType {
  files: FileObject[];
  isLoading: boolean;
  addFile: (file: FileObject) => void;
  addFiles: (file: FileObject[]) => void;
  removeFile: (fileId: string) => void;
  clearFiles: () => void;
  updateFile: (fileId: string, updates: Partial<FileObject>) => void;
  getFile: (fileId: string) => FileObject | undefined;
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
  const [isLoading, setIsLoading] = useState(true);

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

  // ✅ Load from IndexedDB on first mount
  useEffect(() => {
    let cancelled = false;

    const loadFiles = async () => {
      try {
        const stored = (await get(FILES_KEY)) as FileObject[] | undefined;

        if (!stored || cancelled) {
          setIsLoading(false);
          return;
        }
        // Rebuild object URLs from blobs
        const hydrated = stored.map(storedFile => {
          const f: FileObject = { ...storedFile };

          if (f.blob instanceof Blob) {
            // create fresh object URL each time app loads
            f.url = URL.createObjectURL(f.blob);
          }

          return f;
        });

        if (!cancelled) {
          setFiles(hydrated);
        }
      } catch (err) {
        console.error("Failed to load files from IndexedDB", err);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadFiles();

    return () => {
      cancelled = true;
    };
  }, []);

  // ✅ Save to IndexedDB whenever files change
  useEffect(() => {
    if (isLoading) return; // avoid writing while we are still bootstrapping

    const persist = async () => {
      try {
        await set(FILES_KEY, files);
      } catch (err) {
        console.error("Failed to persist files to IndexedDB", err);
      }
    };

    persist();
  }, [files, isLoading]);

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
  const removeFile = (id: string) => {
    setFiles(prev => {
      const fileToRemove = prev.find(f => f.id === id);

      // ✅ revoke blob URL if we created one
      if (fileToRemove?.url?.startsWith("blob:")) {
        try {
          URL.revokeObjectURL(fileToRemove.url);
        } catch (err) {
          console.warn("Failed to revoke object URL", err);
        }
      }

      return prev.filter(f => f.id !== id);
    });
  };

  // Clear all files
  const clearFiles = () => {
    setFiles(prev => {
      // revoke all blob URLs
      prev.forEach(file => {
        if (file.url?.startsWith("blob:")) {
          try {
            URL.revokeObjectURL(file.url);
          } catch (err) {
            console.warn("Failed to revoke object URL", err);
          }
        }
      });
      return [];
    });
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
    isLoading,
    updateFile,
    getFile,
    clearFiles,
    removeFile,
    updateResizedImage,
    selectedFile,
    setSelectedFile,
    addFiles: function (): void {
      throw new Error("Function not implemented.");
    }
  };

  return (
    <FileContext.Provider value={contextValue}>{children}</FileContext.Provider>
  );
};
