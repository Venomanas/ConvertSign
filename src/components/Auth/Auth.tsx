"use client";
import React, { useState } from "react";
import SignInForm from "@/components/Auth/SignInForm";
import SignUpForm from "@/components/Auth/SignUpForm";
import { FileText } from "lucide-react";

interface AuthProps {
  onAuthSuccess: () => void;
}

const Auth: React.FC<AuthProps> = ({ onAuthSuccess }) => {
  const [showSignIn, setShowSignIn] = useState<boolean>(true);

  const toggleForm = (): void => {
    setShowSignIn(!showSignIn);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-600 rounded-2xl mb-4">
            <FileText size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            ConvertSign
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            File Conversion, Resizer & Signature Tool
          </p>
        </div>

        {/* Auth Form */}
        {showSignIn ? (
          <SignUpForm onToggleForm={toggleForm} onAuthSuccess={onAuthSuccess} />
        ) : (
          <SignInForm onToggleForm={toggleForm} onAuthSuccess={onAuthSuccess} />
        )}
      </div>
    </div>
  );
};

export default Auth;
