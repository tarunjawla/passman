import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Shield, Eye, EyeOff, CheckCircle } from 'lucide-react'
import { invoke } from '@tauri-apps/api/core'
import { SetupFormData } from '../types'

interface SetupProps {
  onVaultCreated: () => void
}

const Setup: React.FC<SetupProps> = ({ onVaultCreated }) => {
  const [formData, setFormData] = useState<SetupFormData>({
    email: '',
    master_password: '',
    confirm_password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Partial<SetupFormData>>({})

  const validateForm = (): boolean => {
    const newErrors: Partial<SetupFormData> = {}

    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
    }

    if (!formData.master_password) {
      newErrors.master_password = 'Master password is required'
    } else if (formData.master_password.length < 8) {
      newErrors.master_password = 'Password must be at least 8 characters'
    }

    if (formData.master_password !== formData.confirm_password) {
      newErrors.confirm_password = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsLoading(true)
    try {
      // Call the Tauri command to create account (fixed parameter naming - v2)
      const params = { 
        email: formData.email, 
        masterPassword: formData.master_password 
      }
      console.log('Sending parameters:', params)
      await invoke('create_account', params)
      
      onVaultCreated()
    } catch (error) {
      console.error('Error creating account:', error)
      setErrors({ master_password: 'Failed to create account. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  const getPasswordStrength = (password: string): number => {
    let strength = 0
    if (password.length >= 8) strength += 20
    if (password.length >= 12) strength += 20
    if (/[A-Z]/.test(password)) strength += 20
    if (/[a-z]/.test(password)) strength += 20
    if (/[0-9]/.test(password)) strength += 10
    if (/[^A-Za-z0-9]/.test(password)) strength += 10
    return strength
  }

  const passwordStrength = getPasswordStrength(formData.master_password)

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
            Setup PassMan
          </h1>
          <p className="text-muted">
            Set up your secure password manager
          </p>
        </div>

        {/* Setup Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="input-field w-full"
              placeholder="your@email.com"
            />
            {errors.email && (
              <p className="text-red-400 text-sm mt-1">{errors.email}</p>
            )}
          </div>

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
                placeholder="Create a strong master password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted hover:text-white"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            
            {/* Password Strength Indicator */}
            {formData.master_password && (
              <div className="mt-2">
                <div className="flex items-center space-x-2 mb-1">
                  <div className="flex-1 bg-muted/20 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        passwordStrength < 40 ? 'bg-red-500' :
                        passwordStrength < 70 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${passwordStrength}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted">{passwordStrength}%</span>
                </div>
                <p className="text-xs text-muted">
                  {passwordStrength < 40 ? 'Weak' :
                   passwordStrength < 70 ? 'Medium' : 'Strong'} password
                </p>
              </div>
            )}
            
            {errors.master_password && (
              <p className="text-red-400 text-sm mt-1">{errors.master_password}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Confirm Master Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirm_password}
                onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                className="input-field w-full pr-12"
                placeholder="Confirm your master password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted hover:text-white"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.confirm_password && (
              <p className="text-red-400 text-sm mt-1">{errors.confirm_password}</p>
            )}
          </div>

          {/* Security Notice */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-blue-400 mb-1">Security Notice</h4>
                <p className="text-xs text-blue-300">
                  Your master password is used to secure your account. We cannot recover it if you forget it.
                  Make sure to choose a strong, memorable password.
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
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                <span>Create Account</span>
              </>
            )}
          </motion.button>
        </motion.form>
      </motion.div>
    </div>
  )
}

export default Setup
