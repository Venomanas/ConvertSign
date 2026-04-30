<div align="center">

# ✍️ ConSo

A web app with multiple features for your document related work 

[![Deploy with Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=flat-square&logo=vercel)](https://convertsign.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

[🚀 **Live App**](https://convertsign.vercel.app)

</div>

---

## ✨ Features

### 📄 PDF Tools
- **PDF Compress** — Reduce file size without quality loss
- **PDF Split** — Split multi-page PDFs into individual pages
- **Merge PDF** — Combine multiple PDFs into one
- **PDF → Word/JPG/Text/Excel** — Extract content and convert formats

### 🖼️ Image Tools
- **Background Remover** — AI-powered removal (WebAssembly)
- **Image Compressor** — Reduce size with quality control
- **Crop & Rotate** — Basic image transformations
- **Watermark Adder** — Add tiled text watermarks
- **Color Picker** — Extract HEX/RGB/HSL from pixels
- **Image Translator** — Detect and translate text in images

### ✍️ Signature
- Draw with mouse or touch
- Type with 7 professional fonts
- Optional date stamp
- Place signature on any image

### 🔧 Converters
- JPG ↔ Word, JPG ↔ Excel, Word ↔ PDF, HTML → PDF
- Text → Image, Text → Word, Image → Text (OCR)

### 📱 QR & Barcode
- Generate custom QR codes (PNG)
- Scan QR codes from image or webcam
- Scan barcodes (EAN, UPC, Code 128)

### 💡 Platform Features
- **PWA** — Installable, works offline
- **Dark Mode** — System-aware
- **Privacy-first** — Files never leave your device

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| Next.js 16 | Framework |
| TypeScript 5 | Language |
| Tailwind CSS v4 | Styling |
| pdf-lib | PDF processing |
| Tesseract.js | OCR |
| @imgly/background-removal | AI background removal |
| Firebase | Authentication |
| Vercel | Deployment |

---

## 🚀 Quick Start

```bash
# Clone repository
git clone https://github.com/Venomanas/ConvertSign.git
cd ConvertSign/my-app

# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# Add Firebase credentials

# Run development server
npm run dev