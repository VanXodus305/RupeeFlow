"use client";

import Link from "next/link";
import { Button } from "@heroui/react";
import { motion } from "framer-motion";
import {
  FaArrowRight,
  FaBolt,
  FaCheckCircle,
  FaShieldAlt,
} from "react-icons/fa";

export default function HeroSection({
  kwh,
  inrAmount,
  progress,
  isCharging,
  maticAmount,
}) {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 pt-24">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left Content */}
        <motion.div
          className="space-y-8"
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          >
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
              and blockchain transparency. Pay only for what you use, instantly
              settled.
            </p>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 pt-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                as={Link}
                href="/login"
                className="bg-gradient-to-r from-primary to-primary/80 text-background-200 font-semibold text-lg px-8 py-6 hover:shadow-lg hover:shadow-primary/50 transition-all duration-200 group"
                radius="full"
              >
                Get Started
                <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                as={Link}
                href="#features"
                variant="bordered"
                className="border-2 border-primary text-primary font-semibold text-lg px-8 py-6 hover:bg-primary/10 transition-all duration-200"
                radius="full"
              >
                Learn More
              </Button>
            </motion.div>
          </motion.div>

          {/* Tech Stack */}
          <motion.div
            className="grid grid-cols-3 gap-4 pt-3"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
          >
            {[
              { tech: "Polygon", label: "Blockchain" },
              { tech: "MetaMask", label: "Web3 Wallet" },
              { tech: "Real-time", label: "Settlement" },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="py-4 px-2 sm:px-4 rounded-lg bg-white/5 border border-primary/20 backdrop-blur-sm">
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
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Right Visual */}
        <motion.div
          className="relative h-96 sm:h-[500px] lg:h-full flex items-center justify-center"
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
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
                <motion.div
                  className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-background-200 to-background-100 backdrop-blur-2xl rounded-3xl"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <motion.div
                    className="text-center space-y-6"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
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
                  </motion.div>
                </motion.div>
              )}

              <div
                className={`text-center space-y-6 ${
                  !isCharging ? "hidden" : ""
                }`}
              >
                <motion.div
                  className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 border-2 border-primary/40 transition-transform animate-pulse"
                  whileHover={{ scale: 1.1 }}
                >
                  <FaBolt className="text-4xl text-primary" />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
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
                </motion.div>

                <motion.div
                  className="w-full space-y-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden border border-primary/20">
                    <motion.div
                      className="h-full bg-gradient-to-r from-primary via-secondary to-primary rounded-full"
                      style={{ width: `${(progress / 16) * 100}%` }}
                    ></motion.div>
                  </div>
                  <div className="flex justify-between items-center text-xs text-foreground/60">
                    <span>{isCharging ? "Charging..." : "Complete"}</span>
                    <span>{((progress / 16) * 100).toFixed(0)}%</span>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
