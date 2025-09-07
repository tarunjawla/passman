import { motion } from 'framer-motion'
import {
    AlertTriangle,
    Check,
    Database,
    Download,
    Settings as SettingsIcon,
    Shield,
    Trash2,
    X
} from 'lucide-react'
import { useState } from 'react'

interface SettingsData {
  autoLock: boolean
  autoLockTime: number
  clearClipboard: boolean
  clearClipboardTime: number
  showPasswords: boolean
  darkMode: boolean
  backupEnabled: boolean
  backupLocation: string
}

export default function Settings() {
  const [settings, setSettings] = useState<SettingsData>({
    autoLock: true,
    autoLockTime: 5,
    clearClipboard: true,
    clearClipboardTime: 30,
    showPasswords: false,
    darkMode: true,
    backupEnabled: false,
    backupLocation: ''
  })

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  const handleSettingChange = (key: keyof SettingsData, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleExportVault = async () => {
    setIsExporting(true)
    try {
      // This would call a Tauri command to export the vault
      console.log('Exporting vault...')
      await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate export
    } catch (error) {
      console.error('Export failed:', error)
    } finally {
      setIsExporting(false)
    }
  }

  const handleDeleteVault = async () => {
    try {
      // This would call a Tauri command to delete the vault
      console.log('Deleting vault...')
      setShowDeleteConfirm(false)
    } catch (error) {
      console.error('Delete failed:', error)
    }
  }

  const handleBackupLocationSelect = async () => {
    try {
      // This would call a Tauri command to open file dialog
      console.log('Selecting backup location...')
    } catch (error) {
      console.error('Failed to select location:', error)
    }
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
          <SettingsIcon className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">Settings</h1>
        </div>
        <p className="text-muted">Configure your PassMan preferences and security options.</p>
      </div>

      <div className="space-y-6">
        {/* Security Settings */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-surface rounded-xl p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-semibold">Security</h2>
          </div>

          <div className="space-y-6">
            {/* Auto Lock */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium mb-1">Auto Lock</h3>
                <p className="text-sm text-muted">Automatically lock PassMan after inactivity</p>
              </div>
              <div className="flex items-center gap-4">
                <select
                  value={settings.autoLockTime}
                  onChange={(e) => handleSettingChange('autoLockTime', parseInt(e.target.value))}
                  disabled={!settings.autoLock}
                  className="bg-surface border border-border rounded-lg px-3 py-2 text-sm disabled:opacity-50 text-white"
                >
                  <option value={1}>1 minute</option>
                  <option value={5}>5 minutes</option>
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={60}>1 hour</option>
                </select>
                <button
                  onClick={() => handleSettingChange('autoLock', !settings.autoLock)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    settings.autoLock ? 'bg-primary' : 'bg-surface border border-border'
                  }`}
                >
                  <div
                    className={`absolute w-5 h-5 bg-white rounded-full transition-transform top-0.5 ${
                      settings.autoLock ? 'translate-x-6' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Clear Clipboard */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium mb-1">Clear Clipboard</h3>
                <p className="text-sm text-muted">Automatically clear copied passwords</p>
              </div>
              <div className="flex items-center gap-4">
                <select
                  value={settings.clearClipboardTime}
                  onChange={(e) => handleSettingChange('clearClipboardTime', parseInt(e.target.value))}
                  disabled={!settings.clearClipboard}
                  className="bg-surface border border-border rounded-lg px-3 py-2 text-sm disabled:opacity-50 text-white"
                >
                  <option value={10}>10 seconds</option>
                  <option value={30}>30 seconds</option>
                  <option value={60}>1 minute</option>
                  <option value={300}>5 minutes</option>
                </select>
                <button
                  onClick={() => handleSettingChange('clearClipboard', !settings.clearClipboard)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    settings.clearClipboard ? 'bg-primary' : 'bg-surface border border-border'
                  }`}
                >
                  <div
                    className={`absolute w-5 h-5 bg-white rounded-full transition-transform top-0.5 ${
                      settings.clearClipboard ? 'translate-x-6' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Show Passwords */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium mb-1">Show Passwords by Default</h3>
                <p className="text-sm text-muted">Display passwords without clicking reveal</p>
              </div>
              <button
                onClick={() => handleSettingChange('showPasswords', !settings.showPasswords)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  settings.showPasswords ? 'bg-primary' : 'bg-surface border border-border'
                }`}
              >
                <div
                  className={`absolute w-5 h-5 bg-white rounded-full transition-transform top-0.5 ${
                    settings.showPasswords ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Backup Settings */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-surface rounded-xl p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <Database className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-semibold">Backup & Export</h2>
          </div>

          <div className="space-y-6">
            {/* Auto Backup */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium mb-1">Automatic Backup</h3>
                <p className="text-sm text-muted">Automatically backup your vault</p>
              </div>
              <button
                onClick={() => handleSettingChange('backupEnabled', !settings.backupEnabled)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  settings.backupEnabled ? 'bg-primary' : 'bg-surface border border-border'
                }`}
              >
                <div
                  className={`absolute w-5 h-5 bg-white rounded-full transition-transform top-0.5 ${
                    settings.backupEnabled ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            {/* Backup Location */}
            {settings.backupEnabled && (
              <div>
                <h3 className="font-medium mb-2">Backup Location</h3>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={settings.backupLocation}
                    placeholder="Select backup folder..."
                    readOnly
                    className="flex-1 bg-surface border border-border rounded-lg px-4 py-2 text-sm"
                  />
                  <button
                    onClick={handleBackupLocationSelect}
                    className="btn-secondary px-4 py-2 text-sm"
                  >
                    Browse
                  </button>
                </div>
              </div>
            )}

            {/* Export Vault */}
            <div className="pt-4 border-t border-border">
              <h3 className="font-medium mb-2">Export Vault</h3>
              <p className="text-sm text-muted mb-4">
                Export your vault as an encrypted backup file
              </p>
              <button
                onClick={handleExportVault}
                disabled={isExporting}
                className="btn-primary flex items-center gap-2 disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                {isExporting ? 'Exporting...' : 'Export Vault'}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Danger Zone */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-surface rounded-xl p-6 border-red-500/20"
        >
          <div className="flex items-center gap-3 mb-6">
            <AlertTriangle className="w-6 h-6 text-red-500" />
            <h2 className="text-xl font-semibold text-red-500">Danger Zone</h2>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Delete Vault</h3>
              <p className="text-sm text-muted mb-4">
                Permanently delete your vault and all stored passwords. This action cannot be undone.
              </p>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete Vault
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-surface rounded-xl p-6 max-w-md w-full mx-4 border border-border"
          >
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-red-500" />
              <h3 className="text-xl font-semibold">Delete Vault</h3>
            </div>
            <p className="text-muted mb-6">
              Are you sure you want to delete your vault? This will permanently remove all your passwords and cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="btn-secondary flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
              <button
                onClick={handleDeleteVault}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  )
}
