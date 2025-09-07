import React from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Shield, Settings, LogOut, Search } from 'lucide-react'

interface HeaderProps {
  onLogout: () => void
}

const Header: React.FC<HeaderProps> = ({ onLogout }) => {
  const navigate = useNavigate()

  const handleSettingsClick = () => {
    navigate('/settings')
  }

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-surface border-b border-muted/20 px-8 py-4"
    >
      <div className="flex items-center justify-between">
        {/* Logo and Title */}
        <motion.div 
          className="flex items-center space-x-3 cursor-pointer"
          onClick={() => navigate('/')}
          whileHover={{ scale: 1.02 }}
        >
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center"
          >
            <Shield className="w-6 h-6 text-black" />
          </motion.div>
          <div>
            <h1 className="text-2xl font-bold font-orbitron text-white">PassMan</h1>
            <p className="text-sm text-muted">Secure Password Manager</p>
          </div>
        </motion.div>

        {/* Search Bar */}
        <div className="flex-1 max-w-md mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              placeholder="Search accounts..."
              className="w-full pl-10 pr-4 py-2 bg-surface border border-muted/20 rounded-lg text-white placeholder-muted focus:border-primary focus:outline-none transition-colors duration-200"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSettingsClick}
            className="p-2 text-muted hover:text-white transition-colors duration-200"
          >
            <Settings className="w-5 h-5" />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onLogout}
            className="p-2 text-muted hover:text-red-400 transition-colors duration-200"
          >
            <LogOut className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    </motion.header>
  )
}

export default Header
