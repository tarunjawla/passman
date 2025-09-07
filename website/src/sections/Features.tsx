'use client'

import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import {
  ShieldCheckIcon,
  CommandLineIcon,
  GlobeAltIcon,
  ServerIcon,
  KeyIcon,
  CpuChipIcon,
} from '@heroicons/react/24/outline'

const features = [
  {
    name: 'Military-Grade Security',
    description:
      'AES-GCM encryption with Argon2 key derivation ensures your passwords are protected with industry-leading security standards.',
    icon: ShieldCheckIcon,
    color: 'text-primary',
  },
  {
    name: 'CLI Interface',
    description:
      'Powerful command-line interface for developers and power users who prefer terminal-based password management.',
    icon: CommandLineIcon,
    color: 'text-secondary',
  },
  {
    name: 'Cross-Platform',
    description:
      'Works seamlessly on Linux, macOS, and Windows. One codebase, universal compatibility.',
    icon: GlobeAltIcon,
    color: 'text-primary',
  },
  {
    name: 'Local-Only Storage',
    description:
      'Your data never leaves your device. No cloud sync, no tracking, complete privacy and control.',
    icon: ServerIcon,
    color: 'text-secondary',
  },
  {
    name: 'Strong Password Generation',
    description:
      'Built-in secure password generator creates strong, unique passwords with customizable complexity.',
    icon: KeyIcon,
    color: 'text-primary',
  },
  {
    name: 'Written in Rust',
    description:
      'Built with Rust for memory safety, performance, and reliability. Zero-cost abstractions with maximum security.',
    icon: CpuChipIcon,
    color: 'text-secondary',
  },
]

export default function Features() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-surface/30">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="font-orbitron text-3xl md:text-4xl font-bold mb-4">
            Why Choose{' '}
            <span className="text-primary">PassMan</span>?
          </h2>
          <p className="text-muted text-lg max-w-3xl mx-auto">
            Built with security, privacy, and performance in mind. PassMan offers
            enterprise-grade features in a simple, elegant package.
          </p>
        </motion.div>

        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.name}
              variants={itemVariants}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="feature-card group"
              whileHover={{ y: -5 }}
            >
              <div className="flex items-center mb-4">
                <div className={`p-2 rounded-lg bg-surface/50 ${feature.color}`}>
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="font-orbitron text-lg font-semibold ml-3 group-hover:text-primary transition-colors duration-300">
                  {feature.name}
                </h3>
              </div>
              <p className="text-muted leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 1 }}
          className="text-center mt-16"
        >
          <div className="glass-surface rounded-2xl p-8 max-w-2xl mx-auto">
            <h3 className="font-orbitron text-2xl font-bold mb-4">
              Ready to Secure Your Passwords?
            </h3>
            <p className="text-muted mb-6">
              Join thousands of users who trust PassMan to keep their digital
              lives secure and organized.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.a
                href="/download"
                className="btn-primary"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Get Started Free
              </motion.a>
              <motion.a
                href="https://github.com/tarunjawla/passman"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                View on GitHub
              </motion.a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
