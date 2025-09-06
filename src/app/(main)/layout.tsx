"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Auth from "@/components/Auth/Auth";
import UserProfile from "@/components/UserProfile";

export default function MainAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [showProfile, setShowProfile] = useState(false);
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!currentUser) {
    // You can customize the onAuthSuccess if needed, or remove it.
    return <Auth onAuthSuccess={() => {}} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-sky-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      {/* The Header now only needs the onProfileClick prop! */}
      <Header onProfileClick={() => setShowProfile(true)} />

      <main className="flex-grow container mx-auto px-4 py-8 sm:p-6 lg:p-8">
        {showProfile ? (
          <UserProfile onClose={() => setShowProfile(false)} />
        ) : (
          children // The content of your page.tsx files will be rendered here
        )}
      </main>

      <Footer />
    </div>
  );
}
