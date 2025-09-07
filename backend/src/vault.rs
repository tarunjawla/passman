//! # PassMan Vault
//! 
//! This is the main vault module that provides the high-level API
//! for password management operations.

use uuid::Uuid;
use crate::{
    PassManError, Result,
    models::{Vault, Account, AccountType, PasswordOptions, VaultMetadata},
    storage::VaultStorage,
    auth::AuthManager,
    generator::PasswordGenerator,
};

/// Main PassMan vault manager
pub struct PassMan {
    /// Vault storage manager
    storage: VaultStorage,
    
    /// Authentication manager
    auth: AuthManager,
    
    /// Password generator
    generator: PasswordGenerator,
    
    /// Current vault data (loaded when authenticated)
    vault: Option<Vault>,
    
    /// Vault name
    vault_name: String,
}

impl PassMan {
    /// Create a new PassMan instance
    /// 
    /// # Arguments
    /// * `vault_name` - Name of the vault to manage
    /// 
    /// # Returns
    /// A new PassMan instance
    /// 
    /// # Errors
    /// Returns an error if vault storage cannot be initialized
    pub fn new(vault_name: &str) -> Result<Self> {
        let storage = VaultStorage::new(vault_name)?;
        
        Ok(Self {
            storage,
            auth: AuthManager::default(),
            generator: PasswordGenerator::new(),
            vault: None,
            vault_name: vault_name.to_string(),
        })
    }
    
    /// Initialize a new vault with email and master password
    /// 
    /// # Arguments
    /// * `email` - Email address for the vault
    /// * `master_password` - Master password for encryption
    /// 
    /// # Returns
    /// Unit on success
    /// 
    /// # Errors
    /// Returns an error if vault already exists or initialization fails
    pub fn init_vault(&mut self, email: String, master_password: &str) -> Result<()> {
        if self.storage.vault_exists() {
            return Err(PassManError::VaultNotFound(
                "Vault already exists. Use open_vault() to access it.".to_string()
            ));
        }
        
        // Create new vault
        let vault = Vault::new(email);
        
        // Set up crypto with master password
        let (_, _salt) = self.auth.get_crypto_mut_for_init().generate_key_and_salt(master_password)?;
        
        // Save the vault
        self.storage.save_vault(&vault, self.auth.get_crypto_for_init())?;
        
        // Load the vault for immediate use
        self.vault = Some(vault);
        
        Ok(())
    }
    
    /// Open an existing vault with master password
    /// 
    /// # Arguments
    /// * `master_password` - Master password for decryption
    /// 
    /// # Returns
    /// Unit on success
    /// 
    /// # Errors
    /// Returns an error if vault doesn't exist or authentication fails
    pub fn open_vault(&mut self, master_password: &str) -> Result<()> {
        if !self.storage.vault_exists() {
            return Err(PassManError::VaultNotFound(
                "Vault not found. Use init_vault() to create a new vault.".to_string()
            ));
        }
        
        // Load vault using the master password (salt will be read from file)
        let vault = self.storage.load_vault(master_password)?;
        let metadata = &vault.metadata;
        
        // Authenticate with master password
        self.auth.authenticate(master_password, metadata)?;
        
        // Load the full vault
        self.vault = Some(vault);
        
        Ok(())
    }
    
    /// Close the current vault
    pub fn close_vault(&mut self) {
        self.vault = None;
        self.auth.logout();
    }
    
    /// Check if a vault is currently open
    /// 
    /// # Returns
    /// True if a vault is open and authenticated
    pub fn is_vault_open(&self) -> bool {
        self.vault.is_some() && self.auth.is_authenticated()
    }
    
    /// Get vault metadata
    /// 
    /// # Returns
    /// Vault metadata or None if not open
    pub fn get_vault_metadata(&self) -> Option<&VaultMetadata> {
        self.vault.as_ref().map(|v| &v.metadata)
    }
    
    /// Add a new account to the vault
    /// 
    /// # Arguments
    /// * `name` - Account name
    /// * `account_type` - Type of account
    /// * `password` - Account password
    /// * `url` - Optional URL
    /// * `username` - Optional username
    /// * `notes` - Optional notes
    /// * `tags` - Optional tags
    /// 
    /// # Returns
    /// Unit on success
    /// 
    /// # Errors
    /// Returns an error if vault is not open or save fails
    pub fn add_account(
        &mut self,
        name: String,
        account_type: AccountType,
        password: String,
        url: Option<String>,
        username: Option<String>,
        notes: Option<String>,
        tags: Vec<String>,
    ) -> Result<()> {
        let vault = self.vault.as_mut()
            .ok_or_else(|| PassManError::AuthenticationFailed("Vault not open".to_string()))?;
        
        let mut account = Account::new(name, account_type, password);
        account.url = url;
        account.username = username;
        account.notes = notes;
        account.tags = tags;
        
        vault.add_account(account);
        
        // Save vault
        self.save_vault()?;
        
        Ok(())
    }
    
