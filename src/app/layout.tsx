import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/context/ToastContext";
import { AuthProvider } from "@/context/AuthContext";
import { FileProvider } from "@/context/FileContext";
import { ThemeProvider } from "@/components/ui/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ConvertSign - Document Signing and Conversion",
  description: "Convert, Sign and manage your Digital documents with ease",
 
};

export const  viewport ={
    width: "device-width",
    initialScale: 1,
  }


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
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
      </body>
    </html>
  );
}
