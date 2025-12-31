"use client";

import { motion } from "framer-motion";

export default function AboutSection() {
  return (
    <section id="about" className="relative px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          className="bg-gradient-to-br from-background-100/50 to-background-200/50 border border-primary/20 rounded-3xl p-8 sm:p-12 backdrop-blur-xl"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          whileHover={{ borderColor: "var(--color-primary)" }}
        >
          <h2
            className="text-4xl font-bold mb-6 text-center md:text-left"
            style={{ fontFamily: "Conthrax, sans-serif" }}
          >
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              About RupeeFlow
            </span>
          </h2>
          <motion.p
            className="text-foreground/80 text-lg leading-relaxed mb-6"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          >
            RupeeFlow is a next-generation EV charging platform that leverages
            blockchain technology to provide transparent, instant settlements
            for electric vehicle charging sessions.
          </motion.p>
          <motion.p
            className="text-foreground/80 text-lg leading-relaxed mb-6"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Built with cutting-edge technology including Next.js, ethers.js, and
            Polygon blockchain, RupeeFlow eliminates intermediaries and ensures
            every transaction is recorded permanently on the blockchain for
            complete transparency.
          </motion.p>
          <motion.p
            className="text-foreground/80 text-lg leading-relaxed"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
          >
            Whether you're an EV owner looking for transparent charging costs or
            a station operator wanting to manage your business efficiently,
            RupeeFlow has you covered.
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}
