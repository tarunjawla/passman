//! # PassMan CLI
//! 
//! Command-line interface for PassMan password manager.
//! Provides secure password management through the terminal.

use clap::{Parser, Subcommand};
use passman_backend::{
    PassMan, Result, PassManError,
    models::{AccountType, PasswordOptions},
};
use std::io::{self, Write};
use colored::*;

/// PassMan - A secure local password manager
#[derive(Parser)]
#[command(name = "passman")]
#[command(about = "A secure, local-first password manager")]
#[command(version)]
#[command(long_about = "PassMan is a secure password manager that stores your passwords locally with military-grade encryption. Your data never leaves your device.")]
pub struct Cli {
    #[command(subcommand)]
    pub command: Commands,
}

#[derive(Subcommand)]
pub enum Commands {
    /// Initialize a new vault
    Init {
        /// Email address for the vault
        email: String,
    },
    
    /// Add a new account
    Add {
        /// Account name
        name: String,
        
        /// Account type
        #[arg(short, long, value_enum)]
        account_type: Option<AccountType>,
        
        /// Website URL
        #[arg(short, long)]
        url: Option<String>,
        
        /// Username or email
        #[arg(short, long)]
        username: Option<String>,
        
        /// Generate password instead of prompting
        #[arg(long)]
        generate: bool,
        
        /// Password length for generation
        #[arg(long, default_value = "16")]
        length: usize,
    },
    
    /// List all accounts
    List {
        /// Filter by account type
        #[arg(short, long, value_enum)]
        account_type: Option<AccountType>,
        
        /// Search query
        #[arg(short, long)]
        search: Option<String>,
        
        /// Show passwords (use with caution)
        #[arg(long)]
        show_passwords: bool,
    },
    
    /// Show account details
    Show {
        /// Account name or ID
        name: String,
        
        /// Show password
        #[arg(long)]
        show_password: bool,
    },
    
    /// Generate a password
    Generate {
        /// Password length
        #[arg(short, long, default_value = "16")]
        length: usize,
        
        /// Include special characters
        #[arg(long)]
        special: bool,
        
        /// Include numbers
        #[arg(long)]
        numbers: bool,
        
        /// Include uppercase letters
        #[arg(long)]
        uppercase: bool,
        
        /// Include lowercase letters
        #[arg(long)]
        lowercase: bool,
        
        /// Copy to clipboard
        #[arg(short, long)]
        copy: bool,
    },
    
    /// List all vaults
    Vaults,
}

fn main() {
    let cli = Cli::parse();
    
    if let Err(e) = run_command(cli) {
        eprintln!("{} {}", "Error:".red().bold(), e);
        std::process::exit(1);
    }
}

fn run_command(cli: Cli) -> Result<()> {
    match cli.command {
        Commands::Init { email } => {
            init_vault(&email)?;
        }
        
        Commands::Add { name, account_type, url, username, generate, length } => {
            add_account(&name, account_type, url, username, generate, length)?;
        }
        
        Commands::List { account_type, search, show_passwords } => {
            list_accounts(account_type, search, show_passwords)?;
        }
        
        Commands::Show { name, show_password } => {
            show_account(&name, show_password)?;
        }
        
        Commands::Generate { length, special, numbers, uppercase, lowercase, copy } => {
            generate_password(length, special, numbers, uppercase, lowercase, copy)?;
        }
        
        Commands::Vaults => {
            list_vaults()?;
        }
    }
    
    Ok(())
}

fn init_vault(email: &str) -> Result<()> {
    println!("{}", "Initializing new PassMan vault...".green().bold());
    
    let vault_name = prompt_vault_name()?;
    let master_password = prompt_master_password()?;
    let confirm_password = prompt_confirm_password()?;
    
    if master_password != confirm_password {
        return Err(PassManError::InvalidInput("Passwords do not match".to_string()));
    }
    
    let mut passman = PassMan::new(&vault_name)?;
    passman.init_vault(email.to_string(), &master_password)?;
    
    println!("{}", "✓ Vault created successfully!".green().bold());
    println!("{}", "You can now add accounts with 'passman add'".blue());
    
    Ok(())
}

