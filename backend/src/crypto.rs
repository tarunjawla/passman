//! # Cryptographic Functions
//! 
//! This module provides secure encryption and decryption functionality
//! using AES-GCM-256 for vault encryption and Argon2id for key derivation.

use aes_gcm::{Aes256Gcm, Key, Nonce, aead::{Aead, KeyInit}};
use argon2::{Argon2, PasswordHash, PasswordHasher, PasswordVerifier, password_hash::{SaltString, rand_core::OsRng}};
use rand::RngCore;
use zeroize::{Zeroize, ZeroizeOnDrop};
use crate::{PassManError, Result};

/// Size of the encryption key in bytes (256 bits)
const KEY_SIZE: usize = 32;
/// Size of the nonce in bytes (96 bits)
const NONCE_SIZE: usize = 12;
/// Size of the salt in bytes (128 bits)
const SALT_SIZE: usize = 16;

/// Secure key container that zeroizes on drop
#[derive(ZeroizeOnDrop, Clone)]
pub struct SecureKey([u8; KEY_SIZE]);

impl SecureKey {
    /// Create a new secure key from bytes
    pub fn new(key: [u8; KEY_SIZE]) -> Self {
        Self(key)
    }
    
    /// Get the key bytes (use with caution)
    pub fn as_bytes(&self) -> &[u8; KEY_SIZE] {
        &self.0
    }
}

/// Salt container for key derivation
#[derive(Clone, Debug)]
pub struct Salt([u8; SALT_SIZE]);

impl Salt {
    /// Generate a new random salt
    pub fn generate() -> Self {
        let mut salt = [0u8; SALT_SIZE];
        OsRng.fill_bytes(&mut salt);
        Self(salt)
    }
    
    /// Create salt from bytes
    pub fn from_bytes(bytes: [u8; SALT_SIZE]) -> Self {
        Self(bytes)
    }
    
    /// Get salt bytes
    pub fn as_bytes(&self) -> &[u8; SALT_SIZE] {
        &self.0
    }
}

/// Cryptographic operations manager
pub struct CryptoManager {
    /// The encryption key (will be zeroized on drop)
    key: Option<SecureKey>,
    /// Salt used for key derivation
    salt: Option<Salt>,
}

impl CryptoManager {
    /// Create a new crypto manager
    pub fn new() -> Self {
        Self {
            key: None,
            salt: None,
        }
    }
    
    /// Derive a key from a master password using Argon2id
    /// 
    /// # Arguments
    /// * `master_password` - The master password to derive the key from
    /// * `salt` - The salt to use for key derivation
    /// 
    /// # Returns
    /// A secure key derived from the master password
    /// 
    /// # Errors
    /// Returns an error if key derivation fails
    pub fn derive_key(&mut self, master_password: &str, salt: &Salt) -> Result<SecureKey> {
        let salt_string = SaltString::encode_b64(salt.as_bytes())
            .map_err(|e| PassManError::CryptoError(format!("Invalid salt: {}", e)))?;
        
        let argon2 = Argon2::default();
        let mut key_bytes = [0u8; KEY_SIZE];
        
        argon2
            .hash_password_into(master_password.as_bytes(), salt_string.as_salt().as_ref(), &mut key_bytes)
            .map_err(|e| PassManError::CryptoError(format!("Key derivation failed: {}", e)))?;
        
        let key = SecureKey::new(key_bytes);
        self.key = Some(key.clone());
        self.salt = Some(salt.clone());
        
        Ok(key)
    }
    
    /// Generate a new salt and derive a key
    /// 
    /// # Arguments
    /// * `master_password` - The master password to derive the key from
    /// 
    /// # Returns
    /// A tuple containing the derived key and the generated salt
    pub fn generate_key_and_salt(&mut self, master_password: &str) -> Result<(SecureKey, Salt)> {
        let salt = Salt::generate();
        let key = self.derive_key(master_password, &salt)?;
        Ok((key, salt))
    }
    
    /// Verify a master password against a stored hash
    /// 
    /// # Arguments
    /// * `master_password` - The password to verify
    /// * `stored_hash` - The stored password hash
    /// 
    /// # Returns
    /// True if the password is correct, false otherwise
    pub fn verify_password(&self, master_password: &str, stored_hash: &str) -> bool {
        let parsed_hash = match PasswordHash::new(stored_hash) {
            Ok(hash) => hash,
            Err(_) => return false,
        };
        
        Argon2::default()
            .verify_password(master_password.as_bytes(), &parsed_hash)
            .is_ok()
    }
    
    /// Create a password hash for storage
    /// 
    /// # Arguments
    /// * `master_password` - The password to hash
    /// 
    /// # Returns
    /// A string containing the password hash
    pub fn hash_password(&self, master_password: &str) -> Result<String> {
        let salt = SaltString::generate(&mut OsRng);
        let argon2 = Argon2::default();
        
        let password_hash = argon2
            .hash_password(master_password.as_bytes(), &salt)
            .map_err(|e| PassManError::CryptoError(format!("Password hashing failed: {}", e)))?;
        
        Ok(password_hash.to_string())
    }
    
    /// Encrypt data using AES-GCM-256
    /// 
    /// # Arguments
    /// * `data` - The data to encrypt
    /// 
    /// # Returns
    /// Encrypted data with nonce prepended
    /// 
    /// # Errors
    /// Returns an error if encryption fails or no key is set
    pub fn encrypt(&self, data: &[u8]) -> Result<Vec<u8>> {
        let key = self.key.as_ref()
            .ok_or_else(|| PassManError::CryptoError("No encryption key set".to_string()))?;
        
        self.encrypt_with_key(data, key)
    }
    
