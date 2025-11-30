"use client";

import React from "react";
import { FaGithub, FaLinkedin, FaInstagram } from "react-icons/fa";

type Social = {
  name: string;
  href: string;
  icon: React.ComponentType<{ size?: number; "aria-hidden"?: boolean }>;
};

const socials: Social[] = [
  { name: "Github", href: "https://github.com/Venomanas", icon: FaGithub },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/in/anas-sayyed-01a0b7271/",
    icon: FaLinkedin,
  },
  {
    name: "Instagram",
    href: "https://www.instagram.com/anas._.sayyed",
    icon: FaInstagram,
  },
];

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 dark:bg-gray-900/50 border-t border-slate-200/10 dark:border-gray-800/50 text-slate-200 dark:text-slate-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        {/* 🔹 Stack on mobile, row on larger screens */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Left side: copy text */}
          <p className="text-xs sm:text-sm text-center sm:text-left">
            &copy; {new Date().getFullYear()}{" "}
            <span className="font-semibold">ConvertSign</span>, created by{" "}
            <a
              href="https://github.com/Venomanas"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-300 hover:text-indigo-200 underline-offset-2 hover:underline"
            >
              Anas Sayyed
            </a>
            .
          </p>

          {/* Right side: socials */}
          <nav
            aria-label="Social links"
            className="flex justify-center sm:justify-end"
          >
            <ul className="flex items-center gap-3">
              {socials.map(s => {
                const Icon = s.icon;
                return (
                  <li key={s.name}>
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={s.name}
                      className="group inline-flex items-center justify-center w-9 h-9 rounded-full bg-gray-100/10 dark:bg-gray-800/80 border border-gray-700/60 shadow-sm transition duration-200 hover:scale-105 hover:bg-indigo-600 hover:text-white text-gray-200 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500"
                    >
                      <Icon size={18} aria-hidden />
                      <span className="sr-only">{s.name}</span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
