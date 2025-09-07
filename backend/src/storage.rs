//! # Vault Storage Management
//! 
//! This module handles the secure storage and retrieval of vault data
//! from the local filesystem with proper file permissions and atomic operations.

use std::fs::{self, File};
use std::io::{Read, Write};
use std::path::{Path, PathBuf};
use dirs;
use serde_json;
use crate::{PassManError, Result, models::Vault, crypto::CryptoManager};

/// Vault storage manager
pub struct VaultStorage {
    /// Path to the vault file
    vault_path: PathBuf,
    /// Backup directory for vault files
    backup_dir: PathBuf,
}

impl VaultStorage {
    /// Create a new vault storage manager
    /// 
    /// # Arguments
    /// * `vault_name` - Name of the vault (used for filename)
    /// 
    /// # Returns
    /// A new VaultStorage instance
    /// 
    /// # Errors
    /// Returns an error if the vault directory cannot be created
    pub fn new(vault_name: &str) -> Result<Self> {
        let vault_dir = Self::get_vault_directory()?;
        let backup_dir = vault_dir.join("backups");
        
        // Create directories if they don't exist
        fs::create_dir_all(&vault_dir)
            .map_err(|e| PassManError::StorageError(format!("Failed to create vault directory: {}", e)))?;
        
        fs::create_dir_all(&backup_dir)
            .map_err(|e| PassManError::StorageError(format!("Failed to create backup directory: {}", e)))?;
        
        let vault_path = vault_dir.join(format!("{}.vault", vault_name));
        
        Ok(Self {
            vault_path,
            backup_dir,
        })
    }
    
    /// Get the default vault directory for the current platform
    /// 
    /// # Returns
    /// Path to the vault directory
    /// 
    /// # Errors
    /// Returns an error if the directory cannot be determined
    fn get_vault_directory() -> Result<PathBuf> {
        let config_dir = dirs::config_dir()
            .ok_or_else(|| PassManError::StorageError("Cannot determine config directory".to_string()))?;
        
        Ok(config_dir.join("passman").join("vaults"))
    }
    
    /// Check if a vault exists
    /// 
    /// # Returns
    /// True if the vault file exists, false otherwise
    pub fn vault_exists(&self) -> bool {
        self.vault_path.exists()
    }
    
    /// Save a vault to disk with encryption
    /// 
    /// # Arguments
    /// * `vault` - The vault to save
    /// * `crypto` - Crypto manager for encryption
    /// 
    /// # Returns
    /// Unit on success
    /// 
    /// # Errors
    /// Returns an error if saving or encryption fails
    pub fn save_vault(&self, vault: &Vault, crypto: &CryptoManager) -> Result<()> {
        // Create backup before saving
        if self.vault_exists() {
            self.create_backup()?;
        }
        
        // Serialize vault to JSON
        let vault_json = serde_json::to_string_pretty(vault)
            .map_err(|e| PassManError::SerializationError(e))?;
        
        // Encrypt the vault data
        let encrypted_data = crypto.encrypt(vault_json.as_bytes())?;
        
        // Get the salt used for encryption
        let salt = crypto.get_salt()
            .ok_or_else(|| PassManError::StorageError("No salt available for storage".to_string()))?;
        
        // Write to temporary file first (atomic operation)
        let temp_path = self.vault_path.with_extension("tmp");
        {
            let mut file = File::create(&temp_path)
                .map_err(|e| PassManError::StorageError(format!("Failed to create temp file: {}", e)))?;
            
            // Write salt first (16 bytes)
            file.write_all(salt.as_bytes())
                .map_err(|e| PassManError::StorageError(format!("Failed to write salt: {}", e)))?;
            
            // Then write encrypted data
            file.write_all(&encrypted_data)
                .map_err(|e| PassManError::StorageError(format!("Failed to write vault data: {}", e)))?;
            
            file.sync_all()
                .map_err(|e| PassManError::StorageError(format!("Failed to sync vault data: {}", e)))?;
        }
        
        // Atomically move temp file to final location
        fs::rename(&temp_path, &self.vault_path)
            .map_err(|e| PassManError::StorageError(format!("Failed to move vault file: {}", e)))?;
        
        // Set secure file permissions (owner read/write only)
        self.set_secure_permissions(&self.vault_path)?;
        
        Ok(())
    }
    
