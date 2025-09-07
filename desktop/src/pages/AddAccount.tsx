import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Save, Eye, EyeOff, Key, RefreshCw } from 'lucide-react'
import { AccountFormData, AccountType, PasswordOptions } from '../types'
import { invoke } from '@tauri-apps/api/core'
import ErrorModal from '../components/ErrorModal'

const AddAccount: React.FC = () => {
  const [formData, setFormData] = useState<AccountFormData>({
    name: '',
    account_type: AccountType.Personal,
    url: '',
    username: '',
    password: '',
    notes: '',
    tags: []
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [errorModal, setErrorModal] = useState<{
    isOpen: boolean
    title: string
    message: string
    type: 'error' | 'success' | 'warning' | 'info'
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'error'
  })
  const [passwordOptions, setPasswordOptions] = useState<PasswordOptions>({
    length: 16,
    include_uppercase: true,
    include_lowercase: true,
    include_numbers: true,
    include_special: true,
    exclude_similar: false,
    exclude_ambiguous: false
  })

  const generatePassword = async () => {
    setIsGenerating(true)
    try {
      // Call the Tauri command to generate password
      const password = await invoke<string>('generate_password', {
        length: passwordOptions.length,
        includeUppercase: passwordOptions.include_uppercase,
        includeLowercase: passwordOptions.include_lowercase,
        includeNumbers: passwordOptions.include_numbers,
        includeSpecial: passwordOptions.include_special,
        excludeSimilar: passwordOptions.exclude_similar,
        excludeAmbiguous: passwordOptions.exclude_ambiguous
      })
      setFormData({ ...formData, password })
    } catch (error) {
      console.error('Error generating password:', error)
      // Fallback to a simple generated password if Tauri command fails
      const fallbackPassword = generateFallbackPassword()
      setFormData({ ...formData, password: fallbackPassword })
      setErrorModal({
        isOpen: true,
        title: 'Warning',
        message: 'Using fallback password generator. Backend generation failed.',
        type: 'warning'
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const generateFallbackPassword = () => {
    const length = passwordOptions.length
    const charset = []
    
    if (passwordOptions.include_lowercase) charset.push('abcdefghijklmnopqrstuvwxyz')
    if (passwordOptions.include_uppercase) charset.push('ABCDEFGHIJKLMNOPQRSTUVWXYZ')
    if (passwordOptions.include_numbers) charset.push('0123456789')
    if (passwordOptions.include_special) charset.push('!@#$%^&*()_+-=[]{}|;:,.<>?')
    
    const allChars = charset.join('')
    let password = ''
    
    for (let i = 0; i < length; i++) {
      password += allChars.charAt(Math.floor(Math.random() * allChars.length))
    }
    
    return password
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    
    try {
      // Call the Tauri command to add account
      await invoke('add_account', {
        name: formData.name,
        accountType: formData.account_type,
        password: formData.password,
        url: formData.url || null,
        username: formData.username || null,
        notes: formData.notes || null,
        tags: formData.tags
      })
      
      // Reset form
      setFormData({
        name: '',
        account_type: AccountType.Personal,
        url: '',
        username: '',
        password: '',
        notes: '',
        tags: []
      })
      
      setErrorModal({
        isOpen: true,
        title: 'Success',
        message: 'Account added successfully!',
        type: 'success'
      })
    } catch (error) {
      console.error('Error adding account:', error)
      setErrorModal({
        isOpen: true,
        title: 'Error',
        message: `Failed to add account: ${error}`,
        type: 'error'
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold font-orbitron text-white mb-2">Add New Account</h1>
        <p className="text-muted">Store a new password securely in your vault</p>
      </motion.div>

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        {/* Basic Information */}
        <div className="card">
          <h2 className="text-lg font-semibold text-white mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Account Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input-field w-full"
                placeholder="e.g., GitHub, Gmail"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Account Type
              </label>
              <select
                value={formData.account_type}
                onChange={(e) => setFormData({ ...formData, account_type: e.target.value as AccountType })}
                className="input-field w-full"
              >
                <option value={AccountType.Personal}>Personal</option>
                <option value={AccountType.Work}>Work</option>
                <option value={AccountType.Banking}>Banking</option>
                <option value={AccountType.Social}>Social</option>
                <option value={AccountType.Other}>Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Login Details */}
        <div className="card">
          <h2 className="text-lg font-semibold text-white mb-4">Login Details</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Website URL
              </label>
              <input
                type="url"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                className="input-field w-full"
                placeholder="https://example.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Username/Email
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="input-field w-full"
                placeholder="your@email.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Password *
              </label>
              <div className="flex space-x-2">
                <div className="flex-1 relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="input-field w-full pr-12"
                    placeholder="Enter or generate a password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={generatePassword}
                  disabled={isGenerating}
                  className="btn-secondary flex items-center space-x-2 disabled:opacity-50"
                >
                  {isGenerating ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Key className="w-4 h-4" />
                  )}
                  <span>Generate</span>
                </motion.button>
              </div>
            </div>
          </div>
        </div>

        {/* Password Generator Options */}
        <div className="card">
          <h2 className="text-lg font-semibold text-white mb-4">Password Generator Options</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Length
              </label>
              <input
                type="number"
                min="4"
                max="128"
                value={passwordOptions.length}
                onChange={(e) => setPasswordOptions({ ...passwordOptions, length: parseInt(e.target.value) })}
                className="input-field w-full"
              />
            </div>
            
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={passwordOptions.include_uppercase}
                  onChange={(e) => setPasswordOptions({ ...passwordOptions, include_uppercase: e.target.checked })}
                  className="rounded border-muted/20"
                />
                <span className="text-sm text-white">Uppercase</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={passwordOptions.include_lowercase}
                  onChange={(e) => setPasswordOptions({ ...passwordOptions, include_lowercase: e.target.checked })}
                  className="rounded border-muted/20"
                />
                <span className="text-sm text-white">Lowercase</span>
              </label>
            </div>
            
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={passwordOptions.include_numbers}
                  onChange={(e) => setPasswordOptions({ ...passwordOptions, include_numbers: e.target.checked })}
                  className="rounded border-muted/20"
                />
                <span className="text-sm text-white">Numbers</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={passwordOptions.include_special}
                  onChange={(e) => setPasswordOptions({ ...passwordOptions, include_special: e.target.checked })}
                  className="rounded border-muted/20"
                />
                <span className="text-sm text-white">Special</span>
              </label>
            </div>
            
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={passwordOptions.exclude_similar}
                  onChange={(e) => setPasswordOptions({ ...passwordOptions, exclude_similar: e.target.checked })}
                  className="rounded border-muted/20"
                />
                <span className="text-sm text-white">Exclude Similar</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={passwordOptions.exclude_ambiguous}
                  onChange={(e) => setPasswordOptions({ ...passwordOptions, exclude_ambiguous: e.target.checked })}
                  className="rounded border-muted/20"
                />
                <span className="text-sm text-white">Exclude Ambiguous</span>
              </label>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="card">
          <h2 className="text-lg font-semibold text-white mb-4">Additional Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="input-field w-full h-24 resize-none"
                placeholder="Any additional notes about this account..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Tags
              </label>
              <input
                type="text"
                value={formData.tags.join(', ')}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag) })}
                className="input-field w-full"
                placeholder="work, important, 2fa (comma-separated)"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            className="px-6 py-3 text-muted hover:text-white transition-colors duration-200"
          >
            Cancel
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isSaving}
            className="btn-primary flex items-center space-x-2 disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                <span>Save Account</span>
              </>
            )}
          </motion.button>
        </div>
      </motion.form>

      {/* Error Modal */}
      <ErrorModal
        isOpen={errorModal.isOpen}
        onClose={() => setErrorModal({ ...errorModal, isOpen: false })}
        title={errorModal.title}
        message={errorModal.message}
        type={errorModal.type}
      />
    </div>
  )
}

export default AddAccount
