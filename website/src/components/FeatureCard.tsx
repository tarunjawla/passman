'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface FeatureCardProps {
  icon: ReactNode
  title: string
  description: string
  color?: string
  delay?: number
}

export default function FeatureCard({
  icon,
  title,
  description,
  color = 'text-primary',
  delay = 0,
}: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
      whileHover={{ y: -5, scale: 1.02 }}
      className="feature-card group cursor-pointer"
      role="article"
      tabIndex={0}
    >
      <div className="flex items-center mb-4">
        <div className={`p-2 rounded-lg bg-surface/50 ${color}`} aria-hidden="true">
          {icon}
        </div>
        <h3 className="font-orbitron text-lg font-semibold ml-3 group-hover:text-primary transition-colors duration-300">
          {title}
        </h3>
      </div>
      <p className="text-muted leading-relaxed">
        {description}
      </p>
    </motion.div>
  )
}
