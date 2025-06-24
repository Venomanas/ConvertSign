"use client";
import { useAuth } from "@/context/AuthContext";
import React, { useState } from "react";

interface NavItem {
  id: "upload" | "convert" | "resize" | "signature" | "dashboard";
  label: string;
}

type TabType = "upload" | "convert" | "resize" | "signature" | "dashboard";

interface HeaderProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  onProfileClick: () => void;
}

const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onProfileClick,
}) => {
  const { currentUser, userProfile } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems: NavItem[] = [
    { id: "upload", label: "Upload" },
    { id: "convert", label: "Convert" },
    { id: "resize", label: "Resize" },
    { id: "signature", label: "Signature" },
    { id: "dashboard", label: "Dashboard" },
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleMobileNavClick = (tab: TabType) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="bg-[#1a1b60] font-stretch-condensed shadow-lg text-white ">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0 ">
            <h1 className="text-xl sm:text-2xl text-blue-100 hover:cursor-pointer transition-colors duration-200 hover:text-white">
              ConvertSign
            </h1>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            <nav className="flex space-x-1 mr-6">
              {navItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`px-3 xl:px-4 py-2 rounded-md text-sm xl:text-base font-medium transition-all duration-200 ${
                    activeTab === item.id
                      ? "bg-sky-50 text-blue-600 shadow-sm"
                      : "text-blue-100 hover:text-white hover:bg-blue-700/50"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>

            <button
              onClick={onProfileClick}
              className="flex items-center justify-center bg-sky-50 rounded-full h-10 w-10 text-sky-600 hover:bg-sky-200 transition-colors duration-200 shadow-sm"
              title="User Profile"
            >
              <span className="font-bold text-sm">
                {userProfile?.displayName?.charAt(0).toUpperCase() ||
                  currentUser?.email?.charAt(0).toUpperCase() ||
                  "U"}
              </span>
            </button>
          </div>

          {/* Mobile Navigation */}
          <div className="lg:hidden flex items-center space-x-3">
            <button
              onClick={onProfileClick}
              className="flex items-center justify-center bg-sky-50 rounded-full h-9 w-9 text-sky-600 hover:bg-sky-200 transition-colors duration-200"
              title="User Profile"
            >
              <span className="font-bold text-sm">
                {userProfile?.displayName?.charAt(0).toUpperCase() ||
                  currentUser?.email?.charAt(0).toUpperCase() ||
                  "U"}
              </span>
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="flex flex-col justify-center items-center w-8 h-8 text-blue-100 hover:text-white transition-colors duration-200"
              aria-label="Toggle menu"
            >
              <span
                className={`block w-5 h-0.5 bg-current transition-all duration-200 ${
                  isMobileMenuOpen ? "rotate-45 translate-y-1" : ""
                }`}
              />
              <span
                className={`block w-5 h-0.5 bg-current transition-all duration-200 mt-1 ${
                  isMobileMenuOpen ? "opacity-0" : ""
                }`}
              />
              <span
                className={`block w-5 h-0.5 bg-current transition-all duration-200 mt-1 ${
                  isMobileMenuOpen ? "-rotate-45 -translate-y-1" : ""
                }`}
              />
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        <div
          className={`lg:hidden transition-all duration-300 ease-in-out ${
            isMobileMenuOpen
              ? "max-h-64 opacity-100 pb-4"
              : "max-h-0 opacity-0 overflow-hidden"
          }`}
        >
          <nav className="flex flex-col space-y-2 bg-blue-800/30 rounded-lg p-3">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => handleMobileNavClick(item.id)}
                className={`text-left px-4 py-3 rounded-md text-sm font-medium transition-all duration-200 ${
                  activeTab === item.id
                    ? "bg-sky-50 text-blue-600 shadow-sm"
                    : "text-blue-100 hover:text-white hover:bg-blue-700/50"
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
