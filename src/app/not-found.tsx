"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

const quickLinks = [
  { href: "/dashboard", label: "📂 Explore All Tools" },
  { href: "/background-remover", label: "✨ Background Remover" },
  { href: "/signature", label: "✍️ Create Signature" },
  { href: "/pdf-compress", label: "📄 PDF Compressor" },
  { href: "/pricing", label: "💰 Pricing" },
];

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16 bg-slate-50 dark:bg-slate-950">
      {/* Animated 404 */}
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="text-center mb-10"
      >
        {/* Large 404 */}
        <div className="relative inline-block mb-6">
          <span
            className="text-[120px] sm:text-[160px] font-black leading-none select-none"
            style={{
              background:
                "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            404
          </span>
          {/* Floating emoji */}
          <motion.span
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
            className="absolute -top-4 -right-6 text-4xl"
          >
            🔍
          </motion.span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white mb-3">
          Page not found
        </h1>
        <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-8">
          The page you&apos;re looking for doesn&apos;t exist or was moved. But
          your files are safe — head back to our tools!
        </p>

        {/* Primary CTA */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10">
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => router.back()}
            className="px-6 py-3 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold rounded-xl hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
          >
            ← Go Back
          </motion.button>
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
            <Link
              href="/dashboard"
              className="inline-block px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors shadow-md"
            >
              Go to Dashboard
            </Link>
          </motion.div>
        </div>

        {/* Quick links */}
        <div className="max-w-sm mx-auto">
          <p className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-3 font-medium">
            Popular Tools
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {quickLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-1.5 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 hover:border-indigo-300 dark:hover:border-indigo-700 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Branding */}
      <p className="text-xs text-slate-400 dark:text-slate-600">
        ConvertSign — Free in-browser document tools
      </p>
    </div>
  );
}
