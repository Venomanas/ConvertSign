<div align="center">

# ✍️ ConSo

### Free In-Browser Document & Image Tools

[![Deploy with Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=flat-square&logo=vercel)](https://convertsign.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-brightgreen?style=flat-square)](https://github.com/Venomanas/ConvertSign/pulls)

**40+ free, privacy-first document and image tools — powered entirely by your browser.**  
No file uploads. No servers. No sign-up. Everything runs locally.

[🚀 **Live App**](https://convertsign.vercel.app) · [📂 Dashboard](https://convertsign.vercel.app/dashboard) · [💰 Pricing](https://convertsign.vercel.app/pricing)

</div>

---

## ✨ Features

### 📄 PDF Tools

| Tool             | Description                                 |
| ---------------- | ------------------------------------------- |
| **PDF Compress** | Reduce PDF file size without quality loss   |
| **PDF Split**    | Split multi-page PDFs into individual pages |
| **Merge PDF**    | Combine multiple PDFs into one              |
| **PDF → Word**   | Extract content from PDFs                   |
| **PDF → JPG**    | Convert PDF pages to images                 |
| **PDF → Text**   | Extract all text from PDFs (OCR)            |
| **PDF → Excel**  | Pull table data from PDFs                   |

### 🖼️ Image Tools

| Tool                   | Description                                 |
| ---------------------- | ------------------------------------------- |
| **Background Remover** | AI-powered background removal (WebAssembly) |
| **Image Compressor**   | Reduce image size with quality slider       |
| **Crop & Rotate**      | Crop, rotate, and flip images               |
| **Watermark Adder**    | Add tiled text watermarks                   |
| **Color Picker**       | Click pixels to extract HEX/RGB/HSL         |
| **Invert Image**       | Create negative-effect images               |
| **Image Resize**       | Resize to exact dimensions                  |
| **Image Translator**   | Detect & translate text in images           |

### ✍️ Signature

| Tool               | Description                             |
| ------------------ | --------------------------------------- |
| **Draw Signature** | Draw with mouse or touch                |
| **Type Signature** | 7 professional font styles              |
| **Date Stamp**     | Optional date stamp on typed signatures |
| **Sign Image**     | Place signature on any image            |

### 🔧 Other Converters

- JPG ↔ Word, JPG ↔ Excel, Word ↔ PDF, HTML → PDF
- Text → Image, Text → Word, Image → Text (OCR)

### 📱 QR & Barcode

- **QR Generator** — custom QR codes, download as PNG
- **QR Scanner** — scan from image or webcam
- **Barcode Scanner** — EAN, UPC, Code 128 and more

### 💡 Platform

- ✅ **PWA** — installable on desktop/mobile, works offline
- ✅ **Dark Mode** — full system-aware dark mode
- ✅ **Privacy-first** — files never leave your device
- ✅ **SEO** — sitemap.xml, robots.txt, per-tool metadata, OG cards

---

## 🛠️ Tech Stack

| Layer                 | Technology                             |
| --------------------- | -------------------------------------- |
| Framework             | **Next.js 16** (App Router)            |
| Language              | **TypeScript 5**                       |
| Styling               | **Tailwind CSS v4**                    |
| Animation             | **Framer Motion**                      |
| PDF                   | **pdf-lib** (in-browser, zero backend) |
| OCR                   | **Tesseract.js**                       |
| AI Background Removal | **@imgly/background-removal** (WASM)   |
| Icons                 | **Heroicons + react-icons**            |
| Auth                  | **Firebase**                           |
| Deployment            | **Vercel**                             |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm / yarn / pnpm

### Installation

```bash
# Clone the repo
git clone https://github.com/Venomanas/ConvertSign.git
cd ConvertSign/my-app

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local
# Add your Firebase credentials to .env.local

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Build for Production

```bash
npm run build
npm start
```

---

## 📁 Project Structure

```
src/
├── app/
│   ├── (main)/           # All tool pages (40+ routes)
│   │   ├── dashboard/    # Main tool grid
│   │   ├── background-remover/
│   │   ├── pdf-compress/
│   │   ├── pdf-split/
│   │   ├── image-compressor/
│   │   ├── color-picker/
│   │   ├── watermark/
│   │   ├── crop-rotate/
│   │   ├── signature/
│   │   ├── pricing/
│   │   └── ...
│   ├── layout.tsx        # Root layout with OG meta, PWA, fonts
│   ├── sitemap.ts        # Auto-generated sitemap.xml
│   ├── robots.ts         # Auto-generated robots.txt
│   └── not-found.tsx     # Branded 404 page
├── components/
│   ├── SignatureCanvas.tsx  # Draw/type signature component
│   ├── Header.tsx
│   ├── Footer.tsx
│   └── ...
├── lib/
│   └── toolMeta.ts       # Per-tool SEO metadata
└── public/
    ├── manifest.json     # PWA manifest
    ├── sw.js             # Service worker
    ├── og-image.png      # Open Graph social preview
    ├── icon-192.png
    └── icon-512.png
```

---

## 🔒 Privacy

**ConvertSign is built with privacy first:**

- All PDF operations use [pdf-lib](https://pdf-lib.js.org/) — runs entirely in WebAssembly in your browser
- Image processing uses the Canvas API — no server roundtrips
- Background removal uses [@imgly/background-removal](https://github.com/imgly/background-removal-js) — WASM AI model, fully client-side
- OCR uses [Tesseract.js](https://tesseract.projectnaptha.com/) — in-browser
- **Zero files are ever transmitted to any server**

---

## 🗺️ Roadmap

- [ ] Stripe integration for Pro tier
- [ ] PDF Rotate / Crop
- [ ] Multi-page PDF signing
- [ ] Audio → Text (Whisper API)
- [ ] i18n support (Hindi, Spanish, Arabic)
- [ ] AI Document Q&A (GPT-4 + pdf-lib)

See the full [roadmap](./brain/convertsign_roadmap.md).

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repo
2. Create a feature branch: `git checkout -b feat/my-feature`
3. Commit your changes: `git commit -m "feat: add my feature"`
4. Push: `git push origin feat/my-feature`
5. Open a Pull Request

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">

Built with ❤️ by [@Venomanas](https://github.com/Venomanas)

⭐ If ConvertSign saved you time, please star the repo!

</div>
