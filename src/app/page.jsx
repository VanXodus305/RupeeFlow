"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { Button, Card, CardBody } from "@heroui/react";
import {
  FaBolt,
  FaShieldAlt,
  FaChartLine,
  FaLock,
  FaClock,
  FaArrowRight,
  FaCheckCircle,
} from "react-icons/fa";
import Image from "next/image";

export default function Home() {
  const { data: session } = useSession();
  const [kwh, setKwh] = useState(0);
  const [inrAmount, setInrAmount] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isCharging, setIsCharging] = useState(true);

  // Exchange rate (you can update this)
  const MATIC_PRICE = 0.65; // 1 INR = 0.65 MATIC (approximately)

  useEffect(() => {
    if (!isCharging) {
      // Reset after 3 seconds
      const resetTimer = setTimeout(() => {
        setKwh(0);
        setInrAmount(0);
        setProgress(0);
        setIsCharging(true);
      }, 3000);
      return () => clearTimeout(resetTimer);
    }

    // Charge increment values
    const maxKwh = 8;
    const chargeInterval = 500; // 0.5 seconds
    const chargesUntilComplete = 16; // 16 * 0.5s = 8 seconds

    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + 1;
        const percentage = newProgress / chargesUntilComplete;

        // Update kWh and INR amount
        const newKwh = maxKwh * percentage;
        const newAmount = newKwh * 15; // 15 INR per kWh

        setKwh(newKwh);
        setInrAmount(newAmount);

        if (newProgress >= chargesUntilComplete) {
          setIsCharging(false);
          return chargesUntilComplete;
        }

        return newProgress;
      });
    }, chargeInterval);

    return () => clearInterval(interval);
  }, [isCharging]);

  const maticAmount = (inrAmount * MATIC_PRICE).toFixed(4);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background-200 via-background-100/20 to-background-200 overflow-hidden">
      {/* Background gradient orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 -right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-primary/3 rounded-full blur-3xl"></div>
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 pt-24">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 border border-primary/30 backdrop-blur-sm">
                <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
                <span className="text-primary text-sm font-semibold">
                  Powered by Blockchain
                </span>
              </div>
              <h1
                className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight"
                style={{ fontFamily: "Conthrax, sans-serif" }}
              >
                <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
                  Charge Smart
                </span>
                <br />
                <span className="text-foreground">Pay Transparent</span>
              </h1>
              <p className="text-lg text-foreground/70 leading-relaxed max-w-lg">
                RupeeFlow revolutionizes EV charging with real-time settlements
                and blockchain transparency. Pay only for what you use,
                instantly settled.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button
                as={Link}
                href="/login"
                className="bg-gradient-to-r from-primary to-primary/80 text-background-200 font-semibold text-lg px-8 py-6 hover:shadow-lg hover:shadow-primary/50 transition-all duration-200 group"
                radius="full"
              >
                Get Started
                <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                as={Link}
                href="#features"
                variant="bordered"
                className="border-2 border-primary text-primary font-semibold text-lg px-8 py-6 hover:bg-primary/10 transition-all duration-200"
                radius="full"
              >
                Learn More
              </Button>
            </div>

            {/* Tech Stack */}
            <div className="grid grid-cols-3 gap-4 pt-3">
              {[
                { tech: "Polygon", label: "Blockchain" },
                { tech: "MetaMask", label: "Web3 Wallet" },
                { tech: "Real-time", label: "Settlement" },
              ].map((item, i) => (
                <div
                  key={i}
                  className="py-4 px-2 sm:px-4 rounded-lg bg-white/5 border border-primary/20 backdrop-blur-sm"
                >
                  <div
                    className="text-xs sm:text-xl font-bold text-primary"
                    style={{ fontFamily: "Conthrax, sans-serif" }}
                  >
                    {item.tech}
                  </div>
                  <div className="text-xs sm:text-sm text-foreground/60">
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Visual */}
          <div className="relative h-96 sm:h-[500px] lg:h-full flex items-center justify-center">
            <div className="relative w-full h-full">
              {/* Animated gradient card */}
              <div
                className={`absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-3xl blur-2xl ${
                  isCharging ? "animate-pulse" : ""
                }`}
              ></div>
              <div className="relative bg-gradient-to-br from-background-100/50 to-background-200/50 border border-primary/20 rounded-3xl p-8 backdrop-blur-xl h-full flex items-center justify-center overflow-hidden">
                {/* Success checkmark animation */}
                {!isCharging && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-background-200 to-background-100 backdrop-blur-2xl rounded-3xl">
                    <div className="text-center space-y-6 animate-in fade-in duration-500">
                      {/* Animated checkmark circle */}
                      <div className="relative w-32 h-32 mx-auto">
                        <div
                          className="absolute inset-0 bg-gradient-to-br from-primary/30 to-secondary/30 rounded-full animate-pulse"
                          style={{ animationDuration: "2s" }}
                        ></div>
                        <div className="absolute inset-2 bg-gradient-to-br from-primary/20 to-secondary/10 rounded-full border-2 border-primary/50"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <FaCheckCircle className="w-20 h-20 text-primary animate-in zoom-in-50 duration-700" />
                        </div>
                      </div>
                      <div className="space-y-2 animate-in slide-in-from-bottom-3 duration-700">
                        <p
                          className="text-2xl font-bold text-primary"
                          style={{ fontFamily: "Conthrax, sans-serif" }}
                        >
                          Transaction Complete!
                        </p>
                        <p className="text-foreground/70 text-sm flex items-center justify-center gap-2">
                          <FaShieldAlt className="text-primary text-xs" />
                          <span>Settled on Polygon</span>
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div
                  className={`text-center space-y-6 ${
                    !isCharging ? "hidden" : ""
                  }`}
                >
                  <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 border-2 border-primary/40 transition-transform animate-pulse">
                    <FaBolt className="text-4xl text-primary" />
                  </div>
                  <div>
                    <p className="text-foreground/60 text-sm mb-2">
                      Real-time Energy Meter
                    </p>
                    <div
                      className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
                      style={{ fontFamily: "Conthrax, sans-serif" }}
                    >
                      {kwh.toFixed(2)} kWh
                    </div>
                    <div className="text-lg font-bold text-foreground mt-3 space-y-1">
                      <div>₹{inrAmount.toFixed(2)}</div>
                      <div className="text-sm text-primary">
                        {maticAmount} MATIC
                      </div>
                    </div>
                  </div>

                  {/* Progress bar with animation */}
                  <div className="w-full space-y-2">
                    <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden border border-primary/20">
                      <div
                        className="h-full bg-gradient-to-r from-primary via-secondary to-primary rounded-full transition-all duration-500"
                        style={{ width: `${(progress / 16) * 100}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between items-center text-xs text-foreground/60">
                      <span>{isCharging ? "Charging..." : "Complete"}</span>
                      <span>{((progress / 16) * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-24 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2
              className="text-4xl sm:text-5xl font-bold"
              style={{ fontFamily: "Conthrax, sans-serif" }}
            >
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Powerful Features
              </span>
            </h2>
            <p className="text-foreground/70 text-lg max-w-2xl mx-auto">
              Everything you need for transparent, instant EV charging
              settlements
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
            {[
              {
                icon: FaBolt,
                title: "Real-Time Charging",
                description:
                  "Live meter readings and instant updates as you charge. No waiting, no surprises.",
              },
              {
                icon: FaShieldAlt,
                title: "Blockchain Secure",
                description:
                  "Every transaction recorded on Polygon blockchain for complete transparency and security.",
              },
              {
                icon: FaLock,
                title: "Smart Wallets",
                description:
                  "Direct MetaMask integration for user-controlled settlements without backend keys.",
              },
              {
                icon: FaClock,
                title: "Instant Settlement",
                description:
                  "Automatic blockchain settlement upon charging completion. No delays, no middleman.",
              },
              {
                icon: FaChartLine,
                title: "Analytics Dashboard",
                description:
                  "Track your charging history, costs, and savings with detailed analytics.",
              },
              {
                icon: FaLock,
                title: "Multi-Auth Support",
                description:
                  "Sign in with Google or credentials. Demo accounts available for testing.",
              },
            ].map((feature, i) => (
              <div key={i} className="relative group pt-12">
                {/* Icon at top center - positioned absolutely outside card */}
                <div className="absolute top-3 left-1/2 transform -translate-x-1/2 z-10">
                  <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center border-2 border-primary/30">
                    <feature.icon className="text-3xl text-primary" />
                  </div>
                </div>

                {/* Chipped corners card */}
                <div
                  className="bg-gradient-to-br from-background-100/50 to-background-200/50 border-2 border-primary/20 hover:border-primary/40 transition-all duration-300 group-hover:-translate-y-1 p-6 space-y-4 h-full"
                  style={{
                    clipPath:
                      "polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)",
                  }}
                >
                  {/* Content */}
                  <div className="space-y-3 text-center">
                    <h3
                      className="text-xl font-semibold text-foreground mt-5"
                      style={{ fontFamily: "Conthrax, sans-serif" }}
                    >
                      {feature.title}
                    </h3>
                    <p className="text-foreground/70 leading-relaxed text-sm">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section
        id="how-it-works"
        className="relative sm:pt-24 pb-24 px-4 sm:px-6"
      >
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10 space-y-4">
            <h2
              className="text-4xl sm:text-5xl font-bold"
              style={{ fontFamily: "Conthrax, sans-serif" }}
            >
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                How It Works
              </span>
            </h2>
            <p className="text-foreground/70 text-lg">
              Simple, transparent, blockchain-backed process
            </p>
          </div>

          {/* Vertical Timeline */}
          <div className="relative">
            {/* Central Timeline Line - Desktop Only */}
            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-secondary via-primary to-secondary transform -translate-x-1/2"></div>

            {/* Timeline Items */}
            <div className="space-y-8">
              {[
                {
                  number: "1",
                  title: "Connect",
                  desc: "Sign in and connect MetaMask wallet",
                  details:
                    "Authenticate with Google or credentials and link your MetaMask Web3 wallet securely.",
                  side: "left",
                },
                {
                  number: "2",
                  title: "Start Charging",
                  desc: "Select station and plug in",
                  details:
                    "Browse available charging stations nearby and initiate your charging session with one click.",
                  side: "right",
                },
                {
                  number: "3",
                  title: "Real-Time Meter",
                  desc: "Watch live energy consumption",
                  details:
                    "Monitor live kWh consumption and rupee charges in real-time as your EV charges.",
                  side: "left",
                },
                {
                  number: "4",
                  title: "Instant Settlement",
                  desc: "Auto-settle on blockchain",
                  details:
                    "Automatic settlement on Polygon blockchain upon completion with transparent transaction records.",
                  side: "right",
                },
              ].map((step, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-4 md:gap-8 ${
                    step.side === "left" ? "md:flex-row" : "md:flex-row-reverse"
                  }`}
                >
                  {/* Card - Desktop */}
                  <div className="hidden md:block flex-1">
                    <div className="bg-gradient-to-br from-background-100/50 to-background-200/50 border border-primary/20 rounded-2xl p-6 space-y-4 hover:border-primary/40 transition-all duration-300 hover:-translate-y-1">
                      <h3
                        className="text-xl font-semibold text-secondary"
                        style={{ fontFamily: "Conthrax, sans-serif" }}
                      >
                        {step.title}
                      </h3>
                      <p className="text-foreground/70 text-sm font-medium">
                        {step.desc}
                      </p>
                      <p className="text-foreground/60 text-xs leading-relaxed">
                        {step.details}
                      </p>
                    </div>
                  </div>

                  {/* Timeline Circle */}
                  <div className="flex-shrink-0 relative z-10 h-full">
                    <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-background-100 via-primary to-background-100 flex items-center justify-center border-4 border-background-200 shadow-lg shadow-primary/50">
                      <span
                        className="text-xl md:text-2xl font-bold text-background-200"
                        style={{ fontFamily: "Conthrax, sans-serif" }}
                      >
                        {step.number}
                      </span>
                    </div>
                  </div>

                  {/* Card - Mobile */}
                  <div className="flex-1 md:hidden">
                    <div className="bg-gradient-to-br from-background-100/50 to-background-200/50 border border-primary/20 rounded-2xl p-5 space-y-3 hover:border-primary/40 transition-all duration-300">
                      <h3
                        className="text-lg font-semibold text-secondary"
                        style={{ fontFamily: "Conthrax, sans-serif" }}
                      >
                        {step.title}
                      </h3>
                      <p className="text-foreground/70 text-sm font-medium">
                        {step.desc}
                      </p>
                      <p className="text-foreground/60 text-xs leading-relaxed">
                        {step.details}
                      </p>
                    </div>
                  </div>

                  {/* Empty Space for Alternating Layout - Desktop Only */}
                  <div className="hidden md:block flex-1"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="relative  px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-background-100/50 to-background-200/50 border border-primary/20 rounded-3xl p-8 sm:p-12 backdrop-blur-xl">
            <h2
              className="text-4xl font-bold mb-6 text-center md:text-left"
              style={{ fontFamily: "Conthrax, sans-serif" }}
            >
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent ">
                About RupeeFlow
              </span>
            </h2>
            <p className="text-foreground/80 text-lg leading-relaxed mb-6">
              RupeeFlow is a next-generation EV charging platform that leverages
              blockchain technology to provide transparent, instant settlements
              for electric vehicle charging sessions.
            </p>
            <p className="text-foreground/80 text-lg leading-relaxed mb-6">
              Built with cutting-edge technology including Next.js, ethers.js,
              and Polygon blockchain, RupeeFlow eliminates intermediaries and
              ensures every transaction is recorded permanently on the
              blockchain for complete transparency.
            </p>
            <p className="text-foreground/80 text-lg leading-relaxed">
              Whether you're an EV owner looking for transparent charging costs
              or a station operator wanting to manage your business efficiently,
              RupeeFlow has you covered.
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-24 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-4xl sm:text-5xl font-bold">
              Ready to <span className="text-primary">charge smart?</span>
            </h2>
            <p className="text-foreground/70 text-lg">
              Join thousands of users enjoying transparent, blockchain-backed EV
              charging
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              as={Link}
              href="/login"
              className="bg-gradient-to-r from-primary to-primary/80 text-background-200 font-semibold text-lg px-8 py-6 hover:shadow-lg hover:shadow-primary/50 transition-all duration-200"
              radius="full"
            >
              Get Started Free
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
