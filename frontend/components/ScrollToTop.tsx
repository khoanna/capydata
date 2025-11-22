"use client";

import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      // Show button when page is scrolled down 300px
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);

    return () => {
      window.removeEventListener("scroll", toggleVisibility);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <>
      {isVisible && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-24 right-8 z-50 w-12 h-12 rounded-full bg-yuzu hover:bg-yuzu/90 text-black flex items-center justify-center shadow-lg hover:shadow-[0_0_30px_rgba(255,159,28,0.5)] transition-all duration-300 hover:scale-110 group"
          aria-label="Scroll to top"
        >
          <ArrowUp className="w-5 h-5 group-hover:animate-bounce" />
        </button>
      )}
    </>
  );
}
