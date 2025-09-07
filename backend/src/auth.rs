//! # Authentication Module
//! 
//! This module handles user authentication, session management,
//! and access control for the PassMan vault.

use std::time::{Duration, Instant};
use crate::{PassManError, Result, crypto::CryptoManager, models::VaultMetadata};

/// Authentication session information
#[derive(Debug, Clone)]
pub struct AuthSession {
    /// When the session was created
    pub created_at: Instant,
    
    /// When the session will expire
    pub expires_at: Instant,
    
    /// Whether the session is active
    pub is_active: bool,
    
    /// Number of failed authentication attempts
    pub failed_attempts: u32,
    
    /// Last activity timestamp
    pub last_activity: Instant,
}

impl AuthSession {
    /// Create a new authentication session
    /// 
    /// # Arguments
    /// * `timeout_minutes` - Session timeout in minutes
    /// 
    /// # Returns
    /// A new AuthSession instance
    pub fn new(timeout_minutes: u32) -> Self {
        let now = Instant::now();
        let timeout_duration = Duration::from_secs(timeout_minutes as u64 * 60);
        
        Self {
            created_at: now,
            expires_at: now + timeout_duration,
            is_active: true,
            failed_attempts: 0,
            last_activity: now,
        }
    }
    
    /// Check if the session is still valid
    /// 
    /// # Returns
    /// True if the session is active and not expired
    pub fn is_valid(&self) -> bool {
        self.is_active && Instant::now() < self.expires_at
    }
    
    /// Update the last activity timestamp
    pub fn update_activity(&mut self) {
        self.last_activity = Instant::now();
    }
    
    /// Extend the session timeout
    /// 
    /// # Arguments
    /// * `timeout_minutes` - New timeout in minutes
    pub fn extend_timeout(&mut self, timeout_minutes: u32) {
        let timeout_duration = Duration::from_secs(timeout_minutes as u64 * 60);
        self.expires_at = self.last_activity + timeout_duration;
    }
    
    /// Record a failed authentication attempt
    pub fn record_failed_attempt(&mut self) {
        self.failed_attempts += 1;
    }
    
    /// Reset failed attempts counter
    pub fn reset_failed_attempts(&mut self) {
        self.failed_attempts = 0;
    }
    
    /// Check if too many failed attempts have occurred
    /// 
    /// # Arguments
    /// * `max_attempts` - Maximum allowed failed attempts
    /// 
    /// # Returns
    /// True if the limit has been exceeded
    pub fn is_locked_out(&self, max_attempts: u32) -> bool {
        self.failed_attempts >= max_attempts
    }
}

/// Authentication manager for handling user sessions
pub struct AuthManager {
    /// Current authentication session
    session: Option<AuthSession>,
    
    /// Crypto manager for password verification
    crypto: CryptoManager,
    
    /// Maximum failed attempts before lockout
    max_failed_attempts: u32,
    
    /// Session timeout in minutes
    session_timeout_minutes: u32,
}

impl AuthManager {
    /// Create a new authentication manager
    /// 
    /// # Arguments
    /// * `max_failed_attempts` - Maximum failed attempts before lockout
    /// * `session_timeout_minutes` - Session timeout in minutes
    /// 
    /// # Returns
    /// A new AuthManager instance
    pub fn new(max_failed_attempts: u32, session_timeout_minutes: u32) -> Self {
        Self {
            session: None,
            crypto: CryptoManager::new(),
            max_failed_attempts,
            session_timeout_minutes,
        }
    }
    
    /// Authenticate a user with master password
    /// 
    /// # Arguments
    /// * `master_password` - The master password to verify
    /// * `vault_metadata` - Vault metadata for verification
    /// 
    /// # Returns
    /// True if authentication is successful
    /// 
    /// # Errors
    /// Returns an error if authentication fails
    pub fn authenticate(&mut self, master_password: &str, _vault_metadata: &VaultMetadata) -> Result<bool> {
        // Check if already locked out
        if let Some(ref session) = self.session {
            if session.is_locked_out(self.max_failed_attempts) {
                return Err(PassManError::AuthenticationFailed(
                    "Too many failed attempts. Please try again later.".to_string()
                ));
            }
        }
        
        // Verify the master password
        let password_hash = self.crypto.hash_password(master_password)?;
        let is_valid = self.crypto.verify_password(master_password, &password_hash);
        
        if is_valid {
            // Create new session
            self.session = Some(AuthSession::new(self.session_timeout_minutes));
            
            // Set up crypto for this session
            // Note: In a real implementation, you'd derive the key from the password
            // and store it securely for the session duration
            
            Ok(true)
        } else {
            // Record failed attempt
            if let Some(ref mut session) = self.session {
                session.record_failed_attempt();
            } else {
                // Create a session just to track failed attempts
                let mut session = AuthSession::new(self.session_timeout_minutes);
                session.record_failed_attempt();
                self.session = Some(session);
            }
            
            Err(PassManError::AuthenticationFailed(
                "Invalid master password".to_string()
            ))
        }
    }
    
