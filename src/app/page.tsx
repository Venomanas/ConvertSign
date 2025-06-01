'use client'
// import Image from "next/image";
import Dashboard from "@/components/Dashboard";
import Footer from "@/components/Footer";
import { FileProvider } from "@/context/FileContext";
import Header from "@/components/Header";

export default function Home() {
  return (
    <FileProvider>
      <div className=" bg-[#FFDAB3] h-screen">
        <Header
          activeTab={""}
          setActiveTab={function (): void {
            throw new Error("Function not implemented.");
          }}
          onProfileClick={function (): void {
            throw new Error("Function not implemented.");
          }}
        />
        <Dashboard />
        <Footer />
      </div>
    </FileProvider>
  );
}
