// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use passman_backend::{PassMan, models::{Account, AccountType, PasswordOptions}};
use std::collections::HashMap;

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
async fn greet(name: &str) -> Result<String, String> {
    Ok(format!("Hello, {}! You've been greeted from Rust!", name))
}

// Account management commands
#[tauri::command]
async fn create_account(email: String, master_password: String) -> Result<(), String> {
    // Create a simple account file with email and hashed password
    let account_data = serde_json::json!({
        "email": email,
        "password_hash": format!("{:x}", md5::compute(master_password)), // Simple hash for demo
        "created_at": chrono::Utc::now().to_rfc3339()
    });
    
    let account_path = std::env::var("HOME").unwrap_or_else(|_| ".".to_string()) + "/.passman/account.json";
    std::fs::create_dir_all(std::path::Path::new(&account_path).parent().unwrap())
        .map_err(|e| e.to_string())?;
    
    std::fs::write(&account_path, serde_json::to_string_pretty(&account_data).unwrap())
        .map_err(|e| e.to_string())?;
    
    Ok(())
}

#[tauri::command]
async fn check_account_exists() -> Result<bool, String> {
    let account_path = std::env::var("HOME").unwrap_or_else(|_| ".".to_string()) + "/.passman/account.json";
    Ok(std::path::Path::new(&account_path).exists())
}

#[tauri::command]
async fn verify_password(master_password: String) -> Result<bool, String> {
    let account_path = std::env::var("HOME").unwrap_or_else(|_| ".".to_string()) + "/.passman/account.json";
    
    if !std::path::Path::new(&account_path).exists() {
        return Ok(false);
    }
    
    let account_data: serde_json::Value = serde_json::from_str(
        &std::fs::read_to_string(&account_path).map_err(|e| e.to_string())?
    ).map_err(|e| e.to_string())?;
    
    let stored_hash = account_data["password_hash"].as_str().unwrap_or("");
    let input_hash = format!("{:x}", md5::compute(master_password));
    
    Ok(stored_hash == input_hash)
}

#[tauri::command]
async fn reset_passman() -> Result<(), String> {
    let home_dir = std::env::var("HOME").unwrap_or_else(|_| ".".to_string());
    let passman_dir = format!("{}/.passman", home_dir);
    
    // Remove the entire .passman directory
    if std::path::Path::new(&passman_dir).exists() {
        std::fs::remove_dir_all(&passman_dir).map_err(|e| e.to_string())?;
    }
    
    Ok(())
}

