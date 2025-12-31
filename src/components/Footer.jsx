"use client";

import Link from "next/link";
import Image from "next/image";

const GlobalFooter = () => {
  return (
    <footer className="relative bg-gradient-to-b from-background-200 to-background-100 border-t border-primary/20 overflow-hidden">
      {/* Gradient blur effect */}
      {/* <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-primary/5 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-secondary/5 to-transparent rounded-full blur-3xl"></div>
      </div> */}

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Centered Footer Content */}
        <div className="flex flex-col items-center justify-center gap-8">
          {/* Logo - Larger and Centered */}
          <div className="relative w-32 h-16 sm:w-40">
            <Image
              src="/images/logo.png"
              alt="RupeeFlow"
              fill
              className="object-contain"
            />
          </div>

          {/* Navigation Links - Single Row */}
          <div className="flex gap-6 sm:gap-12">
            <Link
              href="#features"
              className="text-foreground/70 hover:text-primary transition-colors duration-200 text-sm sm:text-base font-medium"
            >
              Features
            </Link>
            <Link
              href="#about"
              className="text-foreground/70 hover:text-primary transition-colors duration-200 text-sm sm:text-base font-medium"
            >
              About
            </Link>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-primary/20 my-8"></div>

        {/* Bottom Footer */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
          <p className="text-foreground/60 text-xs sm:text-sm">
            &copy; 2026 RupeeFlow. All rights reserved.
          </p>
          <p className="text-foreground/50 text-xs">
            Revolutionizing EV charging with blockchain transparency
          </p>
        </div>
      </div>
    </footer>
  );
};

export default GlobalFooter;
