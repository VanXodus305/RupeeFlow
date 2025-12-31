"use client";

import {
  FaBolt,
  FaShieldAlt,
  FaChartLine,
  FaLock,
  FaClock,
} from "react-icons/fa";

export default function FeaturesSection() {
  return (
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
            Everything you need for transparent, instant EV charging settlements
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
  );
}
