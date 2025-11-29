// src/components/SignatureCanvas.tsx
"use client";

import React, { useState, useRef, useEffect } from "react";
import { useFileContext } from "@/context/FileContext";
import Image from "next/image";
import { FileObject } from "@/utils/authUtils";
import DownloadSignature from "@/components/DownloadSignature";
import { useToast } from "@/context/ToastContext";
import { motion } from "framer-motion";

interface ColorOption {
  label: string;
  value: string;
}

interface SizeOption {
  label: string;
  value: number;
}

type Point = { x: number; y: number };
type Stroke = { points: Point[]; color: string; width: number };

const SignatureCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [penColor, setPenColor] = useState<string>("#000000");
  const [penSize, setPenSize] = useState<number>(2);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<Stroke | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [signatureName, setSignatureName] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [hasDrawn, setHasDrawn] = useState(false);

  const { addFile } = useFileContext();
  const { showToast } = useToast();

  // Available colors for the signature pen
  const availableColors: ColorOption[] = [
    { label: "Black", value: "#000000" },
    { label: "Blue", value: "#0000ff" },
    { label: "Red", value: "#ff0000" },
    { label: "Green", value: "#008000" },
  ];

  // Available pen sizes
  const availableSizes: SizeOption[] = [
    { label: "Small", value: 1 },
    { label: "Medium", value: 2 },
    { label: "Large", value: 3 },
    { label: "Extra Large", value: 4 },
  ];

  // Resize canvas to container and redraw strokes
  useEffect(() => {
    const resizeCanvas = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      canvas.width = rect.width * dpr;
      canvas.height = (rect.height || 300) * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height || 300}px`;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      redrawStrokes(ctx, strokes);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, [strokes]);

  const redrawStrokes = (
    ctx: CanvasRenderingContext2D,
    allStrokes: Stroke[]
  ) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // transparent background → good for overlaying on docs
    allStrokes.forEach(stroke => {
      if (stroke.points.length < 2) return;
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.width;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      ctx.beginPath();
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
      }
      ctx.stroke();
    });
  };

  const getCanvasPos = (clientX: number, clientY: number): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>): void => {
    e.preventDefault();
    const point = getCanvasPos(e.clientX, e.clientY);
    const newStroke: Stroke = {
      points: [point],
      color: penColor,
      width: penSize * 2,
    };
    setCurrentStroke(newStroke);
    setIsDrawing(true);
    setHasDrawn(true);
    setError("");
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>): void => {
    if (!isDrawing || !currentStroke) return;

    const point = getCanvasPos(e.clientX, e.clientY);
    const updatedStroke: Stroke = {
      ...currentStroke,
      points: [...currentStroke.points, point],
    };
    setCurrentStroke(updatedStroke);

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    redrawStrokes(ctx, [...strokes, updatedStroke]);
  };

  const endDrawing = (): void => {
    if (currentStroke && currentStroke.points.length > 0) {
      setStrokes(prev => [...prev, currentStroke]);
    }
    setCurrentStroke(null);
    setIsDrawing(false);
  };

  // Touch events
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>): void => {
    e.preventDefault();
    const touch = e.touches[0];
    if (!touch) return;
    const point = getCanvasPos(touch.clientX, touch.clientY);
    const newStroke: Stroke = {
      points: [point],
      color: penColor,
      width: penSize * 2,
    };
    setCurrentStroke(newStroke);
    setIsDrawing(true);
    setHasDrawn(true);
    setError("");
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>): void => {
    e.preventDefault();
    if (!isDrawing || !currentStroke) return;
    const touch = e.touches[0];
    if (!touch) return;
    const point = getCanvasPos(touch.clientX, touch.clientY);
    const updatedStroke: Stroke = {
      ...currentStroke,
      points: [...currentStroke.points, point],
    };
    setCurrentStroke(updatedStroke);

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    redrawStrokes(ctx, [...strokes, updatedStroke]);
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLCanvasElement>): void => {
    e.preventDefault();
    endDrawing();
  };

  const clearCanvas = (): void => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setStrokes([]);
    setCurrentStroke(null);
    setHasDrawn(false);
    setError("");
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSignatureName(e.target.value);
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setPenColor(e.target.value);
  };

  const handleSizeChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setPenSize(parseInt(e.target.value) || 2);
  };

  const handleUndo = (): void => {
    setStrokes(prev => {
      const updated = [...prev];
      updated.pop();
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (canvas && ctx) {
        redrawStrokes(ctx, updated);
      }
      if (updated.length === 0) {
        setHasDrawn(false);
      }
      return updated;
    });
  };

  const saveSignature = async (): Promise<void> => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (!hasDrawn) {
      setError("Please draw a signature before saving.");
      showToast("Draw a signature first", "info");
      return;
    }

    if (!signatureName.trim()) {
      setError("Please give your signature a name.");
      showToast("Please give your signature a name", "error");
      return;
    }

    try {
      setIsSaving(true);
      const dataUrl = canvas.toDataURL("image/png"); // transparent PNG

      const res = await fetch(dataUrl);
      const blob = await res.blob();

      const cleanName = signatureName.trim().replace(/\.png$/i, "");
      const finalName = `${cleanName}.png`;

      const fileData: FileObject = {
        id: `signature_${Date.now()}`,
        name: finalName,
        type: "image/png",
        size: blob.size,
        url: dataUrl,
        base64: dataUrl,
        dateAdded: new Date().toISOString(),
        isSignature: true,
        processed: true,
        blob, // for IndexedDB persistence
      };

      addFile(fileData);
      clearCanvas();
      setSignatureName("");
      setError("");
      showToast("Signature saved to dashboard", "success");
    } catch (err) {
      console.error("Error saving signature:", err);
      setError("Failed to save signature. Please try again.");
      showToast("Failed to save signature", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-slate-300">
        Create Signature
      </h2>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Main Canvas Area */}
        <div className="md:col-span-2 bg-white p-4 rounded-lg shadow-md">
          <div
            ref={containerRef}
            className="bg-gray-100 border-2 border-slate-400"
          >
            <motion.div
              ref={containerRef}
              className="bg-gray-100 border-2 border-slate-400"
              whileHover={{ scale: 1.01 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
            >
              <canvas
                ref={canvasRef}
                className="w-full h-64 md:h-80 touch-none cursor-crosshair"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={endDrawing}
                onMouseLeave={endDrawing}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              />
            </motion.div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-2 p-2 bg-red-50 text-red-700 rounded-md">
              {error}
            </div>
          )}

          <div className="mb-4 mt-4">
            <label
              htmlFor="signatureName"
              className="block text-lg font-semibold mb-4 text-black"
            >
              Name Your Signature
            </label>
            <input
              type="text"
              value={signatureName}
              onChange={handleNameChange}
              placeholder="e.g. My Signature"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
            />
          </div>

          {/* Canvas Controls */}
          <div className="mt-4 flex flex-wrap gap-4">
            <button
              onClick={clearCanvas}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-slate-800 rounded-lg transition-colors flex-1 sm:flex-none"
            >
              Clear
            </button>
            <button
              onClick={handleUndo}
              disabled={strokes.length === 0}
              className={`px-4 py-2 rounded-lg transition-colors flex-1 sm:flex-none ${
                strokes.length === 0
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white border border-gray-300 text-slate-800 hover:bg-gray-100"
              }`}
            >
              Undo
            </button>
            <button
              onClick={saveSignature}
              disabled={isSaving}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-slate-600 dark:hover:bg-slate-700 text-white rounded-md transition-colors flex-1 sm:flex-none"
            >
              {isSaving ? "Saving..." : "Save Signature"}
            </button>
          </div>

          <DownloadSignature />
        </div>

        {/* Sidebar Controls */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4 text-black">
            Signature Options
          </h3>

          {/* Color Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pen Color:
            </label>
            <div className="flex flex-wrap gap-2">
              {availableColors.map((color: ColorOption) => (
                <button
                  key={color.value}
                  onClick={() => setPenColor(color.value)}
                  className={`w-8 h-8 rounded-full ${
                    penColor === color.value
                      ? "ring-2 ring-offset-2 ring-indigo-500"
                      : ""
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.label}
                  type="button"
                />
              ))}
              <input
                type="color"
                value={penColor}
                onChange={handleColorChange}
                className="w-8 h-8 p-0 border-0 cursor-pointer"
                title="Custom Color"
              />
            </div>
          </div>

          {/* Size Selection */}
          <div className="mb-6">
            <label className="block font-medium text-gray-700 mb-1">
              Pen Size:
            </label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="1"
                max="5"
                step="1"
                value={penSize}
                onChange={handleSizeChange}
                className="w-full"
              />
              <span className="text-black">{penSize}</span>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {availableSizes.map((size: SizeOption) => (
                <button
                  key={size.value}
                  onClick={() => setPenSize(size.value)}
                  className={`px-2 py-1 rounded ${
                    penSize === size.value
                      ? "bg-indigo-400 text-white"
                      : "bg-indigo-100 text-black"
                  }`}
                  type="button"
                >
                  {size.label}
                </button>
              ))}
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-6 text-black bg-indigo-50 rounded-2xl pt-2 pb-2">
            <Image
              src="/paint.svg"
              alt="Upload Files"
              width={100}
              height={100}
              className="mx-auto mb-3 transition-transform duration-300 group-hover:scale-110"
            />{" "}
            <div className="mt-1 px-2 py-1 mb-1">
              <ul className="list-disc pl-5 space-y-1">
                <li>Use your mouse or finger to draw</li>
                <li>Clear button erases everything</li>
                <li>Try different colors and sizes</li>
                <li>Name your signature before saving</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignatureCanvas;
