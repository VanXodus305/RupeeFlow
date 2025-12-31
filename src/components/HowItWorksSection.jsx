"use client";

import { motion } from "framer-motion";

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="relative sm:pt-24 pb-24 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          className="text-center mb-10 space-y-4"
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
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
        </motion.div>

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
              <motion.div
                key={i}
                className={`flex items-center gap-4 md:gap-8 ${
                  step.side === "left" ? "md:flex-row" : "md:flex-row-reverse"
                }`}
                initial={{ opacity: 0, x: step.side === "left" ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                viewport={{ once: true }}
              >
                {/* Card - Desktop */}
                <motion.div
                  className="hidden md:block flex-1"
                  whileHover={{ y: -5 }}
                >
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
                </motion.div>

                {/* Timeline Circle */}
                <motion.div
                  className="flex-shrink-0 relative z-10 h-full"
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: i * 0.15 + 0.2 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.15 }}
                >
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-background-100 via-primary to-background-100 flex items-center justify-center border-4 border-background-200 shadow-lg shadow-primary/50">
                    <span
                      className="text-xl md:text-2xl font-bold text-background-200"
                      style={{ fontFamily: "Conthrax, sans-serif" }}
                    >
                      {step.number}
                    </span>
                  </div>
                </motion.div>

                {/* Card - Mobile */}
                <motion.div className="flex-1 md:hidden" whileHover={{ y: -5 }}>
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
                </motion.div>

                {/* Empty Space for Alternating Layout - Desktop Only */}
                <div className="hidden md:block flex-1"></div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
