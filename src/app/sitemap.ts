import { MetadataRoute } from "next";

const BASE_URL = "https://convertsign.vercel.app";

const tools = [
  { path: "/dashboard", priority: 1.0, changeFreq: "weekly" },
  { path: "/background-remover", priority: 0.9, changeFreq: "monthly" },
  { path: "/pdf-compress", priority: 0.9, changeFreq: "monthly" },
  { path: "/image-compressor", priority: 0.9, changeFreq: "monthly" },
  { path: "/signature", priority: 0.9, changeFreq: "monthly" },
  { path: "/pricing", priority: 0.8, changeFreq: "monthly" },
  { path: "/upload", priority: 0.8, changeFreq: "monthly" },
  { path: "/convert", priority: 0.8, changeFreq: "monthly" },
  { path: "/pdf-to-word", priority: 0.8, changeFreq: "monthly" },
  { path: "/pdf-to-jpg", priority: 0.8, changeFreq: "monthly" },
  { path: "/pdf-to-text", priority: 0.8, changeFreq: "monthly" },
  { path: "/pdf-to-excel", priority: 0.7, changeFreq: "monthly" },
  { path: "/word-to-pdf", priority: 0.7, changeFreq: "monthly" },
  { path: "/word-to-jpg", priority: 0.7, changeFreq: "monthly" },
  { path: "/jpg-to-word", priority: 0.7, changeFreq: "monthly" },
  { path: "/jpg-to-excel", priority: 0.7, changeFreq: "monthly" },
  { path: "/excel-to-jpg", priority: 0.7, changeFreq: "monthly" },
  { path: "/image-to-pdf", priority: 0.7, changeFreq: "monthly" },
  { path: "/image-to-text", priority: 0.7, changeFreq: "monthly" },
  { path: "/image-translator", priority: 0.7, changeFreq: "monthly" },
  { path: "/html-to-pdf", priority: 0.7, changeFreq: "monthly" },
  { path: "/text-to-image", priority: 0.7, changeFreq: "monthly" },
  { path: "/text-to-word", priority: 0.7, changeFreq: "monthly" },
  { path: "/invert-image", priority: 0.6, changeFreq: "monthly" },
  { path: "/resize", priority: 0.6, changeFreq: "monthly" },
  { path: "/merge-pdf", priority: 0.7, changeFreq: "monthly" },
  { path: "/qr-generator", priority: 0.7, changeFreq: "monthly" },
  { path: "/qr-scanner", priority: 0.6, changeFreq: "monthly" },
  { path: "/barcode-scanner", priority: 0.6, changeFreq: "monthly" },
  { path: "/sign-image", priority: 0.7, changeFreq: "monthly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return tools.map(tool => ({
    url: `${BASE_URL}${tool.path}`,
    lastModified: new Date(),
    changeFrequency:
      tool.changeFreq as MetadataRoute.Sitemap[0]["changeFrequency"],
    priority: tool.priority,
  }));
}
