import React, { useEffect, useState } from "react";
import { FaX, FaLinkedinIn, FaHeart, FaYoutube, FaGithub, FaInstagram } from "react-icons/fa6";

const Footer = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isCreateTripPage, setIsCreateTripPage] = useState(false);

  useEffect(() => {
    // Check if we're on create trip page
    const checkPath = () => {
      setIsCreateTripPage(window.location.pathname === '/trips/create');
    };
    checkPath();
    window.addEventListener('popstate', checkPath);
    return () => window.removeEventListener('popstate', checkPath);
  }, []);

  useEffect(() => {
    if (isCreateTripPage) {
      setIsVisible(true);
      return;
    }

    const handleScroll = () => {
      const scrollPosition = window.pageYOffset;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const threshold = 100; // Distance from bottom to show footer

      if (documentHeight - windowHeight - scrollPosition <= threshold) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isCreateTripPage]);

  if (isCreateTripPage) {
    return null; // Don't render footer on create trip page
  }

  return (
    <footer className={`
      bg-white flex flex-col justify-between items-center px-6 py-6
      transition-all duration-300 ease-in-out
      ${isVisible ? 'opacity-100' : 'opacity-0'}
      group-hover:opacity-100
      md:group-hover:opacity-100
      ${isCreateTripPage ? 'h-24' : 'h-64'}
      md:h-64
      mb-8
    `}>
      {isVisible && (
        <div className="flex flex-col items-center gap-4">
          <div className="flex gap-4 flex-wrap justify-center">
            <a href="#coming-soon" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-pink-600 transition-colors duration-200">
              <FaInstagram className="w-6 h-6" />
            </a>
            <a href="#coming-soon" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-red-600 transition-colors duration-200">
              <FaYoutube className="w-6 h-6" />
            </a>
            <a href="https://x.com/VaishnoSatyam" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-blue-400 transition-colors duration-200">
              <FaX className="w-6 h-6" />
            </a>
            <a href="https://www.linkedin.com/in/vaishno-prakash-tiwari-989033252/" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-blue-700 transition-colors duration-200">
              <FaLinkedinIn className="w-6 h-6" />
            </a>
            <a href="https://github.com/Vaishnotiwari12" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-black transition-colors duration-200">
              <FaGithub className="w-6 h-6" />
            </a>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <FaHeart className="w-4 h-4 text-red-500" />
            <p className="font-medium">Made by Vaishno Tiwari</p>
          </div>
          <p className="text-sm font-medium text-gray-500">&copy; 2025 Tourvisto</p>
        </div>
      )}
    </footer>
  );
};

export default Footer;

