// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use passman_backend::{PassMan, Result, models::{Account, AccountType, PasswordOptions}};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
async fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

// Vault management commands
#[tauri::command]
async fn init_vault(email: String, master_password: String) -> Result<()> {
    let mut passman = PassMan::new("main")?;
    passman.init_vault(email, &master_password)?;
    Ok(())
}

#[tauri::command]
async fn open_vault(master_password: String) -> Result<()> {
    let mut passman = PassMan::new("main")?;
    passman.open_vault(&master_password)?;
    Ok(())
}

#[tauri::command]
async fn close_vault() -> Result<()> {
    // In a real implementation, you'd manage the vault instance globally
    Ok(())
}

#[tauri::command]
async fn is_vault_open() -> bool {
    // In a real implementation, you'd check the global vault state
    false
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
) -> Result<()> {
    let mut passman = PassMan::new("main")?;
    // In a real implementation, you'd authenticate first
    passman.add_account(name, account_type, password, url, username, notes, tags)?;
    Ok(())
}

#[tauri::command]
async fn list_accounts() -> Result<Vec<Account>> {
    let passman = PassMan::new("main")?;
    // In a real implementation, you'd authenticate first
    Ok(passman.get_all_accounts().into_iter().cloned().collect())
}

#[tauri::command]
async fn search_accounts(query: String) -> Result<Vec<Account>> {
    let passman = PassMan::new("main")?;
    // In a real implementation, you'd authenticate first
    Ok(passman.search_accounts(&query).into_iter().cloned().collect())
}

#[tauri::command]
async fn get_account(id: String) -> Result<Option<Account>> {
    let passman = PassMan::new("main")?;
    // In a real implementation, you'd authenticate first
    let uuid = id.parse().map_err(|_| passman_backend::PassManError::InvalidInput("Invalid UUID".to_string()))?;
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
) -> Result<()> {
    let mut passman = PassMan::new("main")?;
    // In a real implementation, you'd authenticate first
    let uuid = id.parse().map_err(|_| passman_backend::PassManError::InvalidInput("Invalid UUID".to_string()))?;
    passman.update_account(uuid, name, account_type, password, url, username, notes, tags)?;
    Ok(())
}

#[tauri::command]
async fn delete_account(id: String) -> Result<()> {
    let mut passman = PassMan::new("main")?;
    // In a real implementation, you'd authenticate first
    let uuid = id.parse().map_err(|_| passman_backend::PassManError::InvalidInput("Invalid UUID".to_string()))?;
    passman.delete_account(uuid)?;
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
) -> Result<String> {
    let mut passman = PassMan::new("temp")?;
    let options = PasswordOptions {
        length,
        include_uppercase,
        include_lowercase,
        include_numbers,
        include_special,
        exclude_similar,
        exclude_ambiguous,
    };
    passman.generate_password(&options)
}

#[tauri::command]
async fn calculate_password_strength(password: String) -> u8 {
    let passman = PassMan::new("temp").unwrap();
    passman.calculate_password_strength(&password)
}

#[tauri::command]
async fn get_password_strength_description(score: u8) -> String {
    let passman = PassMan::new("temp").unwrap();
    passman.get_password_strength_description(score).to_string()
}

// Vault information commands
#[tauri::command]
async fn get_vault_info() -> Result<HashMap<String, String>> {
    let passman = PassMan::new("main")?;
    let (size, modified) = passman.get_vault_info()?;
    let mut info = HashMap::new();
    info.insert("size".to_string(), size.to_string());
    if let Some(modified_time) = modified {
        info.insert("modified".to_string(), modified_time.duration_since(std::time::UNIX_EPOCH).unwrap().as_secs().to_string());
    }
    Ok(info)
}

#[tauri::command]
async fn list_vaults() -> Result<Vec<String>> {
    PassMan::list_vaults()
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            greet,
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
