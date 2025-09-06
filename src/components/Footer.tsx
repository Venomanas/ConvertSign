import React from "react";
import Link from "next/link"; // Use Next.js Link for internal navigation

const Footer = () => {
  return (
    // The footer now sits at the bottom, not sticky.
    // The background color is slightly softer for better contrast.
    <footer className="bg-slate-100 dark:bg-gray-900/50 border-t border-slate-200 dark:border-gray-800/50 text-slate-600 dark:text-slate-400">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0">
          {/* Copyright Information */}
          <p className="text-sm text-center sm:text-left">
            &copy; {new Date().getFullYear()} ConvertSign. All Rights Reserved.
          </p>

          {/* Footer Links */}
          <nav className="flex items-center space-x-4 sm:space-x-6 text-sm">
            <Link
              href="/privacy"
              className="hover:text-slate-900 dark:hover:text-white transition-colors duration-200"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="hover:text-slate-900 dark:hover:text-white transition-colors duration-200"
            >
              Terms of Service
            </Link>
            <Link
              href="/help"
              className="hover:text-slate-900 dark:hover:text-white transition-colors duration-200"
            >
              Help
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
