//! # Data Models
//! 
//! This module contains all the data structures used throughout PassMan,
//! including accounts, vault metadata, and configuration options.

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::str::FromStr;
use uuid::Uuid;
use chrono::{DateTime, Utc};

/// Represents a password account entry in the vault
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct Account {
    /// Unique identifier for the account
    pub id: Uuid,
    
    /// Display name for the account (e.g., "GitHub", "Gmail")
    pub name: String,
    
    /// Type/category of the account
    pub account_type: AccountType,
    
    /// Website URL associated with the account
    pub url: Option<String>,
    
    /// Username or email for the account
    pub username: Option<String>,
    
    /// Encrypted password (will be decrypted when needed)
    pub password: String,
    
    /// Additional notes about the account
    pub notes: Option<String>,
    
    /// Tags for organizing accounts
    pub tags: Vec<String>,
    
    /// When this account was created
    pub created_at: DateTime<Utc>,
    
    /// When this account was last modified
    pub updated_at: DateTime<Utc>,
    
    /// When this account was last accessed
    pub last_accessed: Option<DateTime<Utc>>,
}

impl Account {
    /// Create a new account with the given details
    /// 
    /// # Arguments
    /// * `name` - Display name for the account
    /// * `account_type` - Type/category of the account
    /// * `password` - The password (will be encrypted before storage)
    /// 
    /// # Returns
    /// A new Account instance with generated ID and timestamps
    pub fn new(name: String, account_type: AccountType, password: String) -> Self {
        let now = Utc::now();
        Self {
            id: Uuid::new_v4(),
            name,
            account_type,
            url: None,
            username: None,
            password,
            notes: None,
            tags: Vec::new(),
            created_at: now,
            updated_at: now,
            last_accessed: None,
        }
    }
    
    /// Update the last accessed timestamp
    pub fn mark_accessed(&mut self) {
        self.last_accessed = Some(Utc::now());
    }
    
    /// Update the account with new data
    pub fn update(&mut self, name: String, account_type: AccountType, password: String) {
        self.name = name;
        self.account_type = account_type;
        self.password = password;
        self.updated_at = Utc::now();
    }
}

/// Categories for organizing accounts
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, clap::ValueEnum)]
pub enum AccountType {
    /// Social media accounts (Twitter, Facebook, etc.)
    Social,
    
    /// Banking and financial accounts
    Banking,
    
    /// Work-related accounts
    Work,
    
    /// Personal accounts
    Personal,
    
    /// Email accounts
    Email,
    
    /// Shopping accounts
    Shopping,
    
    /// Gaming accounts
    Gaming,
    
    /// Other category
    Other,
}

impl AccountType {
    /// Get a human-readable string representation of the account type
    pub fn display_name(&self) -> &str {
        match self {
            AccountType::Social => "Social",
            AccountType::Banking => "Banking",
            AccountType::Work => "Work",
            AccountType::Personal => "Personal",
            AccountType::Email => "Email",
            AccountType::Shopping => "Shopping",
            AccountType::Gaming => "Gaming",
            AccountType::Other => "Other",
        }
    }
    
    /// Get all available account types
    pub fn all_types() -> Vec<AccountType> {
        vec![
            AccountType::Social,
            AccountType::Banking,
            AccountType::Work,
            AccountType::Personal,
            AccountType::Email,
            AccountType::Shopping,
            AccountType::Gaming,
        ]
    }
}

/// Options for password generation
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct PasswordOptions {
    /// Length of the generated password
    pub length: usize,
    
    /// Include uppercase letters (A-Z)
    pub include_uppercase: bool,
    
    /// Include lowercase letters (a-z)
    pub include_lowercase: bool,
    
    /// Include numbers (0-9)
    pub include_numbers: bool,
    
    /// Include special characters (!@#$%^&* etc.)
    pub include_special: bool,
    
    /// Exclude similar characters (0, O, l, 1, etc.)
    pub exclude_similar: bool,
    
    /// Exclude ambiguous characters ({}[]()\/~,;.<>)
    pub exclude_ambiguous: bool,
}

impl Default for PasswordOptions {
    fn default() -> Self {
        Self {
            length: 16,
            include_uppercase: true,
            include_lowercase: true,
            include_numbers: true,
            include_special: true,
            exclude_similar: true,
            exclude_ambiguous: false,
        }
    }
}

impl PasswordOptions {
    /// Create a new PasswordOptions with the specified length
    pub fn new(length: usize) -> Self {
        Self {
            length,
            ..Default::default()
        }
    }
    
