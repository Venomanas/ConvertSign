import React from 'react'

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h2 className="text-xl text-indigo-200 font-stretch-condensed ">
              ConvertSign
            </h2>
            <p className="text-indigo-200 font-stretch-condensed text-sm mt-1">
              Your all in one file conversion and signature tool
              {/* I testify that there is no true god but God, and Muhammad is the
          Messenger of God. */}
            </p>
          </div>

          <div className="flex flex-col items-center md:items-end">
            <div className="mb-2">
              <p className="text-indigo-200 font-stretch-condensed tet-xl ">
                © {new Date().getFullYear()}
                <span className="p-0.5">ConvertSign</span> All right Reserved
              </p>
            </div>

            <div className="flex space-x-4">
              <a
                href="#"
                className="text-indigo-200 font-stretch-condensed hover:text-white"
              >
                <span className="sr-only">Privacy Policy</span>Privacy Policy
              </a>
              <a
                href="#"
                className="text-indigo-200 font-stretch-condensed hover:text-white"
              >
                <span className="sr-only">Terms of Services</span>Terms of
                Services
              </a>
              <a
                href="#"
                className="text-indigo-200 font-stretch-condensed hover:text-white"
              >
                <span className="sr-only">Help</span>Help
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
export default Footer;
