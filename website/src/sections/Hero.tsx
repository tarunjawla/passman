'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowDownIcon } from '@heroicons/react/24/outline'

export default function Hero() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        duration: 0.8,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
  }

  const highlightWords = (text: string, highlights: string[]) => {
    let result = text
    highlights.forEach((word, index) => {
      const colorClass = index % 2 === 0 ? 'text-primary' : 'text-secondary'
      result = result.replace(
        new RegExp(`\\b${word}\\b`, 'gi'),
        `<span class="neon-text ${colorClass}">${word}</span>`
      )
    })
    return result
  }

  return (
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-surface to-background opacity-50" />
      
      {/* Animated background particles */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-primary rounded-full"
            animate={{
              x: [0, Math.random() * 100, 0],
              y: [0, Math.random() * 100, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            } as React.CSSProperties}
          />
        ))}
      </div>

      <motion.div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h1
          className="font-orbitron text-4xl md:text-6xl lg:text-7xl font-bold mb-6"
          variants={itemVariants}
          transition={{ duration: 0.8, ease: "easeOut" }}
          dangerouslySetInnerHTML={{
            __html: highlightWords(
              'Unbreakable Security. Unlimited Control.',
              ['Unbreakable', 'Security', 'Unlimited', 'Control']
            ),
          }}
        />

        <motion.p
          className="text-xl md:text-2xl text-muted mb-8 max-w-3xl mx-auto leading-relaxed"
          variants={itemVariants}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          Store, generate, and manage your passwords{' '}
          <span className="text-primary font-semibold">locally</span> with{' '}
          <span className="text-secondary font-semibold">military-grade encryption</span>.
          Your data never leaves your device.
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
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-muted cursor-pointer"
          >
            <ArrowDownIcon className="h-6 w-6 mx-auto" />
            <p className="text-sm mt-2">Scroll to explore</p>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  )
}
