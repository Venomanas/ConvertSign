"use client";
import { useAuth } from "@/context/AuthContext";
import React from "react";

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

  const navItems: NavItem[] = [
    { id: "upload", label: "Upload" },
    { id: "convert", label: "Convert" },
    { id: "resize", label: "Resize" },
    { id: "signature", label: "Signature" },
    { id: "dashboard", label: "Dashboard" },
  ];

  return (
    <header className="bg-[#574964] font-stretch-condensed">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
          <h1 className="text-2xl text-[#FFDAB3] hover:cursor-se-resize">
              ConvertSign
            </h1>
          </div>
          <div className="flex items-center">
            <nav className="hidden md:flex space-x-2 mr-4">
              {navItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`px-4 py-2 rounded-md ${
                    activeTab === item.id
                      ? "bg-[#C8AAAA] text-[#574964] font-stretch-condensed "
                      : "hover:text-background hover:bg-[#C8AAAA]"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>

            <button
              onClick={onProfileClick}
              className="flex items-center justify-center bg-[#C8AAAA]  rounded-full h-10 w-10  text-background hover:bg-[#FFDAB3]"
              title="User Profile"
            >
              <span className=" font-bold">
                {userProfile?.displayName?.charAt(0).toUpperCase() ||
                  currentUser?.email?.charAt(0).toUpperCase() ||
                  "U"}
              </span>
            </button>
          </div>

          {/* Mobile Dropdown Navigation */}
          <div className="md:hidden">
            <select
              value={activeTab}
              onChange={e => setActiveTab(e.target.value as TabType)}
              className="bg-[#C8AAAA] text-background border border-gray-900 rounded-md py-2 px-3 focus:outline-none focus:ring-3 focus:ring-[#FFDAB3]"
            >
              {navItems.map(item => (
                <option key={item.id} value={item.id} >
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