    /// Update an existing account
    /// 
    /// # Arguments
    /// * `id` - Account ID
    /// * `name` - New account name
    /// * `account_type` - New account type
    /// * `password` - New password
    /// * `url` - New URL
    /// * `username` - New username
    /// * `notes` - New notes
    /// * `tags` - New tags
    /// 
    /// # Returns
    /// Unit on success
    /// 
    /// # Errors
    /// Returns an error if account not found or vault not open
    pub fn update_account(
        &mut self,
        id: Uuid,
        name: String,
        account_type: AccountType,
        password: String,
        url: Option<String>,
        username: Option<String>,
        notes: Option<String>,
        tags: Vec<String>,
    ) -> Result<()> {
        let vault = self.vault.as_mut()
            .ok_or_else(|| PassManError::AuthenticationFailed("Vault not open".to_string()))?;
        
        let account = vault.get_account_mut(&id)
            .ok_or_else(|| PassManError::AccountNotFound(format!("Account with ID {} not found", id)))?;
        
        account.name = name;
        account.account_type = account_type;
        account.password = password;
        account.url = url;
        account.username = username;
        account.notes = notes;
        account.tags = tags;
        account.updated_at = chrono::Utc::now();
        
        // Save vault
        self.save_vault()?;
        
        Ok(())
    }
    
    /// Delete an account from the vault
    /// 
    /// # Arguments
    /// * `id` - Account ID to delete
    /// 
    /// # Returns
    /// Unit on success
    /// 
    /// # Errors
    /// Returns an error if account not found or vault not open
    pub fn delete_account(&mut self, id: Uuid) -> Result<()> {
        let vault = self.vault.as_mut()
            .ok_or_else(|| PassManError::AuthenticationFailed("Vault not open".to_string()))?;
        
        vault.remove_account(&id)
            .ok_or_else(|| PassManError::AccountNotFound(format!("Account with ID {} not found", id)))?;
        
        // Save vault
        self.save_vault()?;
        
        Ok(())
    }
    
    /// Get an account by ID
    /// 
    /// # Arguments
    /// * `id` - Account ID
    /// 
    /// # Returns
    /// Account reference or None if not found
    pub fn get_account(&self, id: Uuid) -> Option<&Account> {
        self.vault.as_ref()?.get_account(&id)
    }
    
    /// Get all accounts in the vault
    /// 
    /// # Returns
    /// Vector of account references
    pub fn get_all_accounts(&self) -> Vec<&Account> {
        self.vault.as_ref().map_or_else(Vec::new, |v| v.get_all_accounts())
    }
    
    /// Search accounts by name
    /// 
    /// # Arguments
    /// * `query` - Search query
    /// 
    /// # Returns
    /// Vector of matching account references
    pub fn search_accounts(&self, query: &str) -> Vec<&Account> {
        self.vault.as_ref().map_or_else(Vec::new, |v| v.search_accounts(query))
    }
    
    /// Get accounts by type
    /// 
    /// # Arguments
    /// * `account_type` - Account type to filter by
    /// 
    /// # Returns
    /// Vector of matching account references
    pub fn get_accounts_by_type(&self, account_type: &AccountType) -> Vec<&Account> {
        self.vault.as_ref().map_or_else(Vec::new, |v| v.get_accounts_by_type(account_type))
    }
    
    /// Get accounts by tag
    /// 
    /// # Arguments
    /// * `tag` - Tag to filter by
    /// 
    /// # Returns
    /// Vector of matching account references
    pub fn get_accounts_by_tag(&self, tag: &str) -> Vec<&Account> {
        self.vault.as_ref().map_or_else(Vec::new, |v| v.get_accounts_by_tag(tag))
    }
    
    /// Generate a new password
    /// 
    /// # Arguments
    /// * `options` - Password generation options
    /// 
    /// # Returns
    /// Generated password string
    /// 
    /// # Errors
    /// Returns an error if generation fails
    pub fn generate_password(&mut self, options: &PasswordOptions) -> Result<String> {
        self.generator.generate(options)
    }
    
    /// Generate a simple password
    /// 
    /// # Arguments
    /// * `length` - Password length
    /// 
    /// # Returns
    /// Generated password string
    pub fn generate_simple_password(&mut self, length: usize) -> Result<String> {
        self.generator.generate_simple(length)
    }
    
    /// Generate a strong password
    /// 
    /// # Arguments
    /// * `length` - Password length
    /// 
    /// # Returns
    /// Generated password string
    pub fn generate_strong_password(&mut self, length: usize) -> Result<String> {
        self.generator.generate_strong(length)
    }
    