    /// Load a vault from disk with decryption
    /// 
    /// # Arguments
    /// * `master_password` - Master password to derive decryption key
    /// 
    /// # Returns
    /// The loaded vault
    /// 
    /// # Errors
    /// Returns an error if loading or decryption fails
    pub fn load_vault(&self, master_password: &str) -> Result<Vault> {
        if !self.vault_exists() {
            return Err(PassManError::VaultNotFound(format!("Vault not found at: {}", self.vault_path.display())));
        }
        
        // Read data from file
        let mut file = File::open(&self.vault_path)
            .map_err(|e| PassManError::StorageError(format!("Failed to open vault file: {}", e)))?;
        
        let mut file_data = Vec::new();
        file.read_to_end(&mut file_data)
            .map_err(|e| PassManError::StorageError(format!("Failed to read vault file: {}", e)))?;
        
        // Extract salt (first 16 bytes) and encrypted data (rest)
        if file_data.len() < 16 {
            return Err(PassManError::StorageError("Vault file is corrupted: too small".to_string()));
        }
        
        let salt_bytes: [u8; 16] = file_data[0..16].try_into()
            .map_err(|_| PassManError::StorageError("Failed to read salt from vault file".to_string()))?;
        let encrypted_data = &file_data[16..];
        
        // Create crypto manager and derive key from password and stored salt
        let mut crypto = crate::crypto::CryptoManager::new();
        let salt = crate::crypto::Salt::from_bytes(salt_bytes);
        let key = crypto.derive_key(master_password, &salt)?;
        
        // Decrypt the vault data
        let decrypted_data = crypto.decrypt_with_key(encrypted_data, &key)?;
        
        // Deserialize vault from JSON
        let vault: Vault = serde_json::from_slice(&decrypted_data)
            .map_err(|e| PassManError::SerializationError(e))?;
        
        Ok(vault)
    }
    
    /// Create a backup of the current vault
    /// 
    /// # Returns
    /// Unit on success
    /// 
    /// # Errors
    /// Returns an error if backup creation fails
    pub fn create_backup(&self) -> Result<()> {
        if !self.vault_exists() {
            return Ok(()); // Nothing to backup
        }
        
        let timestamp = chrono::Utc::now().format("%Y%m%d_%H%M%S");
        let backup_filename = format!("vault_backup_{}.vault", timestamp);
        let backup_path = self.backup_dir.join(backup_filename);
        
        fs::copy(&self.vault_path, &backup_path)
            .map_err(|e| PassManError::StorageError(format!("Failed to create backup: {}", e)))?;
        
        // Set secure permissions on backup
        self.set_secure_permissions(&backup_path)?;
        
        // Clean up old backups (keep only last 10)
        self.cleanup_old_backups()?;
        
        Ok(())
    }
    
    /// Export vault to a file (for backup/transfer)
    /// 
    /// # Arguments
    /// * `vault` - The vault to export
    /// * `crypto` - Crypto manager for encryption
    /// * `export_path` - Path where to save the exported vault
    /// 
    /// # Returns
    /// Unit on success
    /// 
    /// # Errors
    /// Returns an error if export fails
    pub fn export_vault(&self, vault: &Vault, crypto: &CryptoManager, export_path: &Path) -> Result<()> {
        // Serialize vault to JSON
        let vault_json = serde_json::to_string_pretty(vault)
            .map_err(|e| PassManError::SerializationError(e))?;
        
        // Encrypt the vault data
        let encrypted_data = crypto.encrypt(vault_json.as_bytes())?;
        
        // Write to export file
        let mut file = File::create(export_path)
            .map_err(|e| PassManError::StorageError(format!("Failed to create export file: {}", e)))?;
        
        file.write_all(&encrypted_data)
            .map_err(|e| PassManError::StorageError(format!("Failed to write export data: {}", e)))?;
        
        file.sync_all()
            .map_err(|e| PassManError::StorageError(format!("Failed to sync export data: {}", e)))?;
        
        // Set secure permissions
        self.set_secure_permissions(export_path)?;
        
        Ok(())
    }
    
    /// Import vault from a file
    /// 
    /// # Arguments
    /// * `crypto` - Crypto manager for decryption
    /// * `import_path` - Path to the vault file to import
    /// 
    /// # Returns
    /// The imported vault
    /// 
    /// # Errors
    /// Returns an error if import fails
    pub fn import_vault(&self, crypto: &CryptoManager, import_path: &Path) -> Result<Vault> {
        if !import_path.exists() {
            return Err(PassManError::StorageError(format!("Import file not found: {}", import_path.display())));
        }
        
        // Read encrypted data from import file
        let mut file = File::open(import_path)
            .map_err(|e| PassManError::StorageError(format!("Failed to open import file: {}", e)))?;
        
        let mut encrypted_data = Vec::new();
        file.read_to_end(&mut encrypted_data)
            .map_err(|e| PassManError::StorageError(format!("Failed to read import file: {}", e)))?;
        
        // Decrypt the vault data
        let decrypted_data = crypto.decrypt(&encrypted_data)?;
        
        // Deserialize vault from JSON
        let vault: Vault = serde_json::from_slice(&decrypted_data)
            .map_err(|e| PassManError::SerializationError(e))?;
        
        Ok(vault)
    }
    
    /// Get the vault file path
    pub fn vault_path(&self) -> &Path {
        &self.vault_path
    }
    