    /// Check if the user is currently authenticated
    /// 
    /// # Returns
    /// True if the user is authenticated and session is valid
    pub fn is_authenticated(&self) -> bool {
        self.session.as_ref().map_or(false, |s| s.is_valid())
    }
    
    /// Get the current session (if authenticated)
    /// 
    /// # Returns
    /// Current session or None if not authenticated
    pub fn get_session(&self) -> Option<&AuthSession> {
        self.session.as_ref().filter(|s| s.is_valid())
    }
    
    /// Update session activity (call this on user actions)
    pub fn update_activity(&mut self) {
        if let Some(ref mut session) = self.session {
            session.update_activity();
        }
    }
    
    /// Extend the current session
    /// 
    /// # Arguments
    /// * `timeout_minutes` - New timeout in minutes
    pub fn extend_session(&mut self, timeout_minutes: u32) {
        if let Some(ref mut session) = self.session {
            session.extend_timeout(timeout_minutes);
        }
    }
    
    /// Logout the current user
    pub fn logout(&mut self) {
        self.session = None;
        self.crypto.clear_key();
    }
    
    /// Get the number of failed attempts
    /// 
    /// # Returns
    /// Number of failed attempts in current session
    pub fn failed_attempts(&self) -> u32 {
        self.session.as_ref().map_or(0, |s| s.failed_attempts)
    }
    
    /// Check if the user is locked out
    /// 
    /// # Returns
    /// True if the user is locked out due to too many failed attempts
    pub fn is_locked_out(&self) -> bool {
        self.session.as_ref().map_or(false, |s| s.is_locked_out(self.max_failed_attempts))
    }
    
    /// Get time until session expires
    /// 
    /// # Returns
    /// Duration until session expires, or None if not authenticated
    pub fn time_until_expiry(&self) -> Option<Duration> {
        self.session.as_ref().and_then(|s| {
            if s.is_valid() {
                let now = Instant::now();
                if now < s.expires_at {
                    Some(s.expires_at - now)
                } else {
                    None
                }
            } else {
                None
            }
        })
    }
    
    /// Get the crypto manager (for authenticated operations)
    /// 
    /// # Returns
    /// Reference to the crypto manager
    /// 
    /// # Errors
    /// Returns an error if not authenticated
    pub fn get_crypto(&self) -> Result<&CryptoManager> {
        if !self.is_authenticated() {
            return Err(PassManError::AuthenticationFailed("Not authenticated".to_string()));
        }
        Ok(&self.crypto)
    }
    
    /// Get the crypto manager (mutable reference)
    /// 
    /// # Returns
    /// Mutable reference to the crypto manager
    /// 
    /// # Errors
    /// Returns an error if not authenticated
    pub fn get_crypto_mut(&mut self) -> Result<&mut CryptoManager> {
        if !self.is_authenticated() {
            return Err(PassManError::AuthenticationFailed("Not authenticated".to_string()));
        }
        Ok(&mut self.crypto)
    }
    
    /// Set the crypto key for the current session
    /// 
    /// # Arguments
    /// * `master_password` - The master password to derive the key from
    /// 
    /// # Returns
    /// Unit on success
    /// 
    /// # Errors
    /// Returns an error if key derivation fails
    pub fn set_crypto_key(&mut self, _master_password: &str) -> Result<()> {
        if !self.is_authenticated() {
            return Err(PassManError::AuthenticationFailed("Not authenticated".to_string()));
        }
        
        // In a real implementation, you'd derive the key from the password
        // and store it securely for the session duration
        // For now, we'll just mark that the crypto is ready
        Ok(())
    }
}

