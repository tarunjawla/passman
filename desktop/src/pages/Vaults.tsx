import { motion } from 'framer-motion'
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Database,
  Download,
  Lock,
  Plus,
  Settings,
  Trash2,
  Unlock
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { invoke } from '@tauri-apps/api/core'
import { VaultInfo } from '../types'


export default function Vaults() {
  const [vaults, setVaults] = useState<VaultInfo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateVault, setShowCreateVault] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
  const [isExporting, setIsExporting] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [createForm, setCreateForm] = useState({
    name: '',
    description: '',
    email: '',
    master_password: '',
    confirm_password: ''
  })

  useEffect(() => {
    loadVaults()
  }, [])

  const loadVaults = async () => {
    setIsLoading(true)
    try {
      const vaultList = await invoke<VaultInfo[]>('list_vaults')
      setVaults(vaultList)
    } catch (error) {
      console.error('Error loading vaults:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const openVault = async (vaultId: string) => {
    try {
      // This would call a Tauri command to open vault
      console.log('Opening vault:', vaultId)
      setVaults(prev => prev.map(v => 
        v.id === vaultId ? { ...v, is_open: true } : v
      ))
    } catch (error) {
      console.error('Error opening vault:', error)
    }
  }

  const closeVault = async (vaultId: string) => {
    try {
      // This would call a Tauri command to close vault
      console.log('Closing vault:', vaultId)
      setVaults(prev => prev.map(v => 
        v.id === vaultId ? { ...v, is_open: false } : v
      ))
    } catch (error) {
      console.error('Error closing vault:', error)
    }
  }

  const deleteVault = async (vaultId: string) => {
    try {
      // This would call a Tauri command to delete vault
      console.log('Deleting vault:', vaultId)
      setVaults(prev => prev.filter(v => v.id !== vaultId))
      setShowDeleteConfirm(null)
    } catch (error) {
      console.error('Error deleting vault:', error)
    }
  }

  const createVault = async () => {
    if (!createForm.name.trim()) {
      alert('Please enter a vault name')
      return
    }
    if (!createForm.email.trim()) {
      alert('Please enter an email address')
      return
    }
    if (!createForm.master_password) {
      alert('Please enter a vault password')
      return
    }
    if (createForm.master_password !== createForm.confirm_password) {
      alert('Vault passwords do not match')
      return
    }
    if (createForm.master_password.length < 8) {
      alert('Vault password must be at least 8 characters long')
      return
    }

    setIsCreating(true)
    try {
      await invoke('create_vault', {
        name: createForm.name.trim(),
        description: createForm.description.trim() || null,
        email: createForm.email.trim(),
        masterPassword: createForm.master_password
      })
      
      // Reset form and close modal
      setCreateForm({
        name: '',
        description: '',
        email: '',
        master_password: '',
        confirm_password: ''
      })
      setShowCreateVault(false)
      
      // Reload vaults
      await loadVaults()
    } catch (error) {
      console.error('Failed to create vault:', error)
      alert(`Failed to create vault: ${error}`)
    } finally {
      setIsCreating(false)
    }
  }

  const exportVault = async (vaultId: string) => {
    setIsExporting(vaultId)
    try {
      // This would call a Tauri command to export vault
      console.log('Exporting vault:', vaultId)
      await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate export
    } catch (error) {
      console.error('Error exporting vault:', error)
    } finally {
      setIsExporting(null)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted text-lg">Loading vaults...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="max-w-6xl mx-auto"
    >
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Database className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Vaults</h1>
              <p className="text-muted">Manage your password vaults and data storage.</p>
            </div>
          </div>
          <button
            onClick={() => setShowCreateVault(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Create Vault
          </button>
        </div>
      </div>

      {/* Vaults Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vaults.map((vault, index) => (
          <motion.div
            key={vault.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass-surface rounded-xl p-6 hover:border-primary/50 transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                  <Database className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{vault.name}</h3>
                  {vault.description && (
                    <p className="text-sm text-muted mt-1">{vault.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    {vault.is_open ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <Clock className="w-4 h-4 text-muted" />
                    )}
                    <span className={`text-sm ${vault.is_open ? 'text-green-500' : 'text-muted'}`}>
                      {vault.is_open ? 'Open' : 'Closed'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-1">
                {vault.is_encrypted && (
                  <Lock className="w-4 h-4 text-primary" />
                )}
                <Settings className="w-4 h-4 text-muted hover:text-white cursor-pointer" />
              </div>
            </div>

            {/* Vault Stats */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted">Accounts</span>
                <span className="font-medium">{vault.account_count}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted">Size</span>
                <span className="font-medium">{formatFileSize(vault.size)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted">Modified</span>
                <span className="font-medium">{formatDate(vault.last_modified)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted">Email</span>
                <span className="font-mono text-xs text-muted truncate max-w-32">
                  {vault.email}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              {vault.is_open ? (
                <button
                  onClick={() => closeVault(vault.id)}
                  className="flex-1 btn-secondary flex items-center justify-center gap-2 text-sm"
                >
                  <Unlock className="w-4 h-4" />
                  Close
                </button>
              ) : (
                <button
                  onClick={() => openVault(vault.id)}
                  className="flex-1 btn-primary flex items-center justify-center gap-2 text-sm"
                >
                  <Lock className="w-4 h-4" />
                  Open
                </button>
              )}
              
              <button
                onClick={() => exportVault(vault.id)}
                disabled={isExporting === vault.id}
                className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50"
              >
                {isExporting === vault.id ? (
                  <Clock className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
              </button>
              
              <button
                onClick={() => setShowDeleteConfirm(vault.id)}
                className="px-3 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {vaults.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Database className="w-16 h-16 text-muted mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Vaults Found</h3>
          <p className="text-muted mb-6">Create your first vault to start storing passwords securely.</p>
          <button
            onClick={() => setShowCreateVault(true)}
            className="btn-primary flex items-center gap-2 mx-auto"
          >
            <Plus className="w-5 h-5" />
            Create Your First Vault
          </button>
        </motion.div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-surface rounded-xl p-6 max-w-md w-full mx-4 border border-border"
          >
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-red-500" />
              <h3 className="text-xl font-semibold">Delete Vault</h3>
            </div>
            <p className="text-muted mb-6">
              Are you sure you want to delete this vault? This will permanently remove all passwords and cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="btn-secondary flex items-center gap-2"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteVault(showDeleteConfirm)}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Create Vault Modal */}
      {showCreateVault && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-surface rounded-xl p-8 max-w-lg w-full border border-border shadow-2xl"
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-primary/20 rounded-lg">
                <Database className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Create New Vault</h3>
                <p className="text-muted text-sm">Set up a secure vault for your passwords</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Vault Name *
                </label>
                <input
                  type="text"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  className="input-field w-full"
                  placeholder="e.g., Personal, Work, Family"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Description
                </label>
                <textarea
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  className="input-field w-full h-20 resize-none"
                  placeholder="Optional description for this vault"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  className="input-field w-full"
                  placeholder="your@email.com"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Vault Password *
                </label>
                <input
                  type="password"
                  value={createForm.master_password}
                  onChange={(e) => setCreateForm({ ...createForm, master_password: e.target.value })}
                  className="input-field w-full"
                  placeholder="Enter a strong password for this vault"
                  required
                />
                <p className="text-xs text-muted mt-1">This password will be used to access this specific vault</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Confirm Vault Password *
                </label>
                <input
                  type="password"
                  value={createForm.confirm_password}
                  onChange={(e) => setCreateForm({ ...createForm, confirm_password: e.target.value })}
                  className="input-field w-full"
                  placeholder="Confirm your vault password"
                  required
                />
              </div>
            </div>
            
            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={() => setShowCreateVault(false)}
                className="btn-secondary flex items-center gap-2"
                disabled={isCreating}
              >
                Cancel
              </button>
              <button
                onClick={createVault}
                disabled={isCreating}
                className="btn-primary flex items-center gap-2"
              >
                {isCreating ? (
                  <>
                    <Clock className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Create Vault
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  )
}

