import React from "react";

const Footer = () => {
  return (
    // The footer now sits at the bottom, not sticky.
    // The background color is slightly softer for better contrast.
    <footer className="bg-slate-900 dark:bg-gray-900/50 border-t border-slate-200 dark:border-gray-800/50 text-slate-200 dark:text-slate-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0">
          {/* Copyright Information */}
          <p className="text-sm text-center sm:text-left">
            &copy; {new Date().getFullYear()} ConvertSign, Created By Anas Sayyed.
          </p>
          </div>
      </div>
    </footer>
  );
};

export default Footer;
