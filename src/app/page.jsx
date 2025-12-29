"use client";

import localFont from "next/font/local";
import Hero from "@/components/Hero";
import GlobalNavbar from "@/components/Navbar";
import GlobalFooter from "@/components/Footer";

const Conthrax = localFont({
  src: "../../public/fonts/Conthrax-SemiBold.otf",
  variable: "--font-conthrax",
  display: "swap",
});

export default function Home() {
  return (
    <>
      <GlobalNavbar />
      <div className="flex flex-col min-h-screen w-full">
        <Hero />
      </div>
      <GlobalFooter />
    </>
  );
}
