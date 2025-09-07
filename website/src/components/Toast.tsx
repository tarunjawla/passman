'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { CheckIcon, XMarkIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { useEffect } from 'react'

interface ToastProps {
  message: string
  type: 'success' | 'error' | 'warning'
  isVisible: boolean
  onClose: () => void
  duration?: number
}

const icons = {
  success: CheckIcon,
  error: XMarkIcon,
  warning: ExclamationTriangleIcon,
}

const colors = {
  success: 'border-green-500 text-green-400',
  error: 'border-red-500 text-red-400',
  warning: 'border-yellow-500 text-yellow-400',
}

export default function Toast({
  message,
  type,
  isVisible,
  onClose,
  duration = 3000,
}: ToastProps) {
  const Icon = icons[type]

  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(onClose, duration)
      return () => clearTimeout(timer)
    }
  }, [isVisible, duration, onClose])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.95 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className={`fixed top-20 right-4 z-50 glass-surface border-2 ${colors[type]} rounded-lg p-4 max-w-sm shadow-xl`}
          role="alert"
          aria-live="polite"
        >
          <div className="flex items-center space-x-3">
            <Icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
            <p className="text-sm font-medium text-white">{message}</p>
            <button
              onClick={onClose}
              className="text-muted hover:text-white transition-colors duration-200 p-1"
              aria-label="Close notification"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
