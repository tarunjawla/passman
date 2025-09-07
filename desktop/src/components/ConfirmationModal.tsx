import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, X } from 'lucide-react'

interface ConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: 'danger' | 'warning' | 'info'
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger'
}) => {
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          icon: 'text-red-400',
          confirmButton: 'bg-red-600 hover:bg-red-700 text-white',
          iconBg: 'bg-red-500/20'
        }
      case 'warning':
        return {
          icon: 'text-yellow-400',
          confirmButton: 'bg-yellow-600 hover:bg-yellow-700 text-white',
          iconBg: 'bg-yellow-500/20'
        }
      case 'info':
        return {
          icon: 'text-blue-400',
          confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white',
          iconBg: 'bg-blue-500/20'
        }
    }
  }

  const styles = getTypeStyles()

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={handleBackdropClick}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative bg-surface border border-muted/20 rounded-2xl shadow-2xl max-w-md w-full"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-muted/20">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 ${styles.iconBg} rounded-full flex items-center justify-center`}>
                  <AlertTriangle className={`w-5 h-5 ${styles.icon}`} />
                </div>
                <h3 className="text-lg font-semibold text-white">{title}</h3>
              </div>
              <button
                onClick={onClose}
                className="p-1 text-muted hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <p className="text-muted leading-relaxed">{message}</p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-muted/20">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className="px-4 py-2 text-muted hover:text-white transition-colors duration-200"
              >
                {cancelText}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onConfirm}
                className={`px-6 py-2 rounded-lg font-medium transition-colors duration-200 ${styles.confirmButton}`}
              >
                {confirmText}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default ConfirmationModal
