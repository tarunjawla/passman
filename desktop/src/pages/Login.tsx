import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Shield, Eye, EyeOff, Lock, AlertCircle } from 'lucide-react'
import { invoke } from '@tauri-apps/api/core'
import { LoginFormData } from '../types'

interface LoginProps {
  onAuthenticated: () => void
}

const Login: React.FC<LoginProps> = ({ onAuthenticated }) => {
  const [formData, setFormData] = useState<LoginFormData>({
    master_password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.master_password) {
      setError('Master password is required')
      return
    }

    setIsLoading(true)
    setError('')
    
    try {
      // Call the Tauri command to verify password
      const isValid = await invoke<boolean>('verify_password', { masterPassword: formData.master_password })
      
      if (isValid) {
        onAuthenticated()
      } else {
        setError('Invalid master password. Please try again.')
      }
    } catch (error) {
      console.error('Authentication error:', error)
      setError('Invalid master password. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center mx-auto mb-4"
          >
            <Shield className="w-8 h-8 text-black" />
          </motion.div>
          <h1 className="text-3xl font-bold font-orbitron text-white mb-2">
            Unlock PassMan
          </h1>
          <p className="text-muted">
            Enter your master password to access your vault
          </p>
        </div>

        {/* Login Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* Master Password */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Master Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.master_password}
                onChange={(e) => setFormData({ ...formData, master_password: e.target.value })}
                className="input-field w-full pr-12"
                placeholder="Enter your master password"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted hover:text-white"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/10 border border-red-500/20 rounded-lg p-4"
            >
              <div className="flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <p className="text-sm text-red-400">{error}</p>
              </div>
            </motion.div>
          )}

          {/* Security Notice */}
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Lock className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-green-400 mb-1">Your Data is Secure</h4>
                <p className="text-xs text-green-300">
                  All your passwords are encrypted locally. Your master password never leaves your device.
                </p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                <span>Unlocking...</span>
              </>
            ) : (
              <>
                <Lock className="w-5 h-5" />
                <span>Unlock Vault</span>
              </>
            )}
          </motion.button>
        </motion.form>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-8"
        >
          <p className="text-xs text-muted">
            Forgot your master password? Your vault cannot be recovered.
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default Login
