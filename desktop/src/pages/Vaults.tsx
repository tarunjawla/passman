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

interface VaultInfo {
  id: string
  name: string
  path: string
  size: number
  lastModified: string
  isOpen: boolean
  accountCount: number
  isEncrypted: boolean
}

export default function Vaults() {
  const [vaults, setVaults] = useState<VaultInfo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateVault, setShowCreateVault] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
  const [isExporting, setIsExporting] = useState<string | null>(null)

  useEffect(() => {
    loadVaults()
  }, [])

  const loadVaults = async () => {
    setIsLoading(true)
    try {
      // This would call a Tauri command to list vaults
      // For now, we'll simulate with mock data
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockVaults: VaultInfo[] = [
        {
          id: '1',
          name: 'Personal Vault',
          path: '/home/user/.passman/personal',
          size: 2048576, // 2MB
          lastModified: '2024-01-15T10:30:00Z',
          isOpen: true,
          accountCount: 25,
          isEncrypted: true
        },
        {
          id: '2',
          name: 'Work Vault',
          path: '/home/user/.passman/work',
          size: 1024000, // 1MB
          lastModified: '2024-01-14T15:45:00Z',
          isOpen: false,
          accountCount: 12,
          isEncrypted: true
        },
        {
          id: '3',
          name: 'Family Vault',
          path: '/home/user/.passman/family',
          size: 512000, // 512KB
          lastModified: '2024-01-10T09:20:00Z',
          isOpen: false,
          accountCount: 8,
          isEncrypted: true
        }
      ]
      
      setVaults(mockVaults)
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
        v.id === vaultId ? { ...v, isOpen: true } : v
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
        v.id === vaultId ? { ...v, isOpen: false } : v
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
                  <div className="flex items-center gap-2 mt-1">
                    {vault.isOpen ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <Clock className="w-4 h-4 text-muted" />
                    )}
                    <span className={`text-sm ${vault.isOpen ? 'text-green-500' : 'text-muted'}`}>
                      {vault.isOpen ? 'Open' : 'Closed'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-1">
                {vault.isEncrypted && (
                  <Lock className="w-4 h-4 text-primary" />
                )}
                <Settings className="w-4 h-4 text-muted hover:text-white cursor-pointer" />
              </div>
            </div>

            {/* Vault Stats */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted">Accounts</span>
                <span className="font-medium">{vault.accountCount}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted">Size</span>
                <span className="font-medium">{formatFileSize(vault.size)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted">Modified</span>
                <span className="font-medium">{formatDate(vault.lastModified)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted">Path</span>
                <span className="font-mono text-xs text-muted truncate max-w-32">
                  {vault.path.split('/').pop()}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              {vault.isOpen ? (
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
    </motion.div>
  )
}

