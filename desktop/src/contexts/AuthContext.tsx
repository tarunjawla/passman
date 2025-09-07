import React, { createContext, useContext, useState, ReactNode } from 'react'

interface AuthContextType {
  masterPassword: string | null
  setMasterPassword: (password: string | null) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [masterPassword, setMasterPassword] = useState<string | null>(null)

  return (
    <AuthContext.Provider value={{ masterPassword, setMasterPassword }}>
      {children}
    </AuthContext.Provider>
  )
}
