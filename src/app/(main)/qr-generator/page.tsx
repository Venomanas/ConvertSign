"use client";

import React, { useState, useRef, useCallback } from "react";
import QRCode from "qrcode";
import { motion } from "framer-motion";
import PageTransition from "@/components/PageTransition";
import Animatedbutton from "@/components/Animatedbutton";
import { useToast } from "@/context/ToastContext";
import {
  ArrowDownTrayIcon,
  QrCodeIcon,
  ClipboardDocumentIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

const QRCodeGenerator: React.FC = () => {
  const { showToast } = useToast();
  const [text, setText] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [qrSize, setQrSize] = useState(256);
  const [qrColor, setQrColor] = useState("#1e293b");
  const [bgColor, setBgColor] = useState("#ffffff");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generateQRCode = useCallback(async () => {
    if (!text.trim()) {
      showToast("Please enter text or URL", "error");
      return;
    }

    setIsGenerating(true);
    try {
      const dataUrl = await QRCode.toDataURL(text, {
        width: qrSize,
        margin: 2,
        color: {
          dark: qrColor,
          light: bgColor,
        },
        errorCorrectionLevel: "M",
      });
      setQrDataUrl(dataUrl);
      showToast("QR Code generated!", "success");
    } catch (error) {
      console.error("QR generation error:", error);
      showToast("Failed to generate QR code", "error");
    } finally {
      setIsGenerating(false);
    }
  }, [text, qrSize, qrColor, bgColor, showToast]);

  const downloadQRCode = useCallback(() => {
    if (!qrDataUrl) return;

    const link = document.createElement("a");
    link.download = `qrcode-${Date.now()}.png`;
    link.href = qrDataUrl;
    link.click();
    showToast("QR Code downloaded!", "success");
  }, [qrDataUrl, showToast]);

  const copyToClipboard = useCallback(async () => {
    if (!qrDataUrl) return;

    try {
      const response = await fetch(qrDataUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob }),
      ]);
      showToast("QR Code copied to clipboard!", "success");
    } catch (error) {
      console.error("Copy error:", error);
      showToast("Failed to copy to clipboard", "error");
    }
  }, [qrDataUrl, showToast]);

  const clearQRCode = () => {
    setText("");
    setQrDataUrl(null);
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
            QR Code Generator
          </h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            Generate QR codes for URLs, text, or any data
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Enter Content
            </h2>

            {/* Text Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Text or URL
              </label>
              <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Enter URL, text, or any data..."
                className="w-full h-32 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl py-3 px-4 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors resize-none"
              />
            </div>

            {/* Size Selector */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Size: {qrSize}px
              </label>
              <input
                type="range"
                min="128"
                max="512"
                step="64"
                value={qrSize}
                onChange={e => setQrSize(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>

            {/* Color Options */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  QR Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={qrColor}
                    onChange={e => setQrColor(e.target.value)}
                    className="w-10 h-10 rounded-lg border border-slate-200 dark:border-slate-600 cursor-pointer"
                  />
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    {qrColor}
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Background
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={bgColor}
                    onChange={e => setBgColor(e.target.value)}
                    className="w-10 h-10 rounded-lg border border-slate-200 dark:border-slate-600 cursor-pointer"
                  />
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    {bgColor}
                  </span>
                </div>
              </div>
            </div>

            {/* Generate Button */}
            <Animatedbutton
              onClick={generateQRCode}
              disabled={isGenerating || !text.trim()}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <ArrowPathIcon className="w-5 h-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <QrCodeIcon className="w-5 h-5" />
                  Generate QR Code
                </>
              )}
            </Animatedbutton>
          </div>

          {/* Preview Section */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Preview
            </h2>

            <div className="flex flex-col items-center">
              {qrDataUrl ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-6"
                >
                  <div className="p-4 bg-white rounded-xl shadow-lg">
                    <img
                      src={qrDataUrl}
                      alt="Generated QR Code"
                      className="max-w-full"
                      style={{ width: qrSize, height: qrSize }}
                    />
                  </div>
                </motion.div>
              ) : (
                <div className="w-64 h-64 flex items-center justify-center bg-slate-100 dark:bg-slate-900 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 mb-6">
                  <div className="text-center">
                    <QrCodeIcon className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                    <p className="text-sm text-slate-400">
                      QR code will appear here
                    </p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              {qrDataUrl && (
                <div className="flex flex-wrap gap-3 justify-center">
                  <Animatedbutton
                    onClick={downloadQRCode}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-colors flex items-center gap-2"
                  >
                    <ArrowDownTrayIcon className="w-4 h-4" />
                    Download
                  </Animatedbutton>
                  <Animatedbutton
                    onClick={copyToClipboard}
                    className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white font-medium rounded-xl transition-colors flex items-center gap-2"
                  >
                    <ClipboardDocumentIcon className="w-4 h-4" />
                    Copy
                  </Animatedbutton>
                  <Animatedbutton
                    onClick={clearQRCode}
                    className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-2"
                  >
                    <ArrowPathIcon className="w-4 h-4" />
                    Clear
                  </Animatedbutton>
                </div>
              )}
            </div>

            <canvas ref={canvasRef} className="hidden" />
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default QRCodeGenerator;
