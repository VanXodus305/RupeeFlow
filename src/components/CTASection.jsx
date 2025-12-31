"use client";

import Link from "next/link";
import { Button } from "@heroui/react";
import { motion } from "framer-motion";

export default function CTASection() {
  return (
    <section className="relative py-24 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto text-center space-y-8">
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl sm:text-5xl font-bold">
            Ready to <span className="text-primary">charge smart?</span>
          </h2>
          <p className="text-foreground/70 text-lg">
            Join thousands of users enjoying transparent, blockchain-backed EV
            charging
          </p>
        </motion.div>
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              as={Link}
              href="/login"
              className="bg-gradient-to-r from-primary to-primary/80 text-background-200 font-semibold text-lg px-8 py-6 hover:shadow-lg hover:shadow-primary/50 transition-all duration-200"
              radius="full"
            >
              Get Started Free
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
