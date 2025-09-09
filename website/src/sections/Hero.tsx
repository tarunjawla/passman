'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowDownIcon } from '@heroicons/react/24/outline'
import { useRef } from 'react'

export default function Hero() {
  const scrollToNext = () => {
    const nextSection = document.querySelector('section:nth-of-type(2)')
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

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
      {/* Security-themed gradient background */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-br from-background via-surface to-background"
        animate={{
          background: [
            "linear-gradient(135deg, #000000 0%, #0a0a0a 50%, #000000 100%)",
            "linear-gradient(135deg, #000000 0%, #1a0a0a 50%, #000000 100%)",
            "linear-gradient(135deg, #000000 0%, #0a0a0a 50%, #000000 100%)",
          ]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      
      {/* Matrix-style digital rain */}
      <div className="absolute inset-0 opacity-30">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={`rain-${i}`}
            className="absolute text-green-400 font-mono text-xs"
            style={{
              left: `${i * 5}%`,
              top: '-100px',
            }}
            animate={{
              y: ['-100px', '100vh'],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "linear",
            }}
          >
            {Array.from({ length: 20 }, (_, j) => (
              <div key={j} className="opacity-60">
                {Math.random() > 0.5 ? '1' : '0'}
              </div>
            ))}
          </motion.div>
        ))}
      </div>

      {/* Security grid pattern */}
      <div className="absolute inset-0 opacity-10">
        <motion.div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0, 255, 0, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 255, 0, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '30px 30px',
          }}
          animate={{
            backgroundPosition: ['0px 0px', '30px 30px', '0px 0px'],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>

      {/* Floating password characters */}
      <div className="absolute inset-0">
        {[...Array(15)].map((_, i) => {
          const chars = ['*', '#', '@', '$', '%', '&', '!', '?', '=', '+', '-', '_', '|', '~', '^']
          const char = chars[Math.floor(Math.random() * chars.length)]
          const colors = ['text-red-400', 'text-yellow-400', 'text-green-400', 'text-blue-400']
          const colorClass = colors[Math.floor(Math.random() * colors.length)]
          
          return (
            <motion.div
              key={`char-${i}`}
              className={`absolute font-mono text-2xl ${colorClass} opacity-60`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                x: [0, Math.random() * 200 - 100, 0],
                y: [0, Math.random() * 200 - 100, 0],
                rotate: [0, 360],
                scale: [0.5, 1.5, 0.5],
                opacity: [0, 0.8, 0],
              }}
              transition={{
                duration: 6 + Math.random() * 4,
                repeat: Infinity,
                delay: Math.random() * 3,
                ease: "easeInOut",
              }}
            >
              {char}
            </motion.div>
          )
        })}
      </div>

      {/* Data breach warning indicators */}
      <div className="absolute inset-0">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={`warning-${i}`}
            className="absolute border-2 border-red-500 rounded-lg"
            style={{
              width: 40 + Math.random() * 60,
              height: 20 + Math.random() * 30,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0.8, 1.2, 0.8],
              borderColor: ['rgba(239, 68, 68, 0.3)', 'rgba(239, 68, 68, 0.8)', 'rgba(239, 68, 68, 0.3)'],
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

      {/* Encryption key symbols */}
      <div className="absolute inset-0">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={`key-${i}`}
            className="absolute text-blue-400 font-mono text-lg"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              x: [0, Math.random() * 150 - 75, 0],
              y: [0, Math.random() * 150 - 75, 0],
              rotate: [0, 180, 360],
              opacity: [0, 0.7, 0],
            }}
            transition={{
              duration: 8 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 3,
              ease: "easeInOut",
            }}
          >
            {i % 3 === 0 ? '🔐' : i % 3 === 1 ? '🔑' : '🛡️'}
          </motion.div>
        ))}
      </div>

      {/* Hacking attempt indicators */}
      <div className="absolute inset-0">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={`hack-${i}`}
            className="absolute h-px bg-gradient-to-r from-transparent via-red-500 to-transparent"
            style={{
              width: 100 + Math.random() * 200,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              transform: `rotate(${Math.random() * 360}deg)`,
            }}
            animate={{
              x: [0, Math.random() * 300 - 150, 0],
              y: [0, Math.random() * 300 - 150, 0],
              opacity: [0, 1, 0],
              scaleX: [0, 1, 0],
            }}
            transition={{
              duration: 5 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Security scan lines */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute w-full h-1 bg-gradient-to-r from-transparent via-green-400 to-transparent opacity-60"
          animate={{
            y: ['0vh', '100vh'],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
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
  )
}
