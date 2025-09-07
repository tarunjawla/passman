//! # PassMan Backend Library
//! 
//! This is the core library for PassMan, providing secure password management
//! functionality including encryption, storage, and password generation.
//! 
//! ## Features
//! - Secure vault encryption using AES-GCM-256
//! - Argon2id key derivation for master passwords
//! - Local-only storage with no cloud dependencies
//! - Password generation with customizable options
//! - Account management (CRUD operations)
//! - Memory-safe handling of sensitive data

pub mod auth;
pub mod crypto;
pub mod generator;
pub mod models;
pub mod storage;
pub mod vault;

// Re-export main types for easy access
pub use models::*;
pub use vault::PassMan;

/// Result type alias for PassMan operations
pub type Result<T> = std::result::Result<T, PassManError>;

/// Main error type for PassMan operations
#[derive(thiserror::Error, Debug)]
pub enum PassManError {
    #[error("Authentication failed: {0}")]
    AuthenticationFailed(String),
    
    #[error("Encryption error: {0}")]
    EncryptionError(String),
    
    #[error("Storage error: {0}")]
    StorageError(String),
    
    #[error("Vault not found: {0}")]
    VaultNotFound(String),
    
    #[error("Account not found: {0}")]
    AccountNotFound(String),
    
    #[error("Invalid input: {0}")]
    InvalidInput(String),
    
    #[error("IO error: {0}")]
    IoError(#[from] std::io::Error),
    
    #[error("Serialization error: {0}")]
    SerializationError(#[from] serde_json::Error),
    
    #[error("Crypto error: {0}")]
    CryptoError(String),
}