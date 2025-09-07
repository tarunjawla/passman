import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, AlertCircle, CheckCircle, Info, ShieldOff } from 'lucide-react'

interface ErrorModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  message: string
  type?: 'error' | 'success' | 'warning' | 'info'
}

const ErrorModal: React.FC<ErrorModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  type = 'error'
}) => {
  const getIcon = () => {
    switch (type) {
      case 'error':
        return <ShieldOff className="w-8 h-8 text-red-400" />
      case 'success':
        return <CheckCircle className="w-8 h-8 text-green-400" />
      case 'warning':
        return <AlertCircle className="w-8 h-8 text-yellow-400" />
      case 'info':
      default:
        return <Info className="w-8 h-8 text-blue-400" />
    }
  }

  const getHeaderClass = () => {
    switch (type) {
      case 'error':
        return 'bg-red-500/20'
      case 'success':
        return 'bg-green-500/20'
      case 'warning':
        return 'bg-yellow-500/20'
      case 'info':
      default:
        return 'bg-blue-500/20'
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-surface border border-muted/20 rounded-lg shadow-xl w-full max-w-md p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-muted hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-4 mb-6">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getHeaderClass()}`}>
                {getIcon()}
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">{title}</h3>
              </div>
            </div>

            <p className="text-muted mb-8">{message}</p>

            <div className="flex justify-end">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className="btn-primary"
              >
                OK
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default ErrorModal