    /// Encrypt data with a specific key
    /// 
    /// # Arguments
    /// * `data` - The data to encrypt
    /// * `key` - The encryption key to use
    /// 
    /// # Returns
    /// Encrypted data with nonce prepended
    pub fn encrypt_with_key(&self, data: &[u8], key: &SecureKey) -> Result<Vec<u8>> {
        let key = Key::<Aes256Gcm>::from_slice(key.as_bytes());
        let cipher = Aes256Gcm::new(&key);
        let nonce_bytes = self.generate_nonce();
        let nonce = Nonce::from_slice(&nonce_bytes);
        
        let ciphertext = cipher
            .encrypt(nonce, data)
            .map_err(|e| PassManError::CryptoError(format!("Encryption failed: {}", e)))?;
        
        // Prepend nonce to ciphertext
        let mut result = Vec::with_capacity(NONCE_SIZE + ciphertext.len());
        result.extend_from_slice(&nonce_bytes);
        result.extend_from_slice(&ciphertext);
        
        Ok(result)
    }
    
    /// Decrypt data using AES-GCM-256
    /// 
    /// # Arguments
    /// * `encrypted_data` - The encrypted data with nonce prepended
    /// 
    /// # Returns
    /// Decrypted data
    /// 
    /// # Errors
    /// Returns an error if decryption fails or no key is set
    pub fn decrypt(&self, encrypted_data: &[u8]) -> Result<Vec<u8>> {
        let key = self.key.as_ref()
            .ok_or_else(|| PassManError::CryptoError("No decryption key set".to_string()))?;
        
        self.decrypt_with_key(encrypted_data, key)
    }
    
    /// Decrypt data with a specific key
    /// 
    /// # Arguments
    /// * `encrypted_data` - The encrypted data with nonce prepended
    /// * `key` - The decryption key to use
    /// 
    /// # Returns
    /// Decrypted data
    pub fn decrypt_with_key(&self, encrypted_data: &[u8], key: &SecureKey) -> Result<Vec<u8>> {
        if encrypted_data.len() < NONCE_SIZE {
            return Err(PassManError::CryptoError("Invalid encrypted data: too short".to_string()));
        }
        
        let (nonce_bytes, ciphertext) = encrypted_data.split_at(NONCE_SIZE);
        let key = Key::<Aes256Gcm>::from_slice(key.as_bytes());
        let cipher = Aes256Gcm::new(&key);
        let nonce = Nonce::from_slice(nonce_bytes);
        
        let plaintext = cipher
            .decrypt(nonce, ciphertext)
            .map_err(|e| PassManError::CryptoError(format!("Decryption failed: {}", e)))?;
        
        Ok(plaintext)
    }
    
    /// Generate a random nonce
    fn generate_nonce(&self) -> [u8; NONCE_SIZE] {
        let mut nonce = [0u8; NONCE_SIZE];
        OsRng.fill_bytes(&mut nonce);
        nonce
    }
    
    /// Check if a key is currently set
    pub fn has_key(&self) -> bool {
        self.key.is_some()
    }
    
    /// Clear the current key from memory
    pub fn clear_key(&mut self) {
        self.key = None;
    }
}

impl Default for CryptoManager {
    fn default() -> Self {
        Self::new()
    }
}

/// Utility functions for secure string handling
pub mod secure_string {
    use zeroize::{Zeroize, ZeroizeOnDrop};
    
    /// A secure string that zeroizes on drop
    #[derive(ZeroizeOnDrop)]
    pub struct SecureString(String);
    
    impl SecureString {
        /// Create a new secure string
        pub fn new(s: String) -> Self {
            Self(s)
        }
        
        /// Get the string as a slice
        pub fn as_str(&self) -> &str {
            &self.0
        }
        
        /// Get the string as bytes
        pub fn as_bytes(&self) -> &[u8] {
            self.0.as_bytes()
        }
        
        /// Get the string length
        pub fn len(&self) -> usize {
            self.0.len()
        }
        
        /// Check if the string is empty
        pub fn is_empty(&self) -> bool {
            self.0.is_empty()
        }
    }
    
    impl From<String> for SecureString {
        fn from(s: String) -> Self {
            Self::new(s)
        }
    }
    
    impl From<&str> for SecureString {
        fn from(s: &str) -> Self {
            Self::new(s.to_string())
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_key_derivation() {
        let mut crypto = CryptoManager::new();
        let password = "test_password_123";
        let salt = Salt::generate();
        
        let key1 = crypto.derive_key(password, &salt).unwrap();
        let key2 = crypto.derive_key(password, &salt).unwrap();
        
        // Same password and salt should produce same key
        assert_eq!(key1.as_bytes(), key2.as_bytes());
    }
    
    #[test]
    fn test_encryption_decryption() {
        let mut crypto = CryptoManager::new();
        let password = "test_password_123";
        let (key, salt) = crypto.generate_key_and_salt(password).unwrap();
        
        let plaintext = b"Hello, World!";
        let encrypted = crypto.encrypt_with_key(plaintext, &key).unwrap();
        let decrypted = crypto.decrypt_with_key(&encrypted, &key).unwrap();
        
        assert_eq!(plaintext, &decrypted[..]);
    }
    
    #[test]
    fn test_password_hashing() {
        let crypto = CryptoManager::new();
        let password = "test_password_123";
        
        let hash = crypto.hash_password(password).unwrap();
        assert!(crypto.verify_password(password, &hash));
        assert!(!crypto.verify_password("wrong_password", &hash));
    }
}
