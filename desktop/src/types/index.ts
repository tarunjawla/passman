// Account types matching the backend
export interface Account {
  id: string
  name: string
  account_type: AccountType
  url?: string
  username?: string
  password: string
  notes?: string
  tags: string[]
  created_at: string
  updated_at: string
}

export enum AccountType {
  Social = 'Social',
  Banking = 'Banking',
  Work = 'Work',
  Personal = 'Personal',
  Other = 'Other'
}

export interface PasswordOptions {
  length: number
  include_uppercase: boolean
  include_lowercase: boolean
  include_numbers: boolean
  include_special: boolean
  exclude_similar: boolean
  exclude_ambiguous: boolean
}

export interface VaultInfo {
  size: number
  modified?: number
}

export interface PasswordStrength {
  score: number
  description: string
}

// UI State types
export interface AppState {
  isAuthenticated: boolean
  isVaultInitialized: boolean
  currentVault: string | null
  accounts: Account[]
  searchQuery: string
  selectedAccountType: AccountType | 'All'
}

// Vault types
export interface VaultInfo {
  id: string
  name: string
  description?: string
  email: string
  created_at: string
  last_modified: string
  account_count: number
  size: number
  is_open: boolean
  is_encrypted: boolean
}

// Form types
export interface AccountFormData {
  name: string
  account_type: AccountType
  url: string
  username: string
  password: string
  notes: string
  tags: string[]
  vault_name: string
}

export interface VaultFormData {
  name: string
  description: string
  email: string
  master_password: string
  confirm_password: string
}

export interface SetupFormData {
  email: string
  master_password: string
  confirm_password: string
}

export interface LoginFormData {
  master_password: string
}
