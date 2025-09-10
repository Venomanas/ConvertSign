"use client";

import React from "react";
import {
  ArrowRightIcon,
  ArrowsPointingOutIcon,
  TableCellsIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

interface UploadActionModalProps {
  fileCount: number;
  onConvert: () => void;
  onResize: () => void;
  onGoToDashboard: () => void;
  onCancel: () => void;
}

export const UploadActionModal: React.FC<UploadActionModalProps> = ({
  fileCount,
  onConvert,
  onResize,
  onGoToDashboard,
  onCancel,
}) => {
  const fileName = fileCount > 1 ? `${fileCount} files` : "1 file";

  return (
    // Modal Overlay
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      {/* Modal Content */}
      <div className="bg-card rounded-xl shadow-2xl w-full max-w-md m-4 p-6 border border-border animate-in fade-in-0 zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-foreground">
            Upload Successful
          </h2>
          <button
            onClick={onCancel}
            className="p-1 rounded-full hover:bg-muted"
          >
            <XMarkIcon className="w-6 h-6 text-muted-foreground" />
          </button>
        </div>

        <p className="text-muted-foreground mb-6">
          You&apos;ve selected **{fileName}**. What would you like to do next?
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col space-y-3">
          <button
            onClick={onConvert}
            className="w-full flex items-center justify-between p-4 bg-secondary hover:bg-muted rounded-lg transition-colors"
          >
            <div className="flex items-center space-x-3">
              <ArrowRightIcon className="w-6 h-6 text-primary" />
              <span className="font-semibold text-foreground">
                Convert Files
              </span>
            </div>
            <span className="text-sm text-muted-foreground">›</span>
          </button>

          <button
            onClick={onResize}
            className="w-full flex items-center justify-between p-4 bg-secondary hover:bg-muted rounded-lg transition-colors"
          >
            <div className="flex items-center space-x-3">
              <ArrowsPointingOutIcon className="w-6 h-6 text-primary" />
              <span className="font-semibold text-foreground">
                Resize Images
              </span>
            </div>
            <span className="text-sm text-muted-foreground">›</span>
          </button>

          <button
            onClick={onGoToDashboard}
            className="w-full flex items-center justify-between p-4 bg-secondary hover:bg-muted rounded-lg transition-colors"
          >
            <div className="flex items-center space-x-3">
              <TableCellsIcon className="w-6 h-6 text-primary" />
              <span className="font-semibold text-foreground">
                Save to Dashboard
              </span>
            </div>
            <span className="text-sm text-muted-foreground">›</span>
          </button>
        </div>
      </div>
    </div>
  );
};