    /// Calculate password strength
    /// 
    /// # Arguments
    /// * `password` - Password to analyze
    /// 
    /// # Returns
    /// Strength score (0-100)
    pub fn calculate_password_strength(&self, password: &str) -> u8 {
        self.generator.calculate_strength(password)
    }
    
    /// Get password strength description
    /// 
    /// # Arguments
    /// * `score` - Strength score
    /// 
    /// # Returns
    /// Human-readable strength description
    pub fn get_password_strength_description(&self, score: u8) -> &'static str {
        self.generator.get_strength_description(score)
    }
    
    /// Export vault to a file
    /// 
    /// # Arguments
    /// * `export_path` - Path where to save the exported vault
    /// 
    /// # Returns
    /// Unit on success
    /// 
    /// # Errors
    /// Returns an error if export fails
    pub fn export_vault(&self, export_path: &std::path::Path) -> Result<()> {
        let vault = self.vault.as_ref()
            .ok_or_else(|| PassManError::AuthenticationFailed("Vault not open".to_string()))?;
        
        self.storage.export_vault(vault, self.auth.get_crypto()?, export_path)
    }
    
    /// Import vault from a file
    /// 
    /// # Arguments
    /// * `import_path` - Path to the vault file to import
    /// 
    /// # Returns
    /// Unit on success
    /// 
    /// # Errors
    /// Returns an error if import fails
    pub fn import_vault(&mut self, import_path: &std::path::Path) -> Result<()> {
        let vault = self.storage.import_vault(self.auth.get_crypto()?, import_path)?;
        self.vault = Some(vault);
        self.save_vault()?;
        Ok(())
    }
    
    /// Get vault file information
    /// 
    /// # Returns
    /// Vault file size and modification time
    pub fn get_vault_info(&self) -> Result<(u64, Option<std::time::SystemTime>)> {
        let size = self.storage.vault_size()?;
        let modified = self.storage.vault_modified()?;
        Ok((size, modified))
    }
    
    /// List all available vaults
    /// 
    /// # Returns
    /// Vector of vault names
    pub fn list_vaults() -> Result<Vec<String>> {
        VaultStorage::list_vaults()
    }
    
    /// Delete a vault
    /// 
    /// # Arguments
    /// * `vault_name` - Name of the vault to delete
    /// 
    /// # Returns
    /// Unit on success
    /// 
    /// # Errors
    /// Returns an error if deletion fails
    pub fn delete_vault(vault_name: &str) -> Result<()> {
        VaultStorage::delete_vault(vault_name)
    }
    
    /// Check if the current session is still valid
    /// 
    /// # Returns
    /// True if the session is valid
    pub fn is_session_valid(&self) -> bool {
        self.auth.is_authenticated()
    }
    
    /// Update session activity
    pub fn update_activity(&mut self) {
        self.auth.update_activity();
    }
    
    /// Get session information
    /// 
    /// # Returns
    /// Session information or None if not authenticated
    pub fn get_session_info(&self) -> Option<&crate::auth::AuthSession> {
        self.auth.get_session()
    }
    
    /// Save the current vault to disk
    /// 
    /// # Returns
    /// Unit on success
    /// 
    /// # Errors
    /// Returns an error if save fails
    fn save_vault(&self) -> Result<()> {
        let vault = self.vault.as_ref()
            .ok_or_else(|| PassManError::AuthenticationFailed("Vault not open".to_string()))?;
        
        self.storage.save_vault(vault, self.auth.get_crypto_for_init())
    }
}

impl Drop for PassMan {
    fn drop(&mut self) {
        // Clear sensitive data on drop
        self.close_vault();
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::TempDir;
    
    #[test]
    fn test_passman_creation() {
        let passman = PassMan::new("test_vault").unwrap();
        assert!(!passman.is_vault_open());
    }
    
    #[test]
    fn test_vault_initialization() {
        let mut passman = PassMan::new("test_vault").unwrap();
        passman.init_vault("test@example.com".to_string(), "master_password").unwrap();
        assert!(passman.is_vault_open());
    }
    
    #[test]
    fn test_account_operations() {
        let mut passman = PassMan::new("test_vault").unwrap();
        passman.init_vault("test@example.com".to_string(), "master_password").unwrap();
        
        // Add account
        passman.add_account(
            "Test Account".to_string(),
            AccountType::Personal,
            "test_password".to_string(),
            Some("https://example.com".to_string()),
            Some("testuser".to_string()),
            Some("Test notes".to_string()),
            vec!["test".to_string()],
        ).unwrap();
        
        let accounts = passman.get_all_accounts();
        assert_eq!(accounts.len(), 1);
        assert_eq!(accounts[0].name, "Test Account");
    }
    
    #[test]
    fn test_password_generation() {
        let mut passman = PassMan::new("test_vault").unwrap();
        let password = passman.generate_simple_password(12).unwrap();
        assert_eq!(password.len(), 12);
    }
}
