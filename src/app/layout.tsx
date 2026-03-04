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
  title: "ConvertSign — Document Signing & Conversion",
  description:
    "Convert, sign and manage your digital documents with ease. Free in-browser tools — PDF, image, signature, QR code and more.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "ConvertSign",
  },
  icons: {
    apple: "/icon-192.png",
  },
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