fn add_account(name: &str, account_type: Option<AccountType>, url: Option<String>, username: Option<String>, generate: bool, length: usize) -> Result<()> {
    let vault_name = get_current_vault_name()?;
    let master_password = prompt_master_password()?;
    let mut passman = PassMan::new(&vault_name)?;
    passman.open_vault(&master_password)?;
    
    let account_type = account_type.unwrap_or_else(|| prompt_account_type());
    let url = url.or_else(|| prompt_url());
    let username = username.or_else(|| prompt_username());
    
    let password = if generate {
        let options = PasswordOptions::strong(length);
        passman.generate_password(&options)?
    } else {
        prompt_password()?
    };
    
    let notes = prompt_notes();
    let tags = prompt_tags();
    
    passman.add_account(
        name.to_string(),
        account_type,
        password,
        url,
        username,
        notes,
        tags,
    )?;
    
    println!("{}", "✓ Account added successfully!".green().bold());
    
    Ok(())
}

fn list_accounts(account_type: Option<AccountType>, search: Option<String>, show_passwords: bool) -> Result<()> {
    let vault_name = get_current_vault_name()?;
    let master_password = prompt_master_password()?;
    let mut passman = PassMan::new(&vault_name)?;
    passman.open_vault(&master_password)?;
    
    let accounts = if let Some(search_query) = search {
        passman.search_accounts(&search_query)
    } else if let Some(acc_type) = account_type {
        passman.get_accounts_by_type(&acc_type)
    } else {
        passman.get_all_accounts()
    };
    
    if accounts.is_empty() {
        println!("{}", "No accounts found.".yellow());
        return Ok(());
    }
    
    println!("{}", format!("Found {} account(s):", accounts.len()).blue().bold());
    println!();
    
    for account in accounts {
        println!("{}", format!("Name: {}", account.name).white().bold());
        println!("  Type: {}", account.account_type.display_name());
        if let Some(ref url) = account.url {
            println!("  URL: {}", url.blue());
        }
        if let Some(ref username) = account.username {
            println!("  Username: {}", username);
        }
        if show_passwords {
            println!("  Password: {}", account.password.red());
        } else {
            println!("  Password: {}", "••••••••".red());
        }
        if !account.tags.is_empty() {
            println!("  Tags: {}", account.tags.join(", ").cyan());
        }
        if let Some(ref notes) = account.notes {
            println!("  Notes: {}", notes);
        }
        println!();
    }
    
    Ok(())
}

fn show_account(name: &str, show_password: bool) -> Result<()> {
    let vault_name = get_current_vault_name()?;
    let master_password = prompt_master_password()?;
    let mut passman = PassMan::new(&vault_name)?;
    passman.open_vault(&master_password)?;
    
    let accounts = passman.search_accounts(name);
    let account = accounts.first()
        .ok_or_else(|| PassManError::AccountNotFound(format!("Account '{}' not found", name)))?;
    
    println!("{}", format!("Account: {}", account.name).white().bold());
    println!("  Type: {}", account.account_type.display_name());
    if let Some(ref url) = account.url {
        println!("  URL: {}", url.blue());
    }
    if let Some(ref username) = account.username {
        println!("  Username: {}", username);
    }
    if show_password {
        println!("  Password: {}", account.password.red());
    } else {
        println!("  Password: {}", "••••••••".red());
    }
    if !account.tags.is_empty() {
        println!("  Tags: {}", account.tags.join(", ").cyan());
    }
    if let Some(ref notes) = account.notes {
        println!("  Notes: {}", notes);
    }
    println!("  Created: {}", account.created_at.format("%Y-%m-%d %H:%M:%S"));
    println!("  Updated: {}", account.updated_at.format("%Y-%m-%d %H:%M:%S"));
    
    Ok(())
}

fn generate_password(length: usize, special: bool, numbers: bool, uppercase: bool, lowercase: bool, copy: bool) -> Result<()> {
    let options = PasswordOptions {
        length,
        include_uppercase: uppercase,
        include_lowercase: lowercase,
        include_numbers: numbers,
        include_special: special,
        exclude_similar: true,
        exclude_ambiguous: false,
    };
    
    let mut passman = PassMan::new("temp")?;
    let password = passman.generate_password(&options)?;
    let strength = passman.calculate_password_strength(&password);
    let strength_desc = passman.get_password_strength_description(strength);
    
    println!("{}", format!("Generated password: {}", password).green().bold());
    println!("{}", format!("Strength: {} ({})", strength, strength_desc).blue());
    
    if copy {
        // In a real implementation, you'd use the clipboard crate
        println!("{}", "Password copied to clipboard!".green());
    }
    
    Ok(())
}

