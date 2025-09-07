import React from 'react'
import { motion } from 'framer-motion'
import { NavLink } from 'react-router-dom'
import { 
  Home, 
  Plus, 
  Key, 
  Shield, 
  Settings, 
  Database
} from 'lucide-react'

const Sidebar: React.FC = () => {
  const navItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/add', icon: Plus, label: 'Add Account' },
    { path: '/generate', icon: Key, label: 'Generate Password' },
    { path: '/vaults', icon: Database, label: 'Vaults' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ]

  return (
    <motion.aside
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="w-64 bg-surface border-r border-muted/20 p-6"
    >
      {/* Navigation */}
      <nav className="space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                isActive
                  ? 'bg-primary/20 text-primary border border-primary/30'
                  : 'text-muted hover:text-white hover:bg-white/5'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-8 p-4 bg-white/5 rounded-lg border border-white/10"
      >
        <h3 className="text-sm font-semibold text-white mb-3">Quick Stats</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted">Total Accounts</span>
            <span className="text-white font-medium">0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Weak Passwords</span>
            <span className="text-red-400 font-medium">0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Last Backup</span>
            <span className="text-green-400 font-medium">Never</span>
          </div>
        </div>
      </motion.div>

      {/* Security Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-4 p-4 bg-green-500/10 rounded-lg border border-green-500/20"
      >
        <div className="flex items-center space-x-2">
          <Shield className="w-4 h-4 text-green-400" />
          <span className="text-sm font-medium text-green-400">Vault Locked</span>
        </div>
        <p className="text-xs text-green-300 mt-1">
          Your data is encrypted and secure
        </p>
      </motion.div>
    </motion.aside>
  )
}

export default Sidebar
