"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import AboutSection from "@/components/AboutSection";
import CTASection from "@/components/CTASection";

export default function Home() {
  const { data: session } = useSession();
  const [kwh, setKwh] = useState(0);
  const [inrAmount, setInrAmount] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isCharging, setIsCharging] = useState(true);

  const MATIC_PRICE = 0.65;

  useEffect(() => {
    if (!isCharging) {
      const resetTimer = setTimeout(() => {
        setKwh(0);
        setInrAmount(0);
        setProgress(0);
        setIsCharging(true);
      }, 3000);
      return () => clearTimeout(resetTimer);
    }

    const maxKwh = 8;
    const chargeInterval = 500;
    const chargesUntilComplete = 16;

    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + 1;
        const percentage = newProgress / chargesUntilComplete;

        const newKwh = maxKwh * percentage;
        const newAmount = newKwh * 15;

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
      <HeroSection
        kwh={kwh}
        inrAmount={inrAmount}
        progress={progress}
        isCharging={isCharging}
        maticAmount={maticAmount}
      />
      <FeaturesSection />
      <HowItWorksSection />
      <AboutSection />
      <CTASection />
    </div>
  );
}
