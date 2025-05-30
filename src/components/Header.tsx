"use client"
import { useAuth } from '@/context/AuthContext';
import React from 'react'

//Define types for better type safety

interface NavItem {
    id: string;
    label: string;
}

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onProfileClick:() => void ;
}

const Header:React.FC<HeaderProps> = ({activeTab, setActiveTab, onProfileClick}) => {

    const { currentUser, userProfile } = useAuth();
    //Navigation items
    const navItems: NavItem[] =[
        {id:'upload', label:'Upload'},
        {id:'convert', label:'Convert'},
        {id:'Resize', label:'Resize'},
        {id:'signature', label:'Signature'},
        {id:'dashboard', label:'Dashboard'},
    ];
  return (
    <header className="bg-gray-800 shadow-indigo-500 shadow-2xs font-stretch-condensed ">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <h1 className="text-2xl text-indigo-300 hover:cursor-se-resize">ConvertSign</h1>
          </div>
          <div className="flex items-center">
            <nav className="hidden md:flex space-x-1 mr-4">
              {navItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`px-4 py-2 rounded-md ${
                    activeTab === item.id
                      ? "bg-blue-600 text-white font-medium"
                      : "text-indigo-100 hover:bg-indigo-500"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>

            {/* User Profile Button */}
            <button
              onClick={onProfileClick}
              className="flex items-center justify-center bg-blue-100 hover:bg-blue-200 rounded-full h-10 w-10 text-blue-700"
              title="User Profile"
            >
              <span className="font-bold">
                {userProfile?.displayName?.charAt(0).toUpperCase() ||
                  currentUser?.email?.charAt(0).toUpperCase() ||
                  "U"}
              </span>
            </button>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden">
            <select
              value={activeTab}
              onChange={e => setActiveTab(e.target.value)}
              className="bg-white border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {navItems.map(item => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header