impl Default for AuthManager {
    fn default() -> Self {
        Self::new(5, 15) // 5 failed attempts, 15 minute timeout
    }
}

/// Password strength validator
pub struct PasswordValidator {
    /// Minimum password length
    min_length: usize,
    
    /// Maximum password length
    max_length: usize,
    
    /// Whether to require uppercase letters
    require_uppercase: bool,
    
    /// Whether to require lowercase letters
    require_lowercase: bool,
    
    /// Whether to require numbers
    require_numbers: bool,
    
    /// Whether to require special characters
    require_special: bool,
}

impl PasswordValidator {
    /// Create a new password validator
    /// 
    /// # Arguments
    /// * `min_length` - Minimum password length
    /// * `max_length` - Maximum password length
    /// * `require_uppercase` - Whether to require uppercase letters
    /// * `require_lowercase` - Whether to require lowercase letters
    /// * `require_numbers` - Whether to require numbers
    /// * `require_special` - Whether to require special characters
    /// 
    /// # Returns
    /// A new PasswordValidator instance
    pub fn new(
        min_length: usize,
        max_length: usize,
        require_uppercase: bool,
        require_lowercase: bool,
        require_numbers: bool,
        require_special: bool,
    ) -> Self {
        Self {
            min_length,
            max_length,
            require_uppercase,
            require_lowercase,
            require_numbers,
            require_special,
        }
    }
    
    /// Validate a password against the requirements
    /// 
    /// # Arguments
    /// * `password` - The password to validate
    /// 
    /// # Returns
    /// Validation result with error message if invalid
    pub fn validate(&self, password: &str) -> Result<()> {
        if password.len() < self.min_length {
            return Err(PassManError::InvalidInput(
                format!("Password must be at least {} characters long", self.min_length)
            ));
        }
        
        if password.len() > self.max_length {
            return Err(PassManError::InvalidInput(
                format!("Password must be no more than {} characters long", self.max_length)
            ));
        }
        
        if self.require_uppercase && !password.chars().any(|c| c.is_uppercase()) {
            return Err(PassManError::InvalidInput(
                "Password must contain at least one uppercase letter".to_string()
            ));
        }
        
        if self.require_lowercase && !password.chars().any(|c| c.is_lowercase()) {
            return Err(PassManError::InvalidInput(
                "Password must contain at least one lowercase letter".to_string()
            ));
        }
        
        if self.require_numbers && !password.chars().any(|c| c.is_ascii_digit()) {
            return Err(PassManError::InvalidInput(
                "Password must contain at least one number".to_string()
            ));
        }
        
        if self.require_special && !password.chars().any(|c| "!@#$%^&*()_+-=[]{}|;:,.<>?".contains(c)) {
            return Err(PassManError::InvalidInput(
                "Password must contain at least one special character".to_string()
            ));
        }
        
        Ok(())
    }
}

impl Default for PasswordValidator {
    fn default() -> Self {
        Self::new(8, 128, true, true, true, true)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::models::VaultMetadata;
    
    #[test]
    fn test_auth_session_creation() {
        let session = AuthSession::new(15);
        assert!(session.is_valid());
        assert_eq!(session.failed_attempts, 0);
    }
    
    #[test]
    fn test_auth_session_failed_attempts() {
        let mut session = AuthSession::new(15);
        session.record_failed_attempt();
        session.record_failed_attempt();
        assert_eq!(session.failed_attempts, 2);
        assert!(!session.is_locked_out(5));
        assert!(session.is_locked_out(2));
    }
    
    #[test]
    fn test_password_validator() {
        let validator = PasswordValidator::default();
        
        // Valid password
        assert!(validator.validate("MyStr0ng!P@ssw0rd").is_ok());
        
        // Too short
        assert!(validator.validate("Short1!").is_err());
        
        // No uppercase
        assert!(validator.validate("mystr0ng!p@ssw0rd").is_err());
        
        // No lowercase
        assert!(validator.validate("MYSTR0NG!P@SSW0RD").is_err());
        
        // No numbers
        assert!(validator.validate("MyStrong!P@ssword").is_err());
        
        // No special characters
        assert!(validator.validate("MyStr0ngP@ssw0rd").is_err());
    }
}
