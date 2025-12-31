"use client";

import { motion } from "framer-motion";
import {
  FaBolt,
  FaShieldAlt,
  FaChartLine,
  FaLock,
  FaClock,
  FaUserShield
} from "react-icons/fa";

export default function FeaturesSection() {
  return (
    <section id="features" className="relative py-24 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-16 space-y-4"
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
              Powerful Features
            </span>
          </h2>
          <p className="text-foreground/70 text-lg max-w-2xl mx-auto">
            Everything you need for transparent, instant EV charging settlements
          </p>
        </motion.div>

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
              icon: FaUserShield,
              title: "Multi-Auth Support",
              description:
                "Sign in with Google or credentials. Demo accounts available for testing.",
            },
          ].map((feature, i) => (
            <motion.div
              key={i}
              className="relative group pt-12 flex flex-col items-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -10 }}
            >
              <motion.div
                className="absolute top-4 z-10"
                whileHover={{ scale: 1.2, rotate: 10 }}
              >
                <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center border-2 border-primary/30">
                  <feature.icon className="text-3xl text-primary" />
                </div>
              </motion.div>

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
                    className="text-xl font-semibold text-foreground mt-6"
                    style={{ fontFamily: "Conthrax, sans-serif" }}
                  >
                    {feature.title}
                  </h3>
                  <p className="text-foreground/70 leading-relaxed text-sm">
                    {feature.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
