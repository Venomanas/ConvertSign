"use client";

import { useFileContext } from "@/context/FileContext";
import React, { JSX, useState } from "react";
import { FileProvider } from "@/context/FileContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FileUploader from "@/components/FileUploader";
import FileConverter from "@/components/FileConverter";
import ImageResizer from "@/components/ImageResizer";
import SignatureCanvas from "@/components/SignatureCanvas";
import Dashboard from "@/components/Dashboard";
import Auth from "@/components/Auth/Auth";
import UserProfile from "@/components/UserProfile";


type TabType = "upload" | "convert" | "resize" | "signature" | "dashboard";

function AppContent(): JSX.Element {
  const { selectedFile } = useFileContext();
  const [activeTab, setActiveTab] = useState<TabType>("upload");
  const [showProfile, setShowProfile] = useState<boolean>(false);
  const { currentUser, loading } = useAuth();

  const renderActiveComponent = (): JSX.Element => {
    switch (activeTab) {
      case "upload":
        return <FileUploader />;
      case "convert":
        return <FileConverter />;
      case "resize":
        if (!selectedFile) return <p className="text-center text-black">No file selected</p>;
        return (
          <ImageResizer
            file={selectedFile}
            onSave={resizedFile => console.log(resizedFile)}
            onCancel={() => console.log("Cancelled")}
          />
        );
      case "signature":
        return <SignatureCanvas />;
      case "dashboard":
        return <Dashboard />;
      default:
        return <FileUploader />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <Auth
        onAuthSuccess={(): void => {
          throw new Error("Function not implemented.");
        }}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#EFE4D2]">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onProfileClick={() => setShowProfile(true)}
      />

      <main className="flex-grow container mx-auto px-4 py-8">
        {showProfile ? (
          <div className="flex justify-center items-center">
            <UserProfile onClose={() => setShowProfile(false)} />
          </div>
        ) : (
          renderActiveComponent()
        )}
      </main>

      <Footer />
    </div>
  );
}

function App(): JSX.Element {
  return (
    <AuthProvider>
      <FileProvider>
        <AppContent />
      </FileProvider>
    </AuthProvider>
  );
}

export default App;