// Vault management commands
#[tauri::command]
async fn init_vault(email: String, master_password: String) -> Result<(), String> {
    let mut passman = PassMan::new("main").map_err(|e| e.to_string())?;
    passman.init_vault(email, &master_password).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
async fn open_vault(master_password: String) -> Result<(), String> {
    let mut passman = PassMan::new("main").map_err(|e| e.to_string())?;
    passman.open_vault(&master_password).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
async fn close_vault() -> Result<(), String> {
    // In a real implementation, you'd manage the vault instance globally
    Ok(())
}

#[tauri::command]
async fn is_vault_open() -> Result<bool, String> {
    // In a real implementation, you'd check the global vault state
    Ok(false)
}

// Account management commands
#[tauri::command]
async fn add_account(
    name: String,
    account_type: AccountType,
    password: String,
    url: Option<String>,
    username: Option<String>,
    notes: Option<String>,
    tags: Vec<String>,
    master_password: Option<String>,
) -> Result<(), String> {
    let mut passman = PassMan::new("main").map_err(|e| e.to_string())?;
    
    // If master password is provided, try to open the vault
    if let Some(master_pwd) = master_password {
        passman.open_vault(&master_pwd).map_err(|e| e.to_string())?;
    }
    
    // Check if vault is open
    if !passman.is_vault_open() {
        return Err("Vault is not open. Please provide master password or log in first.".to_string());
    }
    
    passman.add_account(name, account_type, password, url, username, notes, tags).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
async fn list_accounts() -> Result<Vec<Account>, String> {
    let passman = PassMan::new("main").map_err(|e| e.to_string())?;
    // In a real implementation, you'd authenticate first
    Ok(passman.get_all_accounts().into_iter().cloned().collect())
}

#[tauri::command]
async fn search_accounts(query: String) -> Result<Vec<Account>, String> {
    let passman = PassMan::new("main").map_err(|e| e.to_string())?;
    // In a real implementation, you'd authenticate first
    Ok(passman.search_accounts(&query).into_iter().cloned().collect())
}

#[tauri::command]
async fn get_account(id: String) -> Result<Option<Account>, String> {
    let passman = PassMan::new("main").map_err(|e| e.to_string())?;
    // In a real implementation, you'd authenticate first
    let uuid = id.parse().map_err(|_| "Invalid UUID".to_string())?;
    Ok(passman.get_account(uuid).cloned())
}

#[tauri::command]
async fn update_account(
    id: String,
    name: String,
    account_type: AccountType,
    password: String,
    url: Option<String>,
    username: Option<String>,
    notes: Option<String>,
    tags: Vec<String>,
) -> Result<(), String> {
    let mut passman = PassMan::new("main").map_err(|e| e.to_string())?;
    // In a real implementation, you'd authenticate first
    let uuid = id.parse().map_err(|_| "Invalid UUID".to_string())?;
    passman.update_account(uuid, name, account_type, password, url, username, notes, tags).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
async fn delete_account(id: String) -> Result<(), String> {
    let mut passman = PassMan::new("main").map_err(|e| e.to_string())?;
    // In a real implementation, you'd authenticate first
    let uuid = id.parse().map_err(|_| "Invalid UUID".to_string())?;
    passman.delete_account(uuid).map_err(|e| e.to_string())?;
    Ok(())
}

// Password generation commands
#[tauri::command]
async fn generate_password(
    length: usize,
    include_uppercase: bool,
    include_lowercase: bool,
    include_numbers: bool,
    include_special: bool,
    exclude_similar: bool,
    exclude_ambiguous: bool,
) -> Result<String, String> {
    let mut passman = PassMan::new("temp").map_err(|e| e.to_string())?;
    let options = PasswordOptions {
        length,
        include_uppercase,
        include_lowercase,
        include_numbers,
        include_special,
        exclude_similar,
        exclude_ambiguous,
    };
    passman.generate_password(&options).map_err(|e| e.to_string())
}

#[tauri::command]
async fn calculate_password_strength(password: String) -> Result<u8, String> {
    let passman = PassMan::new("temp").map_err(|e| e.to_string())?;
    Ok(passman.calculate_password_strength(&password))
}

#[tauri::command]
async fn get_password_strength_description(score: u8) -> Result<String, String> {
    let passman = PassMan::new("temp").map_err(|e| e.to_string())?;
    Ok(passman.get_password_strength_description(score).to_string())
}

// Vault information commands
#[tauri::command]
async fn get_vault_info() -> Result<HashMap<String, String>, String> {
    let passman = PassMan::new("main").map_err(|e| e.to_string())?;
    let (size, modified) = passman.get_vault_info().map_err(|e| e.to_string())?;
    let mut info = HashMap::new();
    info.insert("size".to_string(), size.to_string());
    if let Some(modified_time) = modified {
        info.insert("modified".to_string(), modified_time.duration_since(std::time::UNIX_EPOCH).unwrap().as_secs().to_string());
    }
    Ok(info)
}

#[tauri::command]
async fn list_vaults() -> Result<Vec<String>, String> {
    PassMan::list_vaults().map_err(|e| e.to_string())
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            greet,
            create_account,
            check_account_exists,
            verify_password,
            reset_passman,
            init_vault,
            open_vault,
            close_vault,
            is_vault_open,
            add_account,
            list_accounts,
            search_accounts,
            get_account,
            update_account,
            delete_account,
            generate_password,
            calculate_password_strength,
            get_password_strength_description,
            get_vault_info,
            list_vaults
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}