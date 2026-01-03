"use client";

import Link from "next/link";
import { Button } from "@heroui/react";
import { FaArrowLeft, FaHome } from "react-icons/fa";

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background-200 via-background-100/20 to-background-200 overflow-hidden flex items-center justify-center px-4 sm:px-6 pt-14">
      <div className="max-w-2xl mx-auto text-center space-y-8">
        {/* Error Code */}
        <div className="space-y-4">
          <h1
            className="text-7xl sm:text-8xl font-bold tracking-tight"
            style={{ fontFamily: "Conthrax, sans-serif" }}
          >
            <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
              404
            </span>
          </h1>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
            Page Not Found
          </h2>
          <p className="text-lg text-foreground/70 leading-relaxed max-w-lg mx-auto">
            Oops! The page you're looking for doesn't exist. It might have been
            moved or deleted. Don't worry, we'll help you get back on track.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Button
            as={Link}
            href="/"
            className="bg-gradient-to-r from-primary to-primary/80 text-background-200 font-semibold text-lg px-8 py-6 hover:shadow-lg hover:shadow-primary/50 transition-all duration-200 group"
            radius="full"
          >
            <FaHome className="group-hover:scale-110 transition-transform" />
            Go to Home
          </Button>
          <Button
            onClick={() => window.history.back()}
            variant="bordered"
            className="border-2 border-primary text-primary font-semibold text-lg px-8 py-6 hover:bg-primary/10 transition-all duration-200 group"
            radius="full"
          >
            <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
            Go Back
          </Button>
        </div>

        <div className="pt-4 space-y-4">
          <p className="text-foreground/50 text-sm">
            Need help? Check out these pages:
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/login"
              className="px-4 py-2 rounded-lg bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20 transition-all duration-200"
            >
              Login
            </Link>
            <Link
              href="/#features"
              className="px-4 py-2 rounded-lg bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20 transition-all duration-200"
            >
              Features
            </Link>
            <Link
              href="/#how-it-works"
              className="px-4 py-2 rounded-lg bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20 transition-all duration-200"
            >
              How It Works
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;