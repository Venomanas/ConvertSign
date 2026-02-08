"use client";

import React, { useState, useRef, useCallback } from "react";
import { PDFDocument } from "pdf-lib";
import { motion, AnimatePresence } from "framer-motion";
import PageTransition from "@/components/PageTransition";
import Animatedbutton from "@/components/Animatedbutton";
import { useToast } from "@/context/ToastContext";
import {
  DocumentIcon,
  PhotoIcon,
  ArrowDownTrayIcon,
  ArrowPathIcon,
  TrashIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";

interface ImageFile {
  id: string;
  name: string;
  dataUrl: string;
  width: number;
  height: number;
}

const ImageToPdf: React.FC = () => {
  const { showToast } = useToast();
  const [images, setImages] = useState<ImageFile[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = event.target.files;
    if (!files) return;

    const newImages: ImageFile[] = [];

    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) {
        showToast(`${file.name} is not an image`, "error");
        continue;
      }

      const dataUrl = await new Promise<string>(resolve => {
        const reader = new FileReader();
        reader.onload = e => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      });

      // Get image dimensions
      const img = new Image();
      await new Promise<void>(resolve => {
        img.onload = () => resolve();
        img.src = dataUrl;
      });

      newImages.push({
        id: `${file.name}-${Date.now()}-${Math.random()}`,
        name: file.name,
        dataUrl,
        width: img.width,
        height: img.height,
      });
    }

    if (newImages.length > 0) {
      setImages(prev => [...prev, ...newImages]);
      setPdfUrl(null);
      showToast(`Added ${newImages.length} image(s)`, "success");
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
    setPdfUrl(null);
  };

  const convertToPdf = useCallback(async () => {
    if (images.length === 0) {
      showToast("Please add at least one image", "error");
      return;
    }

    setIsConverting(true);

    try {
      const pdfDoc = await PDFDocument.create();

      for (const imageFile of images) {
        // Fetch image bytes
        const imageBytes = await fetch(imageFile.dataUrl).then(res =>
          res.arrayBuffer(),
        );

        let image;
        if (imageFile.dataUrl.includes("image/png")) {
          image = await pdfDoc.embedPng(imageBytes);
        } else {
          image = await pdfDoc.embedJpg(imageBytes);
        }

        const page = pdfDoc.addPage([image.width, image.height]);
        page.drawImage(image, {
          x: 0,
          y: 0,
          width: image.width,
          height: image.height,
        });
      }

      const pdfBytes = await pdfDoc.save();
      const arrayBuffer = new ArrayBuffer(pdfBytes.length);
      new Uint8Array(arrayBuffer).set(pdfBytes);
      const blob = new Blob([arrayBuffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
      showToast("PDF created successfully!", "success");
    } catch (error) {
      console.error("Conversion error:", error);
      showToast("Failed to create PDF", "error");
    } finally {
      setIsConverting(false);
    }
  }, [images, showToast]);

  const downloadPdf = () => {
    if (!pdfUrl) return;
    const link = document.createElement("a");
    link.download = `images-${Date.now()}.pdf`;
    link.href = pdfUrl;
    link.click();
    showToast("PDF downloaded!", "success");
  };

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl mb-4">
            <DocumentIcon className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Image To PDF
          </h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            Convert images to PDF document
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            className="hidden"
          />

          <Animatedbutton
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-4 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl hover:border-indigo-400 transition-colors flex items-center justify-center gap-2 mb-6"
          >
            <PlusIcon className="w-6 h-6" />
            Add Images
          </Animatedbutton>

          {images.length > 0 && (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6">
                <AnimatePresence>
                  {images.map(img => (
                    <motion.div
                      key={img.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="relative group"
                    >
                      <img
                        src={img.dataUrl}
                        alt={img.name}
                        className="w-full h-24 object-cover rounded-xl border border-slate-200 dark:border-slate-700"
                      />
                      <button
                        onClick={() => removeImage(img.id)}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <div className="flex flex-wrap gap-3 justify-center">
                <Animatedbutton
                  onClick={convertToPdf}
                  disabled={isConverting}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold rounded-xl flex items-center gap-2"
                >
                  {isConverting ? (
                    <>
                      <ArrowPathIcon className="w-5 h-5 animate-spin" />
                      Converting...
                    </>
                  ) : (
                    <>
                      <DocumentIcon className="w-5 h-5" />
                      Convert to PDF
                    </>
                  )}
                </Animatedbutton>

                {pdfUrl && (
                  <Animatedbutton
                    onClick={downloadPdf}
                    className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl flex items-center gap-2"
                  >
                    <ArrowDownTrayIcon className="w-5 h-5" />
                    Download PDF
                  </Animatedbutton>
                )}
              </div>
            </>
          )}

          {images.length === 0 && (
            <div className="text-center py-8">
              <PhotoIcon className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <p className="text-slate-500 dark:text-slate-400">
                No images added yet
              </p>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
};

export default ImageToPdf;
