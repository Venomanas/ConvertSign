import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/context/ToastContext";
import { AuthProvider } from "@/context/AuthContext";
import { FileProvider } from "@/context/FileContext";
import { ThemeProvider } from "@/components/ui/theme-provider";
import RegisterSW from "@/components/RegisterSW";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "ConvertSign — Free Document & Image Tools",
    template: "%s | ConvertSign",
  },
  description:
    "Convert, sign and manage your digital documents with ease. 30+ free in-browser tools — PDF, image, signature, QR code and more. No upload, fully private.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "ConvertSign",
  },
  icons: {
    apple: "/icon-192.png",
    icon: "/icon-192.png",
  },
  openGraph: {
    type: "website",
    siteName: "ConvertSign",
    title: "ConvertSign — 30+ Free Document & Image Tools",
    description:
      "Convert PDFs, remove backgrounds, sign documents, compress files and more — all in-browser, no upload, completely free.",
    url: "https://convertsign.vercel.app",
    images: [
      {
        url: "https://convertsign.vercel.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "ConvertSign — Free Document & Image Tools",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ConvertSign — 30+ Free Document & Image Tools",
    description:
      "PDF, image, signature, QR tools — all free, in-browser, no upload needed.",
    images: ["https://convertsign.vercel.app/og-image.png"],
    creator: "@VeNOmAnas1",
  },
  keywords: [
    "PDF converter",
    "background remover",
    "digital signature",
    "image compressor",
    "PDF compress",
    "QR code generator",
    "free online tools",
    "in-browser tools",
    "no upload PDF",
  ],
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <head>
        <meta name="theme-color" content="#6366f1" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            <FileProvider>
              <ToastProvider>
                <main className="min-h-screen">{children}</main>
              </ToastProvider>
            </FileProvider>
          </AuthProvider>
        </ThemeProvider>
        <RegisterSW />
      </body>
    </html>
  );
}
