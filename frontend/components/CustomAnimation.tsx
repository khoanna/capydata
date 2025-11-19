"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { createIcons, icons } from "lucide";

export default function CustomAnimations() {
  const pathname = usePathname();

  useEffect(() => {
    let observer: IntersectionObserver | null = null;
    let mutationObserver: MutationObserver | null = null;
    
    // Small delay to ensure DOM is fully rendered after navigation
    const timeoutId = setTimeout(() => {
      // Reinitialize Lucide icons for the new page
      createIcons({ icons });

      // Create IntersectionObserver for scroll animations
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("active");
            }
          });
        },
        {
          threshold: 0.1,
          rootMargin: "0px 0px -50px 0px",
        }
      );

      // Function to observe new reveal elements
      const observeRevealElements = () => {
        document.querySelectorAll(".reveal:not(.active)").forEach((el) => {
          if (observer) observer.observe(el);
        });
      };

      // Observe all .reveal elements on current page
      observeRevealElements();

      // Watch for new elements being added to the DOM (for filtering)
      mutationObserver = new MutationObserver((mutations) => {
        let needsIconUpdate = false;
        let needsRevealUpdate = false;

        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              // Check if new node has data-lucide icons
              if (element.querySelector && element.querySelectorAll('[data-lucide]').length > 0) {
                needsIconUpdate = true;
              }
              // Check if new node has reveal elements
              if (element.querySelector && element.querySelectorAll('.reveal').length > 0) {
                needsRevealUpdate = true;
              }
            }
          });
        });

        if (needsIconUpdate) {
          requestAnimationFrame(() => {
            createIcons({ icons });
          });
        }
        if (needsRevealUpdate) {
          requestAnimationFrame(() => {
            observeRevealElements();
          });
        }
      });

      // Start observing document for changes
      mutationObserver.observe(document.body, {
        childList: true,
        subtree: true,
      });

      // Setup mouse parallax for hero visual
      const heroVisual = document.querySelector(".animate-float") as HTMLElement | null;

      const handleMove = (e: MouseEvent) => {
        if (!heroVisual) return;

        const x = (window.innerWidth - e.pageX * 2) / 100;
        const y = (window.innerHeight - e.pageY * 2) / 100;

        heroVisual.style.transform = `translateX(${x}px) translateY(${y}px)`;
      };

      document.addEventListener("mousemove", handleMove);

      // Cleanup function for this timeout
      return () => {
        if (observer) observer.disconnect();
        if (mutationObserver) mutationObserver.disconnect();
        document.removeEventListener("mousemove", handleMove);
      };
    }, 50);

    // Cleanup timeout if component unmounts or pathname changes before delay completes
    return () => {
      clearTimeout(timeoutId);
      if (observer) observer.disconnect();
      if (mutationObserver) mutationObserver.disconnect();
    };
  }, [pathname]); // Re-run when pathname changes

  return null;
}
