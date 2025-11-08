// src/components/SignatureCanvas.tsx
"use client";
import React, { useState, useRef, useEffect } from "react";
import { useFileContext } from "@/context/FileContext";
import Image from "next/image";
import { FileObject } from "@/utils/authUtils";
import DownloadSignature from "@/components/DownloadSignature";

// Type definitions
interface ColorOption {
  label: string;
  value: string;
}

interface SizeOption {
  label: string;
  value: number;
}

interface TouchEvent {
  touches: TouchList;
}

interface MouseEvent extends React.MouseEvent {
  clientX: number;
  clientY: number;
}

const SignatureCanvas: React.FC = () => {
  const { addFile } = useFileContext();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [penColor, setPenColor] = useState<string>("#000000");
  const [penSize, setPenSize] = useState<number>(2);
  const [signatureName, setSignatureName] = useState<string>("");
  const [error, setError] = useState<string>("");

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

  useEffect(() => {
    // Initialize canvas
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    // Set canvas size to match its display size
    const resizeCanvas = (): void => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;

      // Set canvas background to white
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, canvas.width, canvas.height);

      // Set line styles
      context.lineJoin = "round";
      context.lineCap = "round";
      context.strokeStyle = penColor;
      context.lineWidth = penSize;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [penColor, penSize]);

  useEffect(() => {
    // Update pen color and size when changed
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    context.strokeStyle = penColor;
    context.lineWidth = penSize * 2; // Multiply by 2 for better visibility
  }, [penColor, penSize]);

  const getEventPosition = (
    e: MouseEvent | TouchEvent
  ): { x: number; y: number } => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    let clientX: number;
    let clientY: number;

    if ("touches" in e) {
      // Touch event
      clientX = e.touches[0]?.clientX || 0;
      clientY = e.touches[0]?.clientY || 0;
    } else {
      // Mouse event
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const startDrawing = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ): void => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const { x, y } = getEventPosition(e as MouseEvent | TouchEvent);

    context.beginPath();
    context.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ): void => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const { x, y } = getEventPosition(e as MouseEvent | TouchEvent);

    context.lineTo(x, y);
    context.stroke();
  };

  const stopDrawing = (): void => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    context.closePath();
    setIsDrawing(false);
  };

  const clearCanvas = (): void => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    // Fill with white background
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSignatureName(e.target.value);
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setPenColor(e.target.value);
  };

  const handleSizeChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setPenSize(parseInt(e.target.value));
  };

  const saveSignature = (): void => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    const imageData = context.getImageData(
      0,
      0,
      canvas.width,
      canvas.height
    ).data;
    let isEmpty = true;

    for (let i = 3; i < imageData.length; i += 4) {
      if (
        imageData[i - 3] !== 255 ||
        imageData[i - 2] !== 255 ||
        imageData[i - 1] !== 255
      ) {
        isEmpty = false;
        break;
      }
    }

    if (isEmpty) {
      setError("Please draw a signature before saving.");
      return;
    }

    if (!signatureName.trim()) {
      setError("Please give your signature a name.");
      return;
    }

    try {
      const base64Image = canvas.toDataURL("image/png");

      // Fix: Create proper FileObject
      const fileData: FileObject = {
        id: `${Date.now()}`,
        name: `${signatureName.trim()}.png`,
        type: "image/png",
        size: Math.round(base64Image.length * 0.75),
        url: base64Image,
        base64: base64Image,
        dateAdded: new Date().toISOString(),
        isSignature: true,
        processed: true,
      };

      addFile(fileData);
      clearCanvas();
      setSignatureName("");
      setError("");

      const successMessage = document.getElementById("success-message");
      if (successMessage) {
        successMessage.classList.remove("hidden");
        setTimeout(() => {
          successMessage.classList.add("hidden");
        }, 3000);
      }
    } catch (err) {
      console.error("Error saving signature:", err);
      setError("Failed to save signature. Please try again.");
    }
  };
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;

    const resizeCanvas = () => {
      // We store the current canvas content, resize, and then restore it
      const currentDrawing = canvas.toDataURL();
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight > 250 ? 250 : parent.clientHeight; // Set a max-height or use parent's

      const ctx = canvas.getContext("2d");
      if (ctx) {
        const img = new window.Image();
        img.src = currentDrawing;
        img.onload = () => {
          ctx.drawImage(img, 0, 0);
        };
      }
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, []);

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-slate-300">
        Create Signature
      </h2>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Main Canvas Area */}
        <div className="md:col-span-2 bg-white p-4 rounded-lg shadow-md">
          <div className="bg-gray-100 border-2 border-slate-400 ">
            <canvas
              ref={canvasRef}
              className="w-full h-64 md:h-80 touch-none cursor-crosshair "
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
            />
          </div>

          {/* Success Message */}
          <div
            id="success-message"
            className="mt-2 p-2 bg-green-50 text-green-700 rounded-md hidden"
          >
            Signature saved successfully!
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-2 p-2 bg-red-50 text-red-700 rounded-md">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label
              htmlFor="signatureName"
              className="block text-lg font-semibold mb-4 text-black  "
            >
              Name Your Signature
            </label>
            <input
              type="text"
              value={signatureName}
              onChange={handleNameChange}
              placeholder="e.g. My Signature"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800
              font-stretch-condensed"
            />
          </div>

          {/* Canvas Controls */}
          <div className="mt-4 flex flex-wrap gap-4">
            <button
              onClick={clearCanvas}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-slate-800 rounded-lg transition-colors flex-1 sm:flex-none "
            >
              Clear
            </button>
            <button
              onClick={saveSignature}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-slate-600 dark:hover:bg-slate-700 text-white rounded-md transition-colors flex-1 sm:flex-none "
            >
              Save Signature
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
          <div className="mt-6 text-black bg-indigo-50 rounded-2xl object-contain pt-2 pb-2">
            <Image
              src={"paint.svg"}
              alt="Upload Files"
              width={100}
              height={100}
              className="mx-auto mb-3 transition-transform duration-300 group-hover:scale-110 "
            />
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
