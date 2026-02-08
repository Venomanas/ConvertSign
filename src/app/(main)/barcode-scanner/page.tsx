"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { Html5Qrcode } from "html5-qrcode";
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

const BarcodeScanner: React.FC = () => {
  const { showToast } = useToast();
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = "barcode-reader";

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

    try {
      html5QrCodeRef.current = new Html5Qrcode(scannerContainerId);
      await html5QrCodeRef.current.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 300, height: 150 },
        },
        decodedText => {
          setScanResult(decodedText);
          stopScanning();
          showToast("Barcode scanned successfully!", "success");
        },
        () => {},
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

    setScanResult(null);

    try {
      const html5QrCode = new Html5Qrcode("barcode-file-scanner");
      const decodedText = await html5QrCode.scanFile(file, true);
      setScanResult(decodedText);
      showToast("Barcode detected!", "success");
      html5QrCode.clear();
    } catch (error) {
      console.error("Scan error:", error);
      showToast("No barcode found in image", "error");
    }

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

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl mb-4">
            <QrCodeIcon className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Barcode Scanner
          </h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            Scan barcodes using camera or image upload
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Scan Method
            </h2>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <Animatedbutton
                onClick={() => fileInputRef.current?.click()}
                className="py-4 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-xl flex flex-col items-center gap-2"
              >
                <PhotoIcon className="w-8 h-8 text-indigo-500" />
                Upload Image
              </Animatedbutton>
              <Animatedbutton
                onClick={isScanning ? stopScanning : startCameraScanning}
                className={`py-4 rounded-xl flex flex-col items-center gap-2 ${
                  isScanning
                    ? "bg-red-100 text-red-600"
                    : "bg-slate-100 dark:bg-slate-700 hover:bg-slate-200"
                }`}
              >
                <CameraIcon className="w-8 h-8 text-indigo-500" />
                {isScanning ? "Stop Camera" : "Use Camera"}
              </Animatedbutton>
            </div>

            <div
              id={scannerContainerId}
              className={`rounded-xl overflow-hidden ${isScanning ? "block" : "hidden"}`}
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <div id="barcode-file-scanner" className="hidden" />

            {!isScanning && !scanResult && (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="cursor-pointer p-8 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl text-center hover:border-indigo-400 transition-colors"
              >
                <PhotoIcon className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <p className="text-slate-500">
                  Click to upload an image with barcode
                </p>
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Scan Result
            </h2>

            {scanResult ? (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircleIcon className="w-6 h-6 text-emerald-500" />
                  <span className="font-medium text-emerald-600">
                    Barcode Detected!
                  </span>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 mb-4 break-all">
                  <p className="text-slate-900 dark:text-white font-mono text-sm">
                    {scanResult}
                  </p>
                </div>

                <div className="flex gap-3">
                  <Animatedbutton
                    onClick={copyToClipboard}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl flex items-center gap-2"
                  >
                    <ClipboardDocumentIcon className="w-4 h-4" />
                    Copy
                  </Animatedbutton>
                  <Animatedbutton
                    onClick={() => setScanResult(null)}
                    className="px-4 py-2 border border-slate-300 rounded-xl flex items-center gap-2"
                  >
                    <ArrowPathIcon className="w-4 h-4" />
                    Scan Again
                  </Animatedbutton>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <XCircleIcon className="w-16 h-16 text-slate-300 dark:text-slate-600 mb-4" />
                <p className="text-slate-500">No barcode scanned yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default BarcodeScanner;
