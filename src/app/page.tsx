'use client'
// import Image from "next/image";
import Dashboard from "@/components/Dashboard";
import Footer from "@/components/Footer";
import { FileProvider } from "@/context/FileContext";
export default function Home() {
  return (
    <FileProvider>
      <div className=" bg-indigo-200/95 h-screen">
      <Dashboard />
      <Footer />
      </div>
    </FileProvider>
  );
}
