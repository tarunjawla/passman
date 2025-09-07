//! # Password Generator
//! 
//! This module provides secure password generation functionality with
//! customizable options for length, character sets, and exclusions.

use rand::{Rng, thread_rng};
use crate::{PassManError, Result, models::PasswordOptions};

/// Character sets for password generation
const UPPERCASE: &str = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LOWERCASE: &str = "abcdefghijklmnopqrstuvwxyz";
const NUMBERS: &str = "0123456789";
const SPECIAL: &str = "!@#$%^&*()_+-=[]{}|;:,.<>?";

/// Characters that are visually similar and might be confused
const SIMILAR_CHARS: &str = "0OIl1|";
/// Characters that are ambiguous in certain contexts
const AMBIGUOUS_CHARS: &str = "{}[]()\\/~,;.<>";

/// Password generator with configurable options
pub struct PasswordGenerator {
    /// Random number generator
    rng: rand::rngs::ThreadRng,
}

impl PasswordGenerator {
    /// Create a new password generator
    pub fn new() -> Self {
        Self {
            rng: thread_rng(),
        }
    }
    
    /// Generate a password with the given options
    /// 
    /// # Arguments
    /// * `options` - Configuration options for password generation
    /// 
    /// # Returns
    /// A generated password string
    /// 
    /// # Errors
    /// Returns an error if the options are invalid or generation fails
    pub fn generate(&mut self, options: &PasswordOptions) -> Result<String> {
        self.validate_options(options)?;
        
        let charset = self.build_charset(options);
        if charset.is_empty() {
            return Err(PassManError::InvalidInput("No character set available".to_string()));
        }
        
        let mut password = String::with_capacity(options.length);
        
        // Ensure at least one character from each required set
        if options.include_uppercase {
            password.push(self.random_char_from(UPPERCASE));
        }
        if options.include_lowercase {
            password.push(self.random_char_from(LOWERCASE));
        }
        if options.include_numbers {
            password.push(self.random_char_from(NUMBERS));
        }
        if options.include_special {
            password.push(self.random_char_from(SPECIAL));
        }
        
        // Fill the rest with random characters from the full charset
        while password.len() < options.length {
            password.push(self.random_char_from(&charset));
        }
        
        // Shuffle the password to avoid predictable patterns
        self.shuffle_string(&mut password);
        
        Ok(password)
    }
    
    /// Generate a simple password with default options
    /// 
    /// # Arguments
    /// * `length` - Length of the password to generate
    /// 
    /// # Returns
    /// A generated password string
    pub fn generate_simple(&mut self, length: usize) -> Result<String> {
        let options = PasswordOptions::simple(length);
        self.generate(&options)
    }
    
    /// Generate a strong password with all character types
    /// 
    /// # Arguments
    /// * `length` - Length of the password to generate
    /// 
    /// # Returns
    /// A generated password string
    pub fn generate_strong(&mut self, length: usize) -> Result<String> {
        let options = PasswordOptions::strong(length);
        self.generate(&options)
    }
    
    /// Generate a passphrase using common words
    /// 
    /// # Arguments
    /// * `word_count` - Number of words in the passphrase
    /// * `separator` - Character to separate words (default: space)
    /// 
    /// # Returns
    /// A generated passphrase
    pub fn generate_passphrase(&mut self, word_count: usize, separator: Option<char>) -> Result<String> {
        if word_count == 0 {
            return Err(PassManError::InvalidInput("Word count must be greater than 0".to_string()));
        }
        
        let words = include_str!("wordlist.txt");
        let word_list: Vec<&str> = words.lines().collect();
        
        if word_list.is_empty() {
            return Err(PassManError::InvalidInput("Word list is empty".to_string()));
        }
        
        let sep = separator.unwrap_or(' ');
        let mut passphrase = String::new();
        
        for i in 0..word_count {
            if i > 0 {
                passphrase.push(sep);
            }
            let word = word_list[self.rng.gen_range(0..word_list.len())];
            passphrase.push_str(word);
        }
        
        Ok(passphrase)
    }
    
    /// Calculate password strength score (0-100)
    /// 
    /// # Arguments
    /// * `password` - The password to analyze
    /// 
    /// # Returns
    /// A strength score from 0 (weak) to 100 (very strong)
    pub fn calculate_strength(&self, password: &str) -> u8 {
        if password.is_empty() {
            return 0;
        }
        
        let mut score = 0u8;
        
        // Length bonus
        score += match password.len() {
            1..=7 => 10,
            8..=11 => 20,
            12..=15 => 30,
            16..=19 => 40,
            20..=23 => 50,
            _ => 60,
        };
        
        // Character variety bonus
        let has_upper = password.chars().any(|c| c.is_uppercase());
        let has_lower = password.chars().any(|c| c.is_lowercase());
        let has_digit = password.chars().any(|c| c.is_ascii_digit());
        let has_special = password.chars().any(|c| "!@#$%^&*()_+-=[]{}|;:,.<>?".contains(c));
        
        if has_upper { score += 10; }
        if has_lower { score += 10; }
        if has_digit { score += 10; }
        if has_special { score += 10; }
        
        // Pattern penalty
        if self.has_repeating_patterns(password) {
            score = score.saturating_sub(20);
        }
        
        // Common password penalty
        if self.is_common_password(password) {
            score = score.saturating_sub(30);
        }
        
        score.min(100)
    }
    
