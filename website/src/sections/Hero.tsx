"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowDownIcon } from "@heroicons/react/24/outline";

export default function Hero() {
  const scrollToNext = () => {
    const nextSection = document.querySelector("section:nth-of-type(2)");
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        duration: 0.8,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Professional gradient background */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-background via-surface to-background"
        animate={{
          background: [
            "linear-gradient(135deg, #000000 0%, #0a0a0a 50%, #000000 100%)",
            "linear-gradient(135deg, #000000 0%, #1a0a0a 50%, #000000 100%)",
            "linear-gradient(135deg, #000000 0%, #0a0a0a 50%, #000000 100%)",
          ],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      {/* Subtle floating elements */}
      <div className="absolute inset-0">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={`element-${i}`}
            className="absolute w-2 h-2 bg-primary/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.2, 0.6, 0.2],
            }}
            transition={{
              duration: 4 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <motion.div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Main Heading */}
        <motion.h1
          className="font-orbitron text-5xl md:text-6xl lg:text-7xl font-bold mb-6"
          variants={itemVariants}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <span className="text-white">Secure</span>{" "}
          <span className="text-primary">Password</span>{" "}
          <span className="text-white">Management</span>
        </motion.h1>

        <motion.p
          className="text-xl md:text-2xl text-muted mb-8 max-w-3xl mx-auto leading-relaxed"
          variants={itemVariants}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          Store, generate, and manage your passwords{" "}
          <span className="text-primary font-semibold">locally</span> with{" "}
          <span className="text-secondary font-semibold">
            military-grade encryption
          </span>
          . Your data never leaves your device.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
          variants={itemVariants}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <Link href="/download" className="btn-primary">
            Download Now
          </Link>
          <Link href="/about" className="btn-secondary">
            Learn More
          </Link>
        </motion.div>

        <motion.div
          className="flex justify-center"
          variants={itemVariants}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.button
            onClick={scrollToNext}
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-muted cursor-pointer hover:text-primary transition-colors duration-300 focus:outline-none focus:text-primary"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Scroll to next section"
          >
            <ArrowDownIcon className="h-6 w-6 mx-auto" />
            <p className="text-sm mt-2">Scroll to explore</p>
          </motion.button>
        </motion.div>
      </motion.div>
    </section>
  );
}
