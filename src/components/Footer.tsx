"use client"
import React from "react";
import {FaGithub, FaLinkedin, FaInstagram} from "react-icons/fa"
type Social = {
  name:string,
  href:string,
  icon: React.ComponentType<{size?: number; "aria-hidden "?: boolean}>
}
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
  //add other if needed
];
const Footer = () => {
  return (
    // The footer now sits at the bottom, not sticky.
    // The background color is slightly softer for better contrast.
    <footer className="bg-slate-900 dark:bg-gray-900/50 border-t border-slate-200 dark:border-gray-800/50 text-slate-200 dark:text-slate-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-5 flex justify-between">
        <div className="flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0">
          {/* Copyright Information */}
          <p className=" text-center sm:text-left">
            &copy; {new Date().getFullYear()} ConvertSign, Created By
            <a href="https://github.com/Venomanas" className=" text-indigo-300">
              {" "}
              Anas Sayyed.
            </a>
          </p>
        </div>
        <div className="flex items-center gap-3">

          < nav aria-label="Social links">
          <ul className="flex items-center gap-3">
            {socials.map((s)=>{
              const Icon = s.icon;
              return(
                <li key={s.name}>
                  <a 
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.name}
                  className="group inline-flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 ring-0 transform transition duration-200 shadow-sm hover:scale-105 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 hover:bg-indigo-600 hover:text-white text-gray-700 dark:text-gray-200"
                  >
                    <Icon size={18} aria-hidden />
                    <span className="sr-only" >{s.name}</span>
                    
                  </a>
                </li>
              )
            })}
          </ul>
          </nav>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