    /// Get strength description based on score
    /// 
    /// # Arguments
    /// * `score` - The strength score (0-100)
    /// 
    /// # Returns
    /// A human-readable strength description
    pub fn get_strength_description(&self, score: u8) -> &'static str {
        match score {
            0..=20 => "Very Weak",
            21..=40 => "Weak",
            41..=60 => "Fair",
            61..=80 => "Good",
            81..=90 => "Strong",
            91..=100 => "Very Strong",
            _ => "Unknown",
        }
    }
    
    /// Validate password generation options
    fn validate_options(&self, options: &PasswordOptions) -> Result<()> {
        if options.length == 0 {
            return Err(PassManError::InvalidInput("Password length must be greater than 0".to_string()));
        }
        
        if options.length > 1000 {
            return Err(PassManError::InvalidInput("Password length too long (max 1000)".to_string()));
        }
        
        if !options.include_uppercase && !options.include_lowercase && 
           !options.include_numbers && !options.include_special {
            return Err(PassManError::InvalidInput("At least one character type must be enabled".to_string()));
        }
        
        Ok(())
    }
    
    /// Build character set based on options
    fn build_charset(&self, options: &PasswordOptions) -> String {
        let mut charset = String::new();
        
        if options.include_uppercase {
            charset.push_str(UPPERCASE);
        }
        if options.include_lowercase {
            charset.push_str(LOWERCASE);
        }
        if options.include_numbers {
            charset.push_str(NUMBERS);
        }
        if options.include_special {
            charset.push_str(SPECIAL);
        }
        
        // Remove similar characters if requested
        if options.exclude_similar {
            charset = charset.chars()
                .filter(|c| !SIMILAR_CHARS.contains(*c))
                .collect();
        }
        
        // Remove ambiguous characters if requested
        if options.exclude_ambiguous {
            charset = charset.chars()
                .filter(|c| !AMBIGUOUS_CHARS.contains(*c))
                .collect();
        }
        
        charset
    }
    
    /// Get a random character from the given character set
    fn random_char_from(&mut self, charset: &str) -> char {
        let index = self.rng.gen_range(0..charset.len());
        charset.chars().nth(index).unwrap()
    }
    
    /// Shuffle a string in place using Fisher-Yates algorithm
    fn shuffle_string(&mut self, s: &mut String) {
        let mut chars: Vec<char> = s.chars().collect();
        for i in (1..chars.len()).rev() {
            let j = self.rng.gen_range(0..=i);
            chars.swap(i, j);
        }
        *s = chars.into_iter().collect();
    }
    
    /// Check if password has repeating patterns
    fn has_repeating_patterns(&self, password: &str) -> bool {
        // Check for repeated characters
        let chars: Vec<char> = password.chars().collect();
        for i in 0..chars.len().saturating_sub(2) {
            if chars[i] == chars[i + 1] && chars[i + 1] == chars[i + 2] {
                return true;
            }
        }
        
        // Check for keyboard patterns
        let keyboard_rows = [
            "qwertyuiop",
            "asdfghjkl",
            "zxcvbnm",
            "1234567890",
        ];
        
        for row in &keyboard_rows {
            for i in 0..password.len().saturating_sub(2) {
                let substr = &password[i..i + 3];
                if row.contains(substr) {
                    return true;
                }
            }
        }
        
        false
    }
    
    /// Check if password is in common password list
    fn is_common_password(&self, password: &str) -> bool {
        let common_passwords = [
            "password", "123456", "123456789", "qwerty", "abc123",
            "password123", "admin", "letmein", "welcome", "monkey",
            "1234567890", "password1", "qwerty123", "dragon", "master",
        ];
        
        common_passwords.contains(&password.to_lowercase().as_str())
    }
}

impl Default for PasswordGenerator {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_password_generation() {
        let mut generator = PasswordGenerator::new();
        let options = PasswordOptions::default();
        
        let password = generator.generate(&options).unwrap();
        assert_eq!(password.len(), options.length);
    }
    
    #[test]
    fn test_simple_password() {
        let mut generator = PasswordGenerator::new();
        let password = generator.generate_simple(12).unwrap();
        assert_eq!(password.len(), 12);
    }
    
    #[test]
    fn test_strong_password() {
        let mut generator = PasswordGenerator::new();
        let password = generator.generate_strong(16).unwrap();
        assert_eq!(password.len(), 16);
    }
    
    #[test]
    fn test_strength_calculation() {
        let generator = PasswordGenerator::new();
        
        assert_eq!(generator.calculate_strength(""), 0);
        assert!(generator.calculate_strength("password") < 50);
        assert!(generator.calculate_strength("MyStr0ng!P@ssw0rd") > 80);
    }
    
    #[test]
    fn test_invalid_options() {
        let mut generator = PasswordGenerator::new();
        
        // Zero length
        let options = PasswordOptions { length: 0, ..Default::default() };
        assert!(generator.generate(&options).is_err());
        
        // No character types
        let options = PasswordOptions {
            length: 10,
            include_uppercase: false,
            include_lowercase: false,
            include_numbers: false,
            include_special: false,
            ..Default::default()
        };
        assert!(generator.generate(&options).is_err());
    }
}
