/**
 * Tool metadata for SEO — title and description per route.
 * Used in the root layout's <head> via Next.js metadata API
 * and as fallback for JSON-LD structured data.
 */
export const toolMeta: Record<string, { title: string; description: string }> =
  {
    "/background-remover": {
      title: "Background Remover — Free AI Tool | ConvertSign",
      description:
        "Remove image backgrounds instantly with AI. 100% in-browser, no upload, no API key. Download transparent PNG for free.",
    },
    "/pdf-compress": {
      title: "PDF Compressor — Reduce PDF Size Free | ConvertSign",
      description:
        "Reduce PDF file size without losing quality. Fully in-browser compression using pdf-lib. No upload, completely private.",
    },
    "/image-compressor": {
      title: "Image Compressor — Compress JPG & PNG Free | ConvertSign",
      description:
        "Compress images online with adjustable quality. Reduce file size for JPG, PNG, WebP — 100% in-browser and free.",
    },
    "/pdf-split": {
      title: "PDF Splitter — Split PDF Pages Free | ConvertSign",
      description:
        "Split a multi-page PDF into individual pages instantly. No upload, works in-browser. Download all pages or one by one.",
    },
    "/watermark": {
      title: "Watermark Adder — Add Text to Images Free | ConvertSign",
      description:
        "Add custom text watermarks to images. Control opacity, angle, size and color. Live preview — 100% private.",
    },
    "/pdf-to-word": {
      title: "PDF to Word Converter — Free Online | ConvertSign",
      description:
        "Convert PDF documents to editable Word format free. Extract text and structure from any PDF file.",
    },
    "/pdf-to-jpg": {
      title: "PDF to JPG Converter — Free Online | ConvertSign",
      description:
        "Convert every PDF page to a JPG image instantly. Free, no watermark, no sign-up required.",
    },
    "/pdf-to-text": {
      title: "PDF to Text Extractor — Free Online | ConvertSign",
      description:
        "Extract all text content from any PDF file in seconds. Fully in-browser, private, and free.",
    },
    "/pdf-to-excel": {
      title: "PDF to Excel Converter — Free Online | ConvertSign",
      description:
        "Convert PDF tables and data into Excel spreadsheets. Free tool, no registration needed.",
    },
    "/image-to-text": {
      title: "Image to Text (OCR) — Free Online | ConvertSign",
      description:
        "Extract text from images using OCR. Supports JPG, PNG, WebP — powered by Tesseract.js in your browser.",
    },
    "/image-to-pdf": {
      title: "Image to PDF Converter — Free Online | ConvertSign",
      description:
        "Convert JPG, PNG or any image to a PDF file instantly. In-browser, no upload, completely free.",
    },
    "/word-to-pdf": {
      title: "Word to PDF Converter — Free Online | ConvertSign",
      description:
        "Convert Word documents (DOCX) to PDF format free. Instant conversion, no file upload required.",
    },
    "/jpg-to-word": {
      title: "JPG to Word Converter — Free Online | ConvertSign",
      description:
        "Convert JPG images to editable Word documents using OCR. Free and private — runs entirely in your browser.",
    },
    "/jpg-to-excel": {
      title: "JPG to Excel Converter — Free Online | ConvertSign",
      description:
        "Extract table data from JPG images into Excel. Free OCR-powered tool, no upload needed.",
    },
    "/merge-pdf": {
      title: "Merge PDF Files — Free Online | ConvertSign",
      description:
        "Combine multiple PDF files into one document. Fast in-browser merge, no upload, completely free.",
    },
    "/qr-generator": {
      title: "QR Code Generator — Free Online | ConvertSign",
      description:
        "Generate custom QR codes for URLs, text, or any data. Instant download as PNG — free and private.",
    },
    "/qr-scanner": {
      title: "QR Code Scanner — Free Online | ConvertSign",
      description:
        "Scan QR codes from images or your camera. In-browser QR reader, no app download required.",
    },
    "/barcode-scanner": {
      title: "Barcode Scanner — Free Online | ConvertSign",
      description:
        "Scan barcodes from images or your webcam. Supports all common formats — EAN, UPC, Code 128 and more.",
    },
    "/signature": {
      title: "Online Signature Creator — Draw or Type | ConvertSign",
      description:
        "Create a digital signature online. Draw, type, or upload your signature and save it as a PNG — free forever.",
    },
    "/sign-image": {
      title: "Sign an Image — Add Signature to Image Free | ConvertSign",
      description:
        "Add your signature to any image or document. Drag-and-drop placement, download as PNG — free and private.",
    },
    "/resize": {
      title: "Image Resizer — Resize Images Free Online | ConvertSign",
      description:
        "Resize JPG, PNG, or WebP images to any dimension. Custom width & height, no quality loss. Free in-browser tool.",
    },
    "/invert-image": {
      title: "Invert Image Colors — Free Online | ConvertSign",
      description:
        "Invert the colors of any image instantly. Creates a negative effect — download as PNG for free.",
    },
    "/html-to-pdf": {
      title: "HTML to PDF Converter — Free Online | ConvertSign",
      description:
        "Convert HTML code or web pages to PDF. Paste HTML and download a formatted PDF — free tool.",
    },
    "/text-to-image": {
      title: "Text to Image Generator — Free Online | ConvertSign",
      description:
        "Generate an image from your text. Custom fonts, colors and backgrounds — download as PNG free.",
    },
    "/text-to-word": {
      title: "Text to Word Converter — Free Online | ConvertSign",
      description:
        "Convert plain text into a formatted Word document (DOCX). Free, instant, no sign-up.",
    },
    "/image-translator": {
      title: "Image Translator — Translate Text in Images Free | ConvertSign",
      description:
        "Detect and translate text found inside images. Supports multiple languages — free OCR + translation tool.",
    },
    "/excel-to-jpg": {
      title: "Excel to JPG Converter — Free Online | ConvertSign",
      description:
        "Convert Excel spreadsheets to JPG images. Share spreadsheet data as an image — free and instant.",
    },
    "/word-to-jpg": {
      title: "Word to JPG Converter — Free Online | ConvertSign",
      description:
        "Convert Word documents to JPG images. Each page becomes an image — free online tool.",
    },
    "/upload": {
      title: "Upload Files — ConvertSign",
      description:
        "Upload your documents and images to ConvertSign. Start converting, signing, or editing in seconds.",
    },
    "/dashboard": {
      title: "Dashboard — All Tools | ConvertSign",
      description:
        "Access all 30+ free document and image tools in one place. Convert, sign, compress, split and more.",
    },
    "/pricing": {
      title: "Pricing — Free & Pro Plans | ConvertSign",
      description:
        "ConvertSign is free forever. View our Pro plans for unlimited file sizes, batch processing and priority support.",
    },
  };

export const defaultMeta = {
  title: "ConvertSign — Free Document & Image Tools",
  description:
    "Convert, sign and manage your digital documents with ease. 30+ free in-browser tools — PDF, image, signature, QR code and more. No upload, fully private.",
};
