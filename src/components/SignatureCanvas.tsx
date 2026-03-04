// src/components/SignatureCanvas.tsx
"use client";

import React, { useState, useRef, useEffect } from "react";
import { useFileContext } from "@/context/FileContext";
import Image from "next/image";
import { FileObject } from "@/utils/authUtils";
import DownloadSignature from "@/components/DownloadSignature";
import { useToast } from "@/context/ToastContext";
import { motion, AnimatePresence } from "framer-motion";
import Animatedbutton from "./Animatedbutton";
import { useSound } from "@/hooks/useSound";
import {
  PencilSquareIcon,
  TrashIcon,
  ArrowDownTrayIcon,
  ArrowUturnLeftIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

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
type SignMode = "draw" | "type";

const FONT_OPTIONS = [
  { label: "Cursive", css: "'Dancing Script', cursive" },
  { label: "Elegant", css: "'Great Vibes', cursive" },
  { label: "Bold", css: "'Caveat', cursive" },
  { label: "Classic", css: "Georgia, serif" },
  { label: "Script", css: "'Pacifico', cursive" },
  { label: "Monoline", css: "'Satisfy', cursive" },
  { label: "Print", css: "'Roboto', sans-serif" },
];

const BG_OPTIONS = [
  { label: "Clear", value: "transparent" },
  { label: "White", value: "#ffffff" },
  { label: "Lined", value: "lined" },
  { label: "Grid", value: "grid" },
];

const SignatureCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [mode, setMode] = useState<SignMode>("draw");
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [penColor, setPenColor] = useState<string>("#000000");
  const [penSize, setPenSize] = useState<number>(2);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<Stroke | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [signatureName, setSignatureName] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [hasDrawn, setHasDrawn] = useState(false);
  const [bgStyle, setBgStyle] = useState("transparent");

  // Typed mode state
  const [typedText, setTypedText] = useState("");
  const [selectedFont, setSelectedFont] = useState(FONT_OPTIONS[0].css);
  const [showDateStamp, setShowDateStamp] = useState(false);

  const { addFile, files } = useFileContext();
  const { showToast } = useToast();
  const { play } = useSound();

  // Saved signatures list
  const savedSignatures = files.filter(f => f.isSignature);

  // Available colors for the signature pen
  const availableColors: ColorOption[] = [
    { label: "Black", value: "#000000" },
    { label: "Blue", value: "#0000ff" },
    { label: "Red", value: "#ff0000" },
    { label: "Green", value: "#008000" },
  ];

  // Available pen sizes
  const availableSizes: SizeOption[] = [
    { label: "S", value: 1 },
    { label: "M", value: 2 },
    { label: "L", value: 3 },
    { label: "XL", value: 4 },
  ];

  // Draw background pattern on canvas
  const drawBackground = (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
  ) => {
    ctx.clearRect(0, 0, w, h);
    if (bgStyle === "white" || bgStyle === "#ffffff") {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, w, h);
    } else if (bgStyle === "lined") {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = "#e2e8f0";
      ctx.lineWidth = 1;
      const spacing = 30;
      for (let y = spacing; y < h; y += spacing) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }
    } else if (bgStyle === "grid") {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = "#e2e8f0";
      ctx.lineWidth = 1;
      const spacing = 24;
      for (let x = 0; x < w; x += spacing) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += spacing) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }
    }
    // transparent = no fill, will save with alpha channel
  };

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
      drawBackground(ctx, rect.width, rect.height || 300);
      redrawStrokes(ctx, strokes);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [strokes, bgStyle]);

  // Re-render typed text preview on canvas
  useEffect(() => {
    if (mode !== "type") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const w = parseInt(canvas.style.width);
    const h = parseInt(canvas.style.height);
    drawBackground(ctx, w, h);
    if (typedText) {
      const fontSize = Math.max(
        36,
        Math.min(64, (w / Math.max(typedText.length, 1)) * 1.5),
      );
      ctx.font = `${fontSize}px ${selectedFont}`;
      ctx.fillStyle = penColor;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const textY = showDateStamp ? h / 2 - 18 : h / 2;
      ctx.fillText(typedText, w / 2, textY);
      if (showDateStamp) {
        const stamp = new Date().toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
        ctx.font = `14px 'Roboto', sans-serif`;
        ctx.fillStyle = penColor;
        ctx.globalAlpha = 0.6;
        ctx.fillText(stamp, w / 2, textY + fontSize / 2 + 18);
        ctx.globalAlpha = 1;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typedText, selectedFont, penColor, mode, bgStyle, showDateStamp]);

  const redrawStrokes = (
    ctx: CanvasRenderingContext2D,
    allStrokes: Stroke[],
  ) => {
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
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>): void => {
    e.preventDefault();
    if (mode !== "draw") return;
    const point = getCanvasPos(e.clientX, e.clientY);
    setCurrentStroke({ points: [point], color: penColor, width: penSize * 2 });
    setIsDrawing(true);
    setHasDrawn(true);
    setError("");
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>): void => {
    if (!isDrawing || !currentStroke || mode !== "draw") return;
    const point = getCanvasPos(e.clientX, e.clientY);
    const updatedStroke = {
      ...currentStroke,
      points: [...currentStroke.points, point],
    };
    setCurrentStroke(updatedStroke);

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const w = parseInt(canvas.style.width);
    const h = parseInt(canvas.style.height);
    drawBackground(ctx, w, h);
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
    if (mode !== "draw") return;
    const touch = e.touches[0];
    if (!touch) return;
    const point = getCanvasPos(touch.clientX, touch.clientY);
    setCurrentStroke({ points: [point], color: penColor, width: penSize * 2 });
    setIsDrawing(true);
    setHasDrawn(true);
    setError("");
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>): void => {
    e.preventDefault();
    if (!isDrawing || !currentStroke || mode !== "draw") return;
    const touch = e.touches[0];
    if (!touch) return;
    const point = getCanvasPos(touch.clientX, touch.clientY);
    const updatedStroke = {
      ...currentStroke,
      points: [...currentStroke.points, point],
    };
    setCurrentStroke(updatedStroke);

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const w = parseInt(canvas.style.width);
    const h = parseInt(canvas.style.height);
    drawBackground(ctx, w, h);
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
    const w = parseInt(canvas.style.width);
    const h = parseInt(canvas.style.height);
    drawBackground(ctx, w, h);
    setStrokes([]);
    setCurrentStroke(null);
    setHasDrawn(false);
    setTypedText("");
    setError("");
  };

  const handleUndo = (): void => {
    setStrokes(prev => {
      const updated = [...prev];
      updated.pop();
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (canvas && ctx) {
        const w = parseInt(canvas.style.width);
        const h = parseInt(canvas.style.height);
        drawBackground(ctx, w, h);
        redrawStrokes(ctx, updated);
      }
      if (updated.length === 0) setHasDrawn(false);
      return updated;
    });
  };

  const saveSignature = async (): Promise<void> => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const isTypedEmpty = mode === "type" && !typedText.trim();
    const isDrawEmpty = mode === "draw" && !hasDrawn;

    if (isDrawEmpty || isTypedEmpty) {
      const msg =
        mode === "type"
          ? "Type your name to create a signature."
          : "Please draw a signature before saving.";
      setError(msg);
      showToast(msg, "info");
      return;
    }

    if (!signatureName.trim()) {
      setError("Please give your signature a name.");
      showToast("Please give your signature a name", "error");
      return;
    }

    try {
      setIsSaving(true);
      const dataUrl = canvas.toDataURL("image/png");
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
        blob,
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
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-center gap-3 mb-8">
        <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl">
          <PencilSquareIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-slate-200">
          Create Signature
        </h2>
      </div>

      {/* Mode Switcher */}
      <div className="flex justify-center mb-6">
        <div className="inline-flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl gap-1">
          {(["draw", "type"] as SignMode[]).map(m => (
            <Animatedbutton
              key={m}
              onClick={() => {
                setMode(m);
                clearCanvas();
                setError("");
              }}
              soundType="toggle"
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                mode === m
                  ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              }`}
            >
              {m === "draw" ? "✏️ Draw" : "⌨️ Type"}
            </Animatedbutton>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Main Canvas Area */}
        <div className="md:col-span-2 space-y-4">
          <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
            {/* Canvas */}
            <div
              ref={containerRef}
              className={`relative rounded-xl border-2 border-dashed overflow-hidden ${
                bgStyle === "transparent"
                  ? "border-slate-300 dark:border-slate-600"
                  : "border-slate-200 dark:border-slate-600"
              }`}
              style={{
                background:
                  bgStyle === "transparent"
                    ? "repeating-conic-gradient(#e2e8f0 0% 25%, white 0% 50%) 0 0 / 16px 16px"
                    : "",
              }}
            >
              <canvas
                ref={canvasRef}
                className="w-full h-64 md:h-72 touch-none cursor-crosshair"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={endDrawing}
                onMouseLeave={endDrawing}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              />
              {/* Placeholder hint overlaid on empty canvas */}
              {!hasDrawn && typedText === "" && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <p className="text-slate-300 dark:text-slate-600 text-sm font-medium select-none">
                    {mode === "draw"
                      ? "Draw your signature here…"
                      : "Type your name below to preview"}
                  </p>
                </div>
              )}
            </div>

            {/* Type mode input */}
            <AnimatePresence>
              {mode === "type" && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="mt-3"
                >
                  <input
                    type="text"
                    value={typedText}
                    onChange={e => setTypedText(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    style={{ fontFamily: selectedFont, fontSize: "1.3rem" }}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error Message */}
            {error && (
              <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-xl flex items-center gap-2 text-sm">
                <XMarkIcon className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            {/* Name field */}
            <div className="mt-4">
              <label
                htmlFor="signatureName"
                className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300"
              >
                Signature Name
              </label>
              <input
                id="signatureName"
                type="text"
                value={signatureName}
                onChange={e => setSignatureName(e.target.value)}
                placeholder="e.g. My Signature"
                className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              />
            </div>

            {/* Canvas Controls */}
            <div className="mt-4 flex flex-wrap gap-2">
              {mode === "draw" && (
                <>
                  <Animatedbutton
                    onClick={clearCanvas}
                    soundType="clear"
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-medium transition-colors flex items-center gap-1.5"
                  >
                    <XMarkIcon className="w-4 h-4" /> Clear
                  </Animatedbutton>
                  <Animatedbutton
                    onClick={handleUndo}
                    disabled={strokes.length === 0}
                    soundType="deselect"
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-1.5 ${
                      strokes.length === 0
                        ? "bg-slate-50 dark:bg-slate-800 text-slate-300 dark:text-slate-600 cursor-not-allowed"
                        : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600"
                    }`}
                  >
                    <ArrowUturnLeftIcon className="w-4 h-4" /> Undo
                  </Animatedbutton>
                </>
              )}
              <Animatedbutton
                onClick={saveSignature}
                disabled={isSaving}
                soundType="save"
                className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white rounded-xl text-sm font-bold transition-colors shadow-sm shadow-indigo-200 dark:shadow-none flex items-center justify-center gap-2"
              >
                <PencilSquareIcon className="w-4 h-4" />
                {isSaving ? "Saving…" : "Save Signature"}
              </Animatedbutton>
            </div>

            <DownloadSignature />
          </div>
        </div>

        {/* Sidebar Controls */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-4 uppercase tracking-wide">
              Options
            </h3>

            {/* Color Selection */}
            <div className="mb-5">
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">
                Color
              </label>
              <div className="flex flex-wrap gap-2 items-center">
                {availableColors.map(color => (
                  <button
                    key={color.value}
                    onClick={() => {
                      setPenColor(color.value);
                      play("select");
                    }}
                    className={`w-8 h-8 rounded-full transition-all ${
                      penColor === color.value
                        ? "ring-2 ring-offset-2 ring-indigo-500 scale-110"
                        : "hover:scale-105"
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.label}
                    type="button"
                  />
                ))}
                <input
                  type="color"
                  value={penColor}
                  onChange={e => {
                    setPenColor(e.target.value);
                    play("select");
                  }}
                  className="w-8 h-8 p-0 border-0 cursor-pointer rounded-full overflow-hidden"
                  title="Custom Color"
                />
              </div>
            </div>

            {/* Draw mode: pen size */}
            {mode === "draw" && (
              <div className="mb-5">
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">
                  Pen Size
                </label>
                <div className="flex gap-2">
                  {availableSizes.map(size => (
                    <Animatedbutton
                      key={size.value}
                      onClick={() => setPenSize(size.value)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                        penSize === size.value
                          ? "bg-indigo-600 text-white"
                          : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                      }`}
                      type="button"
                    >
                      {size.label}
                    </Animatedbutton>
                  ))}
                </div>
              </div>
            )}

            {/* Type mode: font picker */}
            {mode === "type" && (
              <div className="mb-5">
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">
                  Font Style
                </label>
                <div className="flex flex-col gap-2">
                  {FONT_OPTIONS.map(f => (
                    <Animatedbutton
                      key={f.css}
                      onClick={() => setSelectedFont(f.css)}
                      className={`px-3 py-2 rounded-xl text-left text-sm transition-all ${
                        selectedFont === f.css
                          ? "bg-indigo-50 dark:bg-indigo-900/30 border-2 border-indigo-400 text-indigo-700 dark:text-indigo-300"
                          : "bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600"
                      }`}
                      style={{ fontFamily: f.css }}
                    >
                      {f.label}
                    </Animatedbutton>
                  ))}
                </div>
                {/* Date Stamp toggle */}
                <div className="mt-3 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowDateStamp(s => !s)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                      showDateStamp
                        ? "bg-indigo-600"
                        : "bg-slate-300 dark:bg-slate-600"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm transform transition-transform ${
                        showDateStamp ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </button>
                  <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                    Add date stamp
                  </span>
                </div>
              </div>
            )}

            {/* Background Style */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">
                Canvas Background
              </label>
              <div className="grid grid-cols-2 gap-2">
                {BG_OPTIONS.map(opt => (
                  <Animatedbutton
                    key={opt.value}
                    onClick={() => setBgStyle(opt.value)}
                    className={`py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      bgStyle === opt.value
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                    }`}
                  >
                    {opt.label}
                  </Animatedbutton>
                ))}
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-900/40">
            <Image
              src="/paint.svg"
              alt="Draw"
              width={80}
              height={80}
              className="mx-auto mb-3"
            />
            <ul className="text-xs text-indigo-700 dark:text-indigo-300 space-y-1.5 list-disc pl-4">
              {mode === "draw" ? (
                <>
                  <li>Draw with mouse or finger</li>
                  <li>Use Undo to remove last stroke</li>
                  <li>Pick any color or size</li>
                  <li>Name it before saving</li>
                </>
              ) : (
                <>
                  <li>Type your name in the field</li>
                  <li>Choose a font style</li>
                  <li>Pick a color for the text</li>
                  <li>Name it then save</li>
                </>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Saved Signatures Gallery */}
      {savedSignatures.length > 0 && (
        <div className="mt-10">
          <div className="flex items-center gap-2 mb-4">
            <PencilSquareIcon className="w-5 h-5 text-purple-500" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
              Saved Signatures
            </h3>
            <span className="ml-1 text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 font-bold px-2 py-0.5 rounded-full">
              {savedSignatures.length}
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            <AnimatePresence>
              {savedSignatures.map(sig => (
                <motion.div
                  key={sig.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="group relative bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-md transition-all"
                >
                  <div
                    className="h-24 flex items-center justify-center p-3"
                    style={{
                      background:
                        "repeating-conic-gradient(#f1f5f9 0% 25%, white 0% 50%) 0 0 / 12px 12px",
                    }}
                  >
                    {(sig.base64 || sig.url) && (
                      <img
                        src={sig.base64 || sig.url}
                        alt={sig.name}
                        className="max-h-full max-w-full object-contain"
                      />
                    )}
                  </div>
                  <div className="px-3 py-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-700">
                    <p
                      className="text-xs font-semibold text-slate-600 dark:text-slate-300 truncate max-w-[80px]"
                      title={sig.name}
                    >
                      {sig.name.replace(".png", "")}
                    </p>
                    <a
                      href={sig.base64 || sig.url}
                      download={sig.name}
                      className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
                      title="Download"
                    >
                      <ArrowDownTrayIcon className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignatureCanvas;