    /// Create a simple password with only letters and numbers
    pub fn simple(length: usize) -> Self {
        Self {
            length,
            include_uppercase: true,
            include_lowercase: true,
            include_numbers: true,
            include_special: false,
            exclude_similar: true,
            exclude_ambiguous: true,
        }
    }
    
    /// Create a strong password with all character types
    pub fn strong(length: usize) -> Self {
        Self {
            length,
            include_uppercase: true,
            include_lowercase: true,
            include_numbers: true,
            include_special: true,
            exclude_similar: true,
            exclude_ambiguous: false,
        }
    }
}

/// Vault metadata and configuration
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct VaultMetadata {
    /// Version of the vault format
    pub version: String,
    
    /// Email associated with this vault
    pub email: String,
    
    /// When the vault was created
    pub created_at: DateTime<Utc>,
    
    /// When the vault was last modified
    pub last_modified: DateTime<Utc>,
    
    /// Number of accounts in the vault
    pub account_count: usize,
    
    /// Vault-specific settings
    pub settings: VaultSettings,
}

/// Vault-specific configuration settings
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct VaultSettings {
    /// Auto-lock timeout in minutes (0 = disabled)
    pub auto_lock_timeout: u32,
    
    /// Require master password confirmation for sensitive operations
    pub require_confirmation: bool,
    
    /// Enable clipboard auto-clear after copying passwords
    pub auto_clear_clipboard: bool,
    
    /// Clipboard clear timeout in seconds
    pub clipboard_timeout: u32,
    
    /// Enable password strength indicators
    pub show_strength_indicators: bool,
    
    /// Default password generation options
    pub default_password_options: PasswordOptions,
}

impl Default for VaultSettings {
    fn default() -> Self {
        Self {
            auto_lock_timeout: 15, // 15 minutes
            require_confirmation: true,
            auto_clear_clipboard: true,
            clipboard_timeout: 30, // 30 seconds
            show_strength_indicators: true,
            default_password_options: PasswordOptions::default(),
        }
    }
}

/// Complete vault structure containing all accounts and metadata
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct Vault {
    /// Vault metadata
    pub metadata: VaultMetadata,
    
    /// All accounts in the vault
    pub accounts: HashMap<Uuid, Account>,
    
    /// Vault-specific tags for organizing accounts
    pub tags: Vec<String>,
}

impl Vault {
    /// Create a new vault with the given email
    pub fn new(email: String) -> Self {
        let now = Utc::now();
        Self {
            metadata: VaultMetadata {
                version: "1.0.0".to_string(),
                email,
                created_at: now,
                last_modified: now,
                account_count: 0,
                settings: VaultSettings::default(),
            },
            accounts: HashMap::new(),
            tags: Vec::new(),
        }
    }
    
    /// Add an account to the vault
    pub fn add_account(&mut self, account: Account) {
        self.accounts.insert(account.id, account);
        self.metadata.account_count = self.accounts.len();
        self.metadata.last_modified = Utc::now();
    }
    
    /// Remove an account from the vault
    pub fn remove_account(&mut self, id: &Uuid) -> Option<Account> {
        let account = self.accounts.remove(id);
        if account.is_some() {
            self.metadata.account_count = self.accounts.len();
            self.metadata.last_modified = Utc::now();
        }
        account
    }
    
    /// Get an account by ID
    pub fn get_account(&self, id: &Uuid) -> Option<&Account> {
        self.accounts.get(id)
    }
    
    /// Get an account by ID (mutable)
    pub fn get_account_mut(&mut self, id: &Uuid) -> Option<&mut Account> {
        self.accounts.get_mut(id)
    }
    
    /// Get all accounts as a vector
    pub fn get_all_accounts(&self) -> Vec<&Account> {
        self.accounts.values().collect()
    }
    
    /// Search accounts by name (case-insensitive)
    pub fn search_accounts(&self, query: &str) -> Vec<&Account> {
        let query_lower = query.to_lowercase();
        self.accounts
            .values()
            .filter(|account| account.name.to_lowercase().contains(&query_lower))
            .collect()
    }
    
    /// Get accounts by type
    pub fn get_accounts_by_type(&self, account_type: &AccountType) -> Vec<&Account> {
        self.accounts
            .values()
            .filter(|account| &account.account_type == account_type)
            .collect()
    }
    
    /// Get accounts by tag
    pub fn get_accounts_by_tag(&self, tag: &str) -> Vec<&Account> {
        self.accounts
            .values()
            .filter(|account| account.tags.contains(&tag.to_string()))
            .collect()
    }
}
