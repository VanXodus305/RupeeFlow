"use client";

import { FaLinkedin, FaTwitter, FaGithub, FaEnvelope } from "react-icons/fa";
import Link from "next/link";
import Image from "next/image";

const GlobalFooter = () => {
  return (
    <footer className="relative bg-gradient-to-t from-background-200 via-background-100 to-background-200 border-t border-primary/20 overflow-hidden">
      {/* Gradient blur effect */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-primary/5 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-secondary/5 to-transparent rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="relative w-10 h-10">
                <Image
                  src="/images/logo.png"
                  alt="RupeeFlow"
                  fill
                  className="object-contain"
                />
              </div>
              <span className="font-bold text-lg bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                RupeeFlow
              </span>
            </div>
            <p className="text-foreground/70 text-sm leading-relaxed">
              Revolutionary EV charging with blockchain settlement.
              Pay-as-you-charge with transparent, instant settlements.
            </p>
            {/* Social Links */}
            <div className="flex gap-4 mt-4">
              <Link
                href="#"
                className="text-foreground/60 hover:text-primary transition-colors duration-200"
              >
                <FaTwitter size={18} />
              </Link>
              <Link
                href="#"
                className="text-foreground/60 hover:text-primary transition-colors duration-200"
              >
                <FaGithub size={18} />
              </Link>
              <Link
                href="#"
                className="text-foreground/60 hover:text-primary transition-colors duration-200"
              >
                <FaLinkedin size={18} />
              </Link>
              <Link
                href="#"
                className="text-foreground/60 hover:text-primary transition-colors duration-200"
              >
                <FaEnvelope size={18} />
              </Link>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-lg font-semibold text-foreground mb-6">
              Product
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="#features"
                  className="text-foreground/70 hover:text-primary transition-colors duration-200 text-sm"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-foreground/70 hover:text-primary transition-colors duration-200 text-sm"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-foreground/70 hover:text-primary transition-colors duration-200 text-sm"
                >
                  Security
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-foreground/70 hover:text-primary transition-colors duration-200 text-sm"
                >
                  Roadmap
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-lg font-semibold text-foreground mb-6">
              Company
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="#about"
                  className="text-foreground/70 hover:text-primary transition-colors duration-200 text-sm"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-foreground/70 hover:text-primary transition-colors duration-200 text-sm"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-foreground/70 hover:text-primary transition-colors duration-200 text-sm"
                >
                  Careers
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-foreground/70 hover:text-primary transition-colors duration-200 text-sm"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-lg font-semibold text-foreground mb-6">
              Resources
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="#"
                  className="text-foreground/70 hover:text-primary transition-colors duration-200 text-sm"
                >
                  Documentation
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-foreground/70 hover:text-primary transition-colors duration-200 text-sm"
                >
                  API Reference
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-foreground/70 hover:text-primary transition-colors duration-200 text-sm"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-foreground/70 hover:text-primary transition-colors duration-200 text-sm"
                >
                  Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-lg font-semibold text-foreground mb-6">
              Legal
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="#"
                  className="text-foreground/70 hover:text-primary transition-colors duration-200 text-sm"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-foreground/70 hover:text-primary transition-colors duration-200 text-sm"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-foreground/70 hover:text-primary transition-colors duration-200 text-sm"
                >
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-primary/20 mb-8"></div>

        {/* Bottom Footer */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
          <p className="text-foreground/60 text-sm">
            &copy; 2024 RupeeFlow. All rights reserved. Revolutionizing EV
            charging payments.
          </p>
          <div className="flex gap-6 text-sm">
            <Link
              href="#"
              className="text-foreground/60 hover:text-primary transition-colors"
            >
              Status
            </Link>
            <Link
              href="#"
              className="text-foreground/60 hover:text-primary transition-colors"
            >
              Changelog
            </Link>
            <Link
              href="#"
              className="text-foreground/60 hover:text-primary transition-colors"
            >
              Credits
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default GlobalFooter;
