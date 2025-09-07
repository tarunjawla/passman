import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Shield, Eye, EyeOff, Lock, AlertCircle } from 'lucide-react'
import { invoke } from '@tauri-apps/api/core'
import { LoginFormData } from '../types'
import { useAuth } from '../contexts/AuthContext'

interface LoginProps {
  onAuthenticated: () => void
}

const Login: React.FC<LoginProps> = ({ onAuthenticated }) => {
  const { setMasterPassword } = useAuth()
  const [formData, setFormData] = useState<LoginFormData>({
    master_password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showResetModal, setShowResetModal] = useState(false)
  const [isResetting, setIsResetting] = useState(false)

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
      const isValid = await invoke<boolean>('verify_password', { master_password: formData.master_password })
      
      if (isValid) {
        // Store the master password in context
        setMasterPassword(formData.master_password)
        // Open the vault after successful authentication
        await invoke('open_vault', { master_password: formData.master_password })
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

  const handleReset = async () => {
    setIsResetting(true)
    try {
      // Call a Tauri command to reset all configuration
      await invoke('reset_passman')
      setShowResetModal(false)
      setError('')
      // Reload the page to go back to setup
      window.location.reload()
    } catch (error) {
      console.error('Error resetting PassMan:', error)
      setError('Failed to reset PassMan. Please try again.')
    } finally {
      setIsResetting(false)
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

          {/* Reset Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={() => setShowResetModal(true)}
            className="w-full mt-4 text-sm text-muted hover:text-red-400 transition-colors duration-200 underline"
          >
            Forgot password? Reset PassMan
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

        {/* Reset Confirmation Modal */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: showResetModal ? 1 : 0 }}
          className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm ${showResetModal ? 'block' : 'hidden'}`}
          onClick={() => setShowResetModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: showResetModal ? 1 : 0.9, opacity: showResetModal ? 1 : 0 }}
            className="bg-surface border border-muted/20 rounded-lg shadow-xl w-full max-w-md p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Reset PassMan</h3>
                <p className="text-sm text-muted">This will delete all your data</p>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-muted mb-4">
                This action will permanently delete:
              </p>
              <ul className="text-sm text-muted space-y-2 mb-4">
                <li>• All stored passwords and accounts</li>
                <li>• Your master password</li>
                <li>• All vault data and settings</li>
              </ul>
              <p className="text-red-400 font-medium">
                This action cannot be undone!
              </p>
            </div>

            <div className="flex justify-end space-x-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowResetModal(false)}
                className="px-6 py-3 text-muted hover:text-white transition-colors duration-200 rounded-md"
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleReset}
                disabled={isResetting}
                className="btn-danger flex items-center space-x-2 disabled:opacity-50"
              >
                {isResetting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Resetting...</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4" />
                    <span>Reset PassMan</span>
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default Login
