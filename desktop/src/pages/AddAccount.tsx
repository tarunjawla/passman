import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Save, Eye, EyeOff, Key, RefreshCw } from 'lucide-react'
import { AccountFormData, AccountType, PasswordOptions } from '../types'

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
      // This would call the Tauri command to generate password
      // const password = await invoke('generate_password', passwordOptions)
      
      // Mock password generation
      const mockPassword = 'GeneratedPassword123!@#'
      setFormData({ ...formData, password: mockPassword })
    } catch (error) {
      console.error('Error generating password:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    
    try {
      // This would call the Tauri command to add account
      // await invoke('add_account', formData)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
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
    } catch (error) {
      console.error('Error adding account:', error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
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
                className="input-field w-full bg-surface text-white border-muted/20 focus:border-primary focus:outline-none"
              >
                <option value={AccountType.Personal} className="bg-surface text-white">Personal</option>
                <option value={AccountType.Work} className="bg-surface text-white">Work</option>
                <option value={AccountType.Banking} className="bg-surface text-white">Banking</option>
                <option value={AccountType.Social} className="bg-surface text-white">Social</option>
                <option value={AccountType.Other} className="bg-surface text-white">Other</option>
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
    </div>
  )
}

export default AddAccount
