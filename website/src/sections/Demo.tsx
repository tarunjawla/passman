'use client'

import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import Image from 'next/image'

export default function Demo() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.3,
  })

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="font-orbitron text-3xl md:text-4xl font-bold mb-4">
            See PassMan in{' '}
            <span className="text-primary">Action</span>
          </h2>
          <p className="text-muted text-lg max-w-2xl mx-auto">
            Experience the intuitive interface and powerful features that make
            password management effortless and secure.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="relative max-w-5xl mx-auto"
        >
          <div className="glass-surface rounded-2xl p-2 shadow-2xl">
            <div className="relative aspect-video rounded-xl overflow-hidden">
              <Image
                src="https://placehold.co/1200x600/0b0b0b/4fe3c4/png?text=PassMan+Demo+Preview"
                alt="PassMan Demo"
                fill
                className="object-cover"
                priority
              />
              
              {/* Play button overlay */}
              <motion.div
                className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors duration-300 cursor-pointer group"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="w-20 h-20 bg-primary/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:bg-primary/30 transition-colors duration-300">
                  <svg
                    className="w-8 h-8 text-primary ml-1"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Floating feature badges */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="absolute -left-4 top-1/4 hidden lg:block"
          >
            <div className="glass-surface px-4 py-2 rounded-full">
              <span className="text-sm font-semibold text-primary">
                🔒 AES-256 Encryption
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="absolute -right-4 top-3/4 hidden lg:block"
          >
            <div className="glass-surface px-4 py-2 rounded-full">
              <span className="text-sm font-semibold text-secondary">
                ⚡ Lightning Fast
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 1 }}
            className="absolute left-1/2 -bottom-4 transform -translate-x-1/2 hidden md:block"
          >
            <div className="glass-surface px-4 py-2 rounded-full">
              <span className="text-sm font-semibold text-primary">
                🌍 Cross-Platform
              </span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
