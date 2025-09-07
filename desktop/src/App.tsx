import React, { useState, useEffect } from 'react'
import { QueryClient, QueryClientProvider } from 'react-query'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

// Components
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Setup from './pages/Setup'
import Login from './pages/Login'
import AddAccount from './pages/AddAccount'
import Settings from './pages/Settings'

// Types
import { Account, AccountType } from './types'

// Create a client
const queryClient = new QueryClient()

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isVaultInitialized, setIsVaultInitialized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if vault exists and user is authenticated
    checkVaultStatus()
  }, [])

  const checkVaultStatus = async () => {
    try {
      // This would call a Tauri command to check vault status
      // For now, we'll simulate the check
      setIsLoading(false)
    } catch (error) {
      console.error('Error checking vault status:', error)
      setIsLoading(false)
    }
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
          <p className="text-muted text-lg">Loading PassMan...</p>
        </motion.div>
      </div>
    )
  }

  if (!isVaultInitialized) {
    return (
      <QueryClientProvider client={queryClient}>
        <Router>
          <Setup onVaultCreated={() => setIsVaultInitialized(true)} />
        </Router>
      </QueryClientProvider>
    )
  }

  if (!isAuthenticated) {
    return (
      <QueryClientProvider client={queryClient}>
        <Router>
          <Login onAuthenticated={() => setIsAuthenticated(true)} />
        </Router>
      </QueryClientProvider>
    )
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-background text-white">
          <Header onLogout={() => setIsAuthenticated(false)} />
          
          <div className="flex">
            <Sidebar />
            
            <main className="flex-1 p-8">
              <AnimatePresence mode="wait">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/add" element={<AddAccount />} />
                  <Route path="/settings" element={<Settings />} />
                </Routes>
              </AnimatePresence>
            </main>
          </div>
        </div>
      </Router>
    </QueryClientProvider>
  )
}

export default App
