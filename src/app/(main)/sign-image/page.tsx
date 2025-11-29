"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useFileContext } from "@/context/FileContext";
import { FileObject } from "@/utils/authUtils";
import { useToast } from "@/context/ToastContext";
import { motion } from "framer-motion";

const MAX_CANVAS_WIDTH = 900;

const SignImagePage: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { files, addFile } = useFileContext();
  const { showToast } = useToast();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const baseImageRef = useRef<HTMLImageElement | null>(null);
  const signatureImageRef = useRef<HTMLImageElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const fileId = searchParams.get("fileId");

  const baseImageFile = useMemo<FileObject | undefined>(
    () => files.find(f => f.id === fileId),
    [files, fileId]
  );

  const signatures = useMemo(
    () => files.filter(f => f.isSignature && f.type.startsWith("image/")),
    [files]
  );

  const [selectedSignatureId, setSelectedSignatureId] = useState<string>("");
  const [loadingImages, setLoadingImages] = useState<boolean>(true);
  const [posX, setPosX] = useState<number>(80);
  const [posY, setPosY] = useState<number>(85);
  const [scale, setScale] = useState<number>(60);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  // Draw canvas function - no useCallback needed
  const drawCanvas = () => {
    const canvas = canvasRef.current;
    const baseImg = baseImageRef.current;

    if (!canvas || !baseImg || !baseImg.complete) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Size canvas based on base image
    const ratio = baseImg.naturalWidth / baseImg.naturalHeight;
    const targetWidth =
      baseImg.naturalWidth > MAX_CANVAS_WIDTH
        ? MAX_CANVAS_WIDTH
        : baseImg.naturalWidth;
    const targetHeight = targetWidth / ratio;

    // Only resize if dimensions changed
    if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
      canvas.width = targetWidth;
      canvas.height = targetHeight;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    // Draw base image
    ctx.drawImage(baseImg, 0, 0, canvas.width, canvas.height);

    // Draw signature if available
    const sigImg = signatureImageRef.current;
    if (sigImg && sigImg.complete && selectedSignatureId) {
      const scaleFactor = scale / 100;
      const sigWidth = (canvas.width / 4) * scaleFactor;
      const sigHeight = (sigWidth * sigImg.naturalHeight) / sigImg.naturalWidth;

      const x = (posX / 100) * canvas.width - sigWidth / 2;
      const y = (posY / 100) * canvas.height - sigHeight / 2;

      ctx.globalAlpha = 0.95;
      ctx.drawImage(sigImg, x, y, sigWidth, sigHeight);
      ctx.globalAlpha = 1;
    }
  };

  // Debounced redraw using RAF
  const scheduleRedraw = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    animationFrameRef.current = requestAnimationFrame(() => {
      drawCanvas();
      animationFrameRef.current = null;
    });
  };

  // Load base image
  useEffect(() => {
    if (!baseImageFile) return;

    setLoadingImages(true);
    setError("");

    const baseImg = new Image();

    baseImg.onload = () => {
      baseImageRef.current = baseImg;
      setLoadingImages(false);
      scheduleRedraw();
    };

    baseImg.onerror = () => {
      setError("Failed to load base image.");
      setLoadingImages(false);
    };

    // Use base64 if available, otherwise URL
    const imageSrc = baseImageFile.base64 || baseImageFile.url;
    baseImg.src = imageSrc;

    return () => {
      baseImg.onload = null;
      baseImg.onerror = null;
    };
  }, [baseImageFile]);

  // Load signature image when selection changes
  useEffect(() => {
    if (!selectedSignatureId) {
      signatureImageRef.current = null;
      scheduleRedraw();
      return;
    }

    const sigFile = signatures.find(s => s.id === selectedSignatureId);
    if (!sigFile) return;

    const sigImg = new Image();

    sigImg.onload = () => {
      signatureImageRef.current = sigImg;
      scheduleRedraw();
    };

    sigImg.onerror = () => {
      setError("Failed to load signature image.");
    };

    // Use base64 if available, otherwise URL
    const imageSrc = sigFile.base64 || sigFile.url;
    sigImg.src = imageSrc;

    return () => {
      sigImg.onload = null;
      sigImg.onerror = null;
    };
  }, [selectedSignatureId, signatures]);

  // Redraw when position/scale changes
  useEffect(() => {
    scheduleRedraw();
  }, [posX, posY, scale]);

  // Cleanup RAF on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const handleSignatureChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSignatureId(e.target.value);
  };

  const handleSaveSigned = async () => {
    if (!canvasRef.current || !baseImageFile) return;

    if (!selectedSignatureId) {
      setError("Please select a signature first.");
      return;
    }

    try {
      setIsSaving(true);
      setError("");

      const dataUrl = canvasRef.current.toDataURL("image/png");
      const res = await fetch(dataUrl);
      const blob = await res.blob();

      const baseName = baseImageFile.name.replace(/\.[^/.]+$/, "");
      const finalName = `${baseName}_signed.png`;

      const signedFile: FileObject = {
        id: `signed_${Date.now()}`,
        name: finalName,
        type: "image/png",
        size: blob.size,
        url: dataUrl,
        base64: dataUrl,
        dateAdded: new Date().toISOString(),
        processed: true,
      };

      addFile(signedFile);
      showToast("Signed image saved to dashboard", "success");
      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      setError("Failed to save signed image.");
      showToast("Failed to save signed image", "error");
    } finally {
      setIsSaving(false);
    }
  };

  if (!fileId || !baseImageFile) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <p className="text-center text-gray-600">
          Image not found. Try opening from the dashboard.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-slate-200 mb-2 text-center">
        Sign Image
      </h1>
      <p className="text-center text-sm text-gray-500 mb-6">
        Add your saved digital signature on top of this image.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* Left: Preview */}
        <motion.div
          className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4 sm:p-5 flex flex-col"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          <h2 className="text-base sm:text-lg font-semibold mb-3 text-gray-800 dark:text-slate-100">
            Preview
          </h2>
          <div className="border border-dashed border-gray-300 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-900 flex-1 flex items-center justify-center p-3 min-h-[300px]">
            {loadingImages ? (
              <div className="text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto" />
                <p className="mt-3 text-gray-600 dark:text-slate-400 text-sm">
                  Loading image...
                </p>
              </div>
            ) : (
              <canvas
                ref={canvasRef}
                className="max-w-full h-auto"
                style={{ display: "block" }}
              />
            )}
          </div>
          <p className="text-xs text-gray-500 mt-3">
            Base file: <span className="font-medium">{baseImageFile.name}</span>
          </p>
        </motion.div>

        {/* Right: Controls */}
        <motion.div
          className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4 sm:p-5 space-y-4 sm:space-y-5"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: "easeOut", delay: 0.05 }}
        >
          <h2 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-slate-100">
            Signature Settings
          </h2>

          {/* Signature selector */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">
              Choose Signature
            </label>
            {signatures.length === 0 ? (
              <div className="text-xs sm:text-sm text-gray-500 bg-yellow-50 border border-yellow-200 rounded-md p-3">
                No signatures found. Create one on the{" "}
                <button
                  onClick={() => router.push("/signature")}
                  className="text-indigo-600 underline"
                >
                  Signature page
                </button>{" "}
                first.
              </div>
            ) : (
              <select
                value={selectedSignatureId}
                onChange={handleSignatureChange}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded-md focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select a signature</option>
                {signatures.map(sig => (
                  <option key={sig.id} value={sig.id}>
                    {sig.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Position controls */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">
              Position X (left ↔ right)
            </label>
            <input
              type="range"
              min={0}
              max={100}
              value={posX}
              onChange={e => setPosX(parseInt(e.target.value) || 0)}
              className="w-full"
            />
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
              {posX}%
            </p>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">
              Position Y (top ↔ bottom)
            </label>
            <input
              type="range"
              min={0}
              max={100}
              value={posY}
              onChange={e => setPosY(parseInt(e.target.value) || 0)}
              className="w-full"
            />
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
              {posY}%
            </p>
          </div>

          {/* Size control */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">
              Signature Size
            </label>
            <input
              type="range"
              min={20}
              max={150}
              value={scale}
              onChange={e => setScale(parseInt(e.target.value) || 60)}
              className="w-full"
            />
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
              {scale}%
            </p>
          </div>

          {error && (
            <div className="p-2 text-xs sm:text-sm bg-red-50 text-red-700 rounded-md">
              {error}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2">
            <button
              onClick={() => router.push("/dashboard")}
              className="w-full sm:flex-1 py-2 px-4 text-sm border border-gray-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 font-medium"
            >
              Cancel
            </button>
            <motion.button
              onClick={handleSaveSigned}
              disabled={isSaving || !selectedSignatureId}
              whileHover={
                isSaving || !selectedSignatureId
                  ? undefined
                  : { scale: 1.02, y: -1 }
              }
              whileTap={
                isSaving || !selectedSignatureId
                  ? undefined
                  : { scale: 0.97, y: 0 }
              }
              transition={{ duration: 0.12, ease: "easeOut" }}
              className="w-full sm:flex-1 py-2 px-4 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
            >
              {isSaving ? "Saving..." : "Save Signed Image"}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SignImagePage;
