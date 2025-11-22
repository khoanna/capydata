"use client";

import { usePathname } from "next/navigation";
import Footer from "./Footer";
import FooterSlide from "./FooterSlide";

export default function LayoutFooter() {
  const pathname = usePathname();
  const isLandingPage = pathname === "/";

  return (
    <>
      <Footer transparent={isLandingPage} />
      <FooterSlide transparent={isLandingPage} />
    </>
  );
}