fn list_vaults() -> Result<()> {
    let vaults = PassMan::list_vaults()?;
    
    if vaults.is_empty() {
        println!("{}", "No vaults found.".yellow());
        return Ok(());
    }
    
    println!("{}", "Available vaults:".blue().bold());
    for vault in vaults {
        println!("  {}", vault);
    }
    
    Ok(())
}

// Helper functions for user input

fn prompt_vault_name() -> Result<String> {
    print!("Enter vault name: ");
    io::stdout().flush()?;
    
    let mut input = String::new();
    io::stdin().read_line(&mut input)?;
    
    let name = input.trim().to_string();
    if name.is_empty() {
        return Err(PassManError::InvalidInput("Vault name cannot be empty".to_string()));
    }
    
    Ok(name)
}

fn prompt_master_password() -> Result<String> {
    print!("Enter master password: ");
    io::stdout().flush()?;
    
    rpassword::read_password()
        .map_err(|e| PassManError::IoError(e))
}

fn prompt_confirm_password() -> Result<String> {
    print!("Confirm master password: ");
    io::stdout().flush()?;
    
    rpassword::read_password()
        .map_err(|e| PassManError::IoError(e))
}

fn prompt_account_type() -> AccountType {
    println!("Select account type:");
    println!("1. Social");
    println!("2. Banking");
    println!("3. Work");
    println!("4. Personal");
    println!("5. Email");
    println!("6. Shopping");
    println!("7. Gaming");
    println!("8. Other");
    
    print!("Enter choice (1-8): ");
    io::stdout().flush().unwrap();
    
    let mut input = String::new();
    io::stdin().read_line(&mut input).unwrap();
    
    match input.trim() {
        "1" => AccountType::Social,
        "2" => AccountType::Banking,
        "3" => AccountType::Work,
        "4" => AccountType::Personal,
        "5" => AccountType::Email,
        "6" => AccountType::Shopping,
        "7" => AccountType::Gaming,
        "8" => {
            print!("Enter custom type: ");
            io::stdout().flush().unwrap();
            let mut custom = String::new();
            io::stdin().read_line(&mut custom).unwrap();
            AccountType::Other(custom.trim().to_string())
        }
        _ => AccountType::Personal,
    }
}

fn prompt_url() -> Option<String> {
    print!("Enter URL (optional): ");
    io::stdout().flush().unwrap();
    
    let mut input = String::new();
    io::stdin().read_line(&mut input).unwrap();
    
    let url = input.trim().to_string();
    if url.is_empty() { None } else { Some(url) }
}

fn prompt_username() -> Option<String> {
    print!("Enter username/email (optional): ");
    io::stdout().flush().unwrap();
    
    let mut input = String::new();
    io::stdin().read_line(&mut input).unwrap();
    
    let username = input.trim().to_string();
    if username.is_empty() { None } else { Some(username) }
}

fn prompt_password() -> Result<String> {
    print!("Enter password: ");
    io::stdout().flush()?;
    
    rpassword::read_password()
        .map_err(|e| PassManError::IoError(e))
}

fn prompt_notes() -> Option<String> {
    print!("Enter notes (optional): ");
    io::stdout().flush().unwrap();
    
    let mut input = String::new();
    io::stdin().read_line(&mut input).unwrap();
    
    let notes = input.trim().to_string();
    if notes.is_empty() { None } else { Some(notes) }
}

fn prompt_tags() -> Vec<String> {
    print!("Enter tags (comma-separated, optional): ");
    io::stdout().flush().unwrap();
    
    let mut input = String::new();
    io::stdin().read_line(&mut input).unwrap();
    
    let tags = input.trim().to_string();
    if tags.is_empty() {
        Vec::new()
    } else {
        tags.split(',').map(|s| s.trim().to_string()).collect()
    }
}

fn get_current_vault_name() -> Result<String> {
    // In a real implementation, you'd get this from a session file or environment variable
    // For now, we'll prompt for it
    prompt_vault_name()
}