    /// Get vault file size in bytes
    /// 
    /// # Returns
    /// File size in bytes, or 0 if file doesn't exist
    pub fn vault_size(&self) -> Result<u64> {
        if !self.vault_exists() {
            return Ok(0);
        }
        
        let metadata = fs::metadata(&self.vault_path)
            .map_err(|e| PassManError::StorageError(format!("Failed to get vault metadata: {}", e)))?;
        
        Ok(metadata.len())
    }
    
    /// Get vault file modification time
    /// 
    /// # Returns
    /// Modification time, or None if file doesn't exist
    pub fn vault_modified(&self) -> Result<Option<std::time::SystemTime>> {
        if !self.vault_exists() {
            return Ok(None);
        }
        
        let metadata = fs::metadata(&self.vault_path)
            .map_err(|e| PassManError::StorageError(format!("Failed to get vault metadata: {}", e)))?;
        
        Ok(metadata.modified().ok())
    }
    
    /// Set secure file permissions (owner read/write only)
    fn set_secure_permissions(&self, path: &Path) -> Result<()> {
        #[cfg(unix)]
        {
            use std::os::unix::fs::PermissionsExt;
            let mut perms = fs::metadata(path)?.permissions();
            perms.set_mode(0o600); // rw-------
            fs::set_permissions(path, perms)?;
        }
        
        // On Windows, we rely on the file system's default behavior
        // and the fact that we're writing to a user-specific directory
        
        Ok(())
    }
    
    /// Clean up old backup files (keep only last 10)
    fn cleanup_old_backups(&self) -> Result<()> {
        let mut backup_files: Vec<_> = fs::read_dir(&self.backup_dir)?
            .filter_map(|entry| entry.ok())
            .filter(|entry| {
                entry.path().extension().map_or(false, |ext| ext == "vault")
            })
            .collect();
        
        // Sort by modification time (newest first)
        backup_files.sort_by_key(|entry| {
            entry.metadata()
                .and_then(|meta| meta.modified())
                .unwrap_or(std::time::UNIX_EPOCH)
        });
        backup_files.reverse();
        
        // Remove old backups (keep only last 10)
        for entry in backup_files.into_iter().skip(10) {
            let _ = fs::remove_file(entry.path());
        }
        
        Ok(())
    }
    
    /// List all available vaults
    /// 
    /// # Returns
    /// Vector of vault names
    pub fn list_vaults() -> Result<Vec<String>> {
        let vault_dir = Self::get_vault_directory()?;
        
        if !vault_dir.exists() {
            return Ok(Vec::new());
        }
        
        let vault_files: Vec<String> = fs::read_dir(&vault_dir)?
            .filter_map(|entry| entry.ok())
            .filter(|entry| {
                entry.path().extension().map_or(false, |ext| ext == "vault")
            })
            .filter_map(|entry| {
                entry.path()
                    .file_stem()
                    .and_then(|stem| stem.to_str())
                    .map(|s| s.to_string())
            })
            .collect();
        
        Ok(vault_files)
    }
    
    /// Delete a vault and all its backups
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
        let vault_dir = Self::get_vault_directory()?;
        let vault_path = vault_dir.join(format!("{}.vault", vault_name));
        let backup_dir = vault_dir.join("backups");
        
        // Delete main vault file
        if vault_path.exists() {
            fs::remove_file(&vault_path)
                .map_err(|e| PassManError::StorageError(format!("Failed to delete vault: {}", e)))?;
        }
        
        // Delete all backups for this vault
        if backup_dir.exists() {
            let _backup_pattern = format!("vault_backup_*_{}.vault", vault_name);
            for entry in fs::read_dir(&backup_dir)? {
                let entry = entry?;
                if let Some(filename) = entry.file_name().to_str() {
                    if filename.ends_with(&format!("_{}.vault", vault_name)) {
                        let _ = fs::remove_file(entry.path());
                    }
                }
            }
        }
        
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::TempDir;
    use crate::crypto::CryptoManager;
    use crate::models::{Vault, Account, AccountType};
    
    #[test]
    fn test_vault_storage_creation() {
        let temp_dir = TempDir::new().unwrap();
        let vault_storage = VaultStorage::new("test_vault").unwrap();
        assert!(!vault_storage.vault_exists());
    }
    
    #[test]
    fn test_vault_save_and_load() {
        let mut crypto = CryptoManager::new();
        let password = "test_password";
        let (_, salt) = crypto.generate_key_and_salt(password).unwrap();
        
        let vault_storage = VaultStorage::new("test_vault").unwrap();
        let mut vault = Vault::new("test@example.com".to_string());
        
        let account = Account::new(
            "Test Account".to_string(),
            AccountType::Personal,
            "test_password".to_string(),
        );
        vault.add_account(account);
        
        vault_storage.save_vault(&vault, &crypto).unwrap();
        assert!(vault_storage.vault_exists());
        
        let loaded_vault = vault_storage.load_vault(&crypto).unwrap();
        assert_eq!(vault.metadata.email, loaded_vault.metadata.email);
        assert_eq!(vault.accounts.len(), loaded_vault.accounts.len());
    }
}
