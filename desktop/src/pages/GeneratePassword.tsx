import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Key, 
  Copy, 
  RefreshCw, 
  Eye, 
  EyeOff, 
  Check, 
  X,
  Settings,
  Zap,
  Shield,
  Lock
} from 'lucide-react'

interface PasswordOptions {
  length: number
  includeUppercase: boolean
  includeLowercase: boolean
  includeNumbers: boolean
  includeSpecial: boolean
  excludeSimilar: boolean
  excludeAmbiguous: boolean
}

interface PasswordStrength {
  score: number
  description: string
  color: string
}

export default function GeneratePassword() {
  const [password, setPassword] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [copied, setCopied] = useState(false)
  const [strength, setStrength] = useState<PasswordStrength>({ score: 0, description: '', color: '' })
  
  const [options, setOptions] = useState<PasswordOptions>({
    length: 16,
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSpecial: true,
    excludeSimilar: true,
    excludeAmbiguous: false
  })

  const [presets] = useState([
    { name: 'Basic', options: { length: 12, includeUppercase: true, includeLowercase: true, includeNumbers: true, includeSpecial: false, excludeSimilar: false, excludeAmbiguous: false } },
    { name: 'Strong', options: { length: 16, includeUppercase: true, includeLowercase: true, includeNumbers: true, includeSpecial: true, excludeSimilar: true, excludeAmbiguous: false } },
    { name: 'Maximum', options: { length: 24, includeUppercase: true, includeLowercase: true, includeNumbers: true, includeSpecial: true, excludeSimilar: true, excludeAmbiguous: true } }
  ])

  useEffect(() => {
    generatePassword()
  }, [])

  const generatePassword = async () => {
    setIsGenerating(true)
    try {
      // This would call a Tauri command to generate password
      // For now, we'll simulate it
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Generate a simple password for demo
      const chars = getCharacterSet()
      let generated = ''
      for (let i = 0; i < options.length; i++) {
        generated += chars[Math.floor(Math.random() * chars.length)]
      }
      
      setPassword(generated)
      calculateStrength(generated)
    } catch (error) {
      console.error('Error generating password:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const getCharacterSet = () => {
    let chars = ''
    if (options.includeLowercase) chars += 'abcdefghijklmnopqrstuvwxyz'
    if (options.includeUppercase) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    if (options.includeNumbers) chars += '0123456789'
    if (options.includeSpecial) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?'
    
    if (options.excludeSimilar) {
      chars = chars.replace(/[il1Lo0O]/g, '')
    }
    if (options.excludeAmbiguous) {
      chars = chars.replace(/[{}[\]()\/\\'"~,;.<>]/g, '')
    }
    
    return chars
  }

  const calculateStrength = (pwd: string) => {
    let score = 0
    let description = ''
    let color = ''

    if (pwd.length >= 8) score += 1
    if (pwd.length >= 12) score += 1
    if (pwd.length >= 16) score += 1
    if (/[a-z]/.test(pwd)) score += 1
    if (/[A-Z]/.test(pwd)) score += 1
    if (/[0-9]/.test(pwd)) score += 1
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1

    if (score <= 2) {
      description = 'Very Weak'
      color = 'text-red-500'
    } else if (score <= 4) {
      description = 'Weak'
      color = 'text-orange-500'
    } else if (score <= 6) {
      description = 'Good'
      color = 'text-yellow-500'
    } else {
      description = 'Strong'
      color = 'text-green-500'
    }

    setStrength({ score, description, color })
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(password)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy password:', error)
    }
  }

  const applyPreset = (preset: typeof presets[0]) => {
    setOptions(prev => ({ ...prev, ...preset.options }))
  }

  const handleOptionChange = (key: keyof PasswordOptions, value: any) => {
    setOptions(prev => ({ ...prev, [key]: value }))
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="max-w-4xl mx-auto"
    >
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Key className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">Password Generator</h1>
        </div>
        <p className="text-muted">Generate secure, customizable passwords for your accounts.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Password Display */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-surface rounded-xl p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-semibold">Generated Password</h2>
          </div>

          <div className="space-y-4">
            {/* Password Display */}
            <div className="relative">
              <div className="flex items-center gap-3 p-4 bg-surface border border-border rounded-lg">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  readOnly
                  className="flex-1 bg-transparent text-white text-lg font-mono"
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
                <button
                  onClick={copyToClipboard}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Password Strength */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Strength</span>
                <span className={`text-sm font-medium ${strength.color}`}>
                  {strength.description}
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    strength.score <= 2 ? 'bg-red-500' :
                    strength.score <= 4 ? 'bg-orange-500' :
                    strength.score <= 6 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${(strength.score / 8) * 100}%` }}
                />
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={generatePassword}
              disabled={isGenerating}
              className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  Generate New Password
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* Password Options */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-surface rounded-xl p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <Settings className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-semibold">Password Options</h2>
          </div>

          <div className="space-y-6">
            {/* Presets */}
            <div>
              <h3 className="font-medium mb-3">Quick Presets</h3>
              <div className="grid grid-cols-3 gap-2">
                {presets.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => applyPreset(preset)}
                    className="btn-secondary text-sm py-2"
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Length */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="font-medium">Length</label>
                <span className="text-sm text-muted">{options.length} characters</span>
              </div>
              <input
                type="range"
                min="4"
                max="64"
                value={options.length}
                onChange={(e) => handleOptionChange('length', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Character Types */}
            <div className="space-y-4">
              <h3 className="font-medium">Character Types</h3>
              
              {[
                { key: 'includeUppercase', label: 'Uppercase (A-Z)', icon: 'A' },
                { key: 'includeLowercase', label: 'Lowercase (a-z)', icon: 'a' },
                { key: 'includeNumbers', label: 'Numbers (0-9)', icon: '1' },
                { key: 'includeSpecial', label: 'Special Characters', icon: '!' }
              ].map(({ key, label, icon }) => (
                <div key={key} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 bg-primary text-black rounded text-xs font-bold flex items-center justify-center">
                      {icon}
                    </span>
                    <span className="text-sm">{label}</span>
                  </div>
                  <button
                    onClick={() => handleOptionChange(key as keyof PasswordOptions, !options[key as keyof PasswordOptions])}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      options[key as keyof PasswordOptions] ? 'bg-primary' : 'bg-surface border border-border'
                    }`}
                  >
                    <div
                      className={`absolute w-5 h-5 bg-white rounded-full transition-transform top-0.5 ${
                        options[key as keyof PasswordOptions] ? 'translate-x-6' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>

            {/* Exclusions */}
            <div className="space-y-4">
              <h3 className="font-medium">Exclusions</h3>
              
              {[
                { key: 'excludeSimilar', label: 'Exclude Similar Characters (0, O, l, 1)', description: 'Avoid characters that look similar' },
                { key: 'excludeAmbiguous', label: 'Exclude Ambiguous Characters', description: 'Avoid characters that might be confusing' }
              ].map(({ key, label, description }) => (
                <div key={key} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{label}</span>
                    <button
                      onClick={() => handleOptionChange(key as keyof PasswordOptions, !options[key as keyof PasswordOptions])}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        options[key as keyof PasswordOptions] ? 'bg-primary' : 'bg-surface border border-border'
                      }`}
                    >
                      <div
                        className={`absolute w-5 h-5 bg-white rounded-full transition-transform top-0.5 ${
                          options[key as keyof PasswordOptions] ? 'translate-x-6' : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                  </div>
                  <p className="text-xs text-muted">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

