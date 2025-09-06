"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import React, { useState } from "react";
import ThemeToggleButton from "./ui/theme-toggle-button"; // Assuming this is the correct path

// Define the navigation items with paths
const navItems = [
  { href: "/upload", label: "Upload" },
  { href: "/convert", label: "Convert" },
  { href: "/resize", label: "Resize" },
  { href: "/signature", label: "Signature" },
  { href: "/dashboard", label: "Dashboard" },
];

// Define a separate prop type for the component
interface HeaderProps {
  onProfileClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onProfileClick }) => {
  const { currentUser, userProfile } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname(); // Get the current URL path

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const userInitial =
    userProfile?.displayName?.charAt(0).toUpperCase() ||
    currentUser?.email?.charAt(0).toUpperCase() ||
    "U";

  return (
    <header className="bg-slate-900 dark:bg-gray-950/70 dark:border-b dark:border-gray-800/50 shadow-lg text-white backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-3">
          {/* Logo */}
          <Link
            href="/dashboard"
            className="text-xl sm:text-2xl font-bold text-sky-50 hover:text-white transition-colors"
          >
            ConvertSign 🌀
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-2">
            {navItems.map(item => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-sky-50 text-blue-600 shadow-sm"
                      : "text-blue-100 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right side icons & Mobile Menu button */}
          <div className="flex items-center space-x-4">
            <ThemeToggleButton />
            <button
              onClick={onProfileClick}
              className="hidden lg:flex items-center justify-center bg-sky-50 rounded-full h-9 w-9 text-sky-600 hover:bg-sky-200 transition-colors duration-200 shadow-sm"
              title="User Profile"
            >
              <span className="font-bold text-base">{userInitial}</span>
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="lg:hidden p-2 rounded-md text-blue-100 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Toggle menu"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="4" x2="20" y1="12" y2="12" />
                <line x1="4" x2="20" y1="6" y2="6" />
                <line x1="4" x2="20" y1="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        <div
          className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            isMobileMenuOpen ? "max-h-96 pb-4" : "max-h-0"
          }`}
        >
          <nav className="flex flex-col space-y-2 bg-white/5 rounded-lg p-2">
            {navItems.map(item => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`text-left px-4 py-3 rounded-md text-base font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-sky-50 text-blue-600 shadow-sm"
                      : "text-blue-100 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
            <button
              onClick={() => {
                onProfileClick();
                setIsMobileMenuOpen(false);
              }}
              className="text-left px-4 py-3 rounded-md text-base font-medium text-blue-100 hover:text-white hover:bg-white/10"
            >
              Profile
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
