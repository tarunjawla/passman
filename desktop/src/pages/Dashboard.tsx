import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Search, Filter, Copy, Edit, Trash2, Eye, EyeOff, Shield } from 'lucide-react'
import { Account, AccountType } from '../types'
import { invoke } from '@tauri-apps/api/core'
import ConfirmationModal from '../components/ConfirmationModal'
import { useAuth } from '../contexts/AuthContext'

const Dashboard: React.FC = () => {
  const { masterPassword } = useAuth()
  const [accounts, setAccounts] = useState<Account[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState<AccountType | 'All'>('All')
  const [showPasswords, setShowPasswords] = useState<{ [key: string]: boolean }>({})
  const [isLoading, setIsLoading] = useState(true)
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean
    accountId: string | null
    accountName: string
  }>({
    isOpen: false,
    accountId: null,
    accountName: ''
  })

  useEffect(() => {
    loadAccounts()
  }, [])

  const loadAccounts = async () => {
    try {
      // This would call the Tauri command to load accounts
      // const accounts = await invoke('list_accounts')
      // setAccounts(accounts)
      
      // Mock data for now
      setAccounts([
        {
          id: '1',
          name: 'GitHub',
          account_type: AccountType.Work,
          url: 'https://github.com',
          username: 'user@example.com',
          password: 'MySecurePassword123!',
          notes: 'Work account',
          tags: ['work', 'development'],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Gmail',
          account_type: AccountType.Personal,
          url: 'https://gmail.com',
          username: 'personal@gmail.com',
          password: 'AnotherSecurePassword456!',
          notes: 'Personal email',
          tags: ['personal', 'email'],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ])
    } catch (error) {
      console.error('Error loading accounts:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredAccounts = accounts.filter(account => {
    const matchesSearch = account.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         account.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         account.url?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = selectedType === 'All' || account.account_type === selectedType
    return matchesSearch && matchesType
  })

  const togglePasswordVisibility = (accountId: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [accountId]: !prev[accountId]
    }))
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      // Could show a toast notification here
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
    }
  }

  const handleDeleteClick = (accountId: string, accountName: string) => {
    setDeleteModal({
      isOpen: true,
      accountId,
      accountName
    })
  }

  const handleDeleteConfirm = async () => {
    if (!deleteModal.accountId) return

    try {
      await invoke('delete_account', { id: deleteModal.accountId })
      // Reload accounts after deletion
      loadAccounts()
      // Close modal
      setDeleteModal({
        isOpen: false,
        accountId: null,
        accountName: ''
      })
    } catch (error) {
      console.error('Error deleting account:', error)
      alert('Failed to delete account. Please try again.')
    }
  }

  const handleDeleteCancel = () => {
    setDeleteModal({
      isOpen: false,
      accountId: null,
      accountName: ''
    })
  }

  const getAccountTypeColor = (type: AccountType): string => {
    switch (type) {
      case AccountType.Social: return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case AccountType.Banking: return 'bg-green-500/20 text-green-400 border-green-500/30'
      case AccountType.Work: return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      case AccountType.Personal: return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted">Loading accounts...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold font-orbitron text-white">Dashboard</h1>
          <p className="text-muted">Manage your secure passwords</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Add Account</span>
        </motion.button>
      </motion.div>

      {/* Search and Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex space-x-4"
      >
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            placeholder="Search accounts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field w-full pl-10"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted" />
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as AccountType | 'All')}
            className="input-field pl-10 pr-8 appearance-none"
          >
            <option value="All">All Types</option>
            <option value={AccountType.Social}>Social</option>
            <option value={AccountType.Banking}>Banking</option>
            <option value={AccountType.Work}>Work</option>
            <option value={AccountType.Personal}>Personal</option>
            <option value={AccountType.Other}>Other</option>
          </select>
        </div>
      </motion.div>

      {/* Accounts Grid */}
      {filteredAccounts.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Shield className="w-16 h-16 text-muted mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No accounts found</h3>
          <p className="text-muted mb-6">
            {searchQuery || selectedType !== 'All' 
              ? 'Try adjusting your search or filter criteria'
              : 'Get started by adding your first account'
            }
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn-primary"
          >
            Add Your First Account
          </motion.button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAccounts.map((account, index) => (
            <motion.div
              key={account.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card hover:border-primary/30 transition-colors duration-200"
            >
              {/* Account Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-1">{account.name}</h3>
                  <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getAccountTypeColor(account.account_type)}`}>
                    {account.account_type}
                  </div>
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => togglePasswordVisibility(account.id)}
                    className="p-1 text-muted hover:text-white transition-colors"
                  >
                    {showPasswords[account.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button className="p-1 text-muted hover:text-white transition-colors">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDeleteClick(account.id, account.name)}
                    className="p-1 text-muted hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Account Details */}
              <div className="space-y-3">
                {account.url && (
                  <div>
                    <label className="text-xs text-muted uppercase tracking-wide">URL</label>
                    <p className="text-sm text-white break-all">{account.url}</p>
                  </div>
                )}
                
                {account.username && (
                  <div>
                    <label className="text-xs text-muted uppercase tracking-wide">Username</label>
                    <div className="flex items-center space-x-2">
                      <p className="text-sm text-white flex-1">{account.username}</p>
                      <button
                        onClick={() => copyToClipboard(account.username!)}
                        className="p-1 text-muted hover:text-white transition-colors"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-xs text-muted uppercase tracking-wide">Password</label>
                  <div className="flex items-center space-x-2">
                    <p className="text-sm text-white flex-1 font-mono">
                      {showPasswords[account.id] ? account.password : '••••••••••••'}
                    </p>
                    <button
                      onClick={() => copyToClipboard(account.password)}
                      className="p-1 text-muted hover:text-white transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {account.notes && (
                  <div>
                    <label className="text-xs text-muted uppercase tracking-wide">Notes</label>
                    <p className="text-sm text-white">{account.notes}</p>
                  </div>
                )}

                {account.tags.length > 0 && (
                  <div>
                    <label className="text-xs text-muted uppercase tracking-wide">Tags</label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {account.tags.map((tag, tagIndex) => (
                        <span
                          key={tagIndex}
                          className="px-2 py-1 bg-white/5 text-xs text-muted rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Account"
        message={`Are you sure you want to delete "${deleteModal.accountName}"? This action cannot be undone and all data for this account will be permanently removed.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  )
}

export default Dashboard
