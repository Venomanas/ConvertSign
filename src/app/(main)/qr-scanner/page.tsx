"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Html5Qrcode, Html5QrcodeScanner } from "html5-qrcode";
import { motion } from "framer-motion";
import PageTransition from "@/components/PageTransition";
import Animatedbutton from "@/components/Animatedbutton";
import { useToast } from "@/context/ToastContext";
import {
  CameraIcon,
  PhotoIcon,
  ClipboardDocumentIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { QrCodeIcon } from "@heroicons/react/24/solid";

const QRCodeScanner: React.FC = () => {
  const { showToast } = useToast();
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanMode, setScanMode] = useState<"camera" | "upload">("upload");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = "qr-reader";

  const stopScanning = useCallback(async () => {
    if (html5QrCodeRef.current && isScanning) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
      } catch (error) {
        console.error("Error stopping scanner:", error);
      }
    }
    setIsScanning(false);
  }, [isScanning]);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (html5QrCodeRef.current) {
        try {
          html5QrCodeRef.current.stop().catch(() => {});
          html5QrCodeRef.current.clear();
        } catch {
          // Ignore cleanup errors
        }
      }
    };
  }, []);

  const startCameraScanning = async () => {
    await stopScanning();
    setScanResult(null);
    setIsScanning(true);
    setScanMode("camera");

    try {
      html5QrCodeRef.current = new Html5Qrcode(scannerContainerId);
      await html5QrCodeRef.current.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        decodedText => {
          setScanResult(decodedText);
          stopScanning();
          showToast("QR Code scanned successfully!", "success");
        },
        () => {
          // QR code parse error - ignore during scanning
        },
      );
    } catch (error) {
      console.error("Camera error:", error);
      showToast("Failed to access camera", "error");
      setIsScanning(false);
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setScanMode("upload");
    setScanResult(null);

    try {
      const html5QrCode = new Html5Qrcode("qr-file-scanner");
      const decodedText = await html5QrCode.scanFile(file, true);
      setScanResult(decodedText);
      showToast("QR Code detected!", "success");
      html5QrCode.clear();
    } catch (error) {
      console.error("Scan error:", error);
      showToast("No QR code found in image", "error");
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const copyToClipboard = async () => {
    if (!scanResult) return;

    try {
      await navigator.clipboard.writeText(scanResult);
      showToast("Copied to clipboard!", "success");
    } catch (error) {
      console.error("Copy error:", error);
      showToast("Failed to copy", "error");
    }
  };

  const openLink = () => {
    if (!scanResult) return;

    try {
      const url = new URL(scanResult);
      window.open(url.href, "_blank", "noopener,noreferrer");
    } catch {
      // Not a valid URL
      showToast("Not a valid URL", "error");
    }
  };

  const isValidUrl = (text: string): boolean => {
    try {
      new URL(text);
      return true;
    } catch {
      return false;
    }
  };

  const clearResult = () => {
    setScanResult(null);
    stopScanning();
  };

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl mb-4">
            <QrCodeIcon className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            QR Code Scanner
          </h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            Scan QR codes using your camera or upload an image
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Scanner Section */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Scan Method
            </h2>

            {/* Scan Mode Buttons */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <Animatedbutton
                onClick={() => fileInputRef.current?.click()}
                className="py-4 px-4 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-medium rounded-xl transition-colors flex flex-col items-center gap-2"
              >
                <PhotoIcon className="w-8 h-8 text-indigo-500" />
                Upload Image
              </Animatedbutton>
              <Animatedbutton
                onClick={isScanning ? stopScanning : startCameraScanning}
                className={`py-4 px-4 font-medium rounded-xl transition-colors flex flex-col items-center gap-2 ${
                  isScanning
                    ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                    : "bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200"
                }`}
              >
                <CameraIcon className="w-8 h-8 text-indigo-500" />
                {isScanning ? "Stop Camera" : "Use Camera"}
              </Animatedbutton>
            </div>

            {/* Camera Preview */}
            <div
              id={scannerContainerId}
              className={`rounded-xl overflow-hidden bg-slate-900 ${
                isScanning ? "block" : "hidden"
              }`}
            />

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />

            {/* Hidden container for file scanning */}
            <div id="qr-file-scanner" className="hidden" />

            {/* Upload Placeholder */}
            {!isScanning && !scanResult && (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="cursor-pointer p-8 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl text-center hover:border-indigo-400 transition-colors"
              >
                <PhotoIcon className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <p className="text-slate-500 dark:text-slate-400">
                  Click to upload an image with QR code
                </p>
                <p className="text-sm text-slate-400 mt-1">
                  Supports JPG, PNG, GIF
                </p>
              </div>
            )}
          </div>

          {/* Result Section */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Scan Result
            </h2>

            {scanResult ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircleIcon className="w-6 h-6 text-emerald-500" />
                  <span className="font-medium text-emerald-600 dark:text-emerald-400">
                    QR Code Detected!
                  </span>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 mb-4 break-all">
                  <p className="text-slate-900 dark:text-white font-mono text-sm">
                    {scanResult}
                  </p>
                </div>

                {isValidUrl(scanResult) && (
                  <p className="text-sm text-indigo-600 dark:text-indigo-400 mb-4">
                    ✓ This is a valid URL
                  </p>
                )}

                <div className="flex flex-wrap gap-3">
                  <Animatedbutton
                    onClick={copyToClipboard}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors flex items-center gap-2"
                  >
                    <ClipboardDocumentIcon className="w-4 h-4" />
                    Copy
                  </Animatedbutton>
                  {isValidUrl(scanResult) && (
                    <Animatedbutton
                      onClick={openLink}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-colors"
                    >
                      Open Link
                    </Animatedbutton>
                  )}
                  <Animatedbutton
                    onClick={clearResult}
                    className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-2"
                  >
                    <ArrowPathIcon className="w-4 h-4" />
                    Scan Again
                  </Animatedbutton>
                </div>
              </motion.div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <XCircleIcon className="w-16 h-16 text-slate-300 dark:text-slate-600 mb-4" />
                <p className="text-slate-500 dark:text-slate-400">
                  No QR code scanned yet
                </p>
                <p className="text-sm text-slate-400 mt-1">
                  Upload an image or use your camera to scan
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default QRCodeScanner;
