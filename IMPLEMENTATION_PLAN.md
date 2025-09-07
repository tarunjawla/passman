# PassMan Implementation Plan

**Project**: Open-Source Local Password Manager (Multi-platform + CLI)  
**Goal**: Build a cross-platform desktop app (Windows, macOS, Linux) + CLI tool for secure local password management.

---

## 🎯 Project Overview

PassMan is a secure, local-first password manager that allows users to:
- Store passwords encrypted locally (no cloud, no servers)
- Access via CLI or desktop GUI
- Generate strong passwords
- Manage accounts with categories and metadata
- Cross-platform support (Windows, macOS, Linux)

---

## 🏗️ Architecture

### High-Level Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Desktop GUI   │    │   CLI Tool      │    │   Backend Lib   │
│   (Tauri +      │    │   (Rust)        │    │   (Rust)        │
│   React/Next)   │    │                 │    │                 │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                    ┌─────────────▼─────────────┐
                    │     Encrypted Vault      │
                    │     (Local JSON File)    │
                    └───────────────────────────┘
```

### Directory Structure
```
passman/
├── backend/                    # Core Rust library
│   ├── Cargo.toml
│   └── src/
│       ├── lib.rs              # Public API
│       ├── crypto.rs           # Encryption/decryption
│       ├── storage.rs          # Vault file management
│       ├── models.rs           # Data structures
│       ├── generator.rs        # Password generation
│       └── auth.rs             # Authentication logic
├── cli/                        # Command-line interface
│   ├── Cargo.toml
│   └── src/
│       └── main.rs
├── desktop/                    # Desktop GUI (Tauri)
│   ├── Cargo.toml
│   ├── src-tauri/
│   │   ├── Cargo.toml
│   │   └── src/
│   │       ├── main.rs
│   │       └── lib.rs
│   └── src/                    # React/Next.js frontend
│       ├── components/
│       ├── pages/
│       └── styles/
├── website/                    # Marketing website (existing)
├── tests/                      # Integration tests
├── docs/                       # Documentation
└── IMPLEMENTATION_PLAN.md
```

---

## 📋 Implementation Steps

### Step 1: Initialize Rust Workspace
**Duration**: 1 day  
**Dependencies**: Rust toolchain, Cargo

**Tasks**:
- Create workspace `Cargo.toml` in root
- Initialize `backend/` as library crate
- Initialize `cli/` as binary crate
- Set up workspace dependencies

**Crates to use**:
- `serde` + `serde_json` for serialization
- `dirs` for cross-platform config directories
- `clap` for CLI argument parsing
- `anyhow` + `thiserror` for error handling

**Deliverable**: Working Rust workspace with basic structure

---

### Step 2: Backend Library Core
**Duration**: 3-4 days  
**Dependencies**: Step 1

**Tasks**:
- Implement data models (`models.rs`)
- Create encryption/decryption module (`crypto.rs`)
- Build vault storage system (`storage.rs`)
- Implement password generator (`generator.rs`)
- Add authentication logic (`auth.rs`)

**Key Crates**:
```toml
[dependencies]
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
dirs = "5.0"
argon2 = "0.5"
aes-gcm = "0.10"
rand = "0.8"
zeroize = "1.7"
uuid = "1.6"
chrono = { version = "0.4", features = ["serde"] }
anyhow = "1.0"
thiserror = "1.0"
```

**Data Models**:
```rust
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Account {
    pub id: Uuid,
    pub name: String,
    pub account_type: AccountType,
    pub url: Option<String>,
    pub username: Option<String>,
    pub password: String,
    pub notes: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AccountType {
    Social,
    Banking,
    Work,
    Personal,
    Other(String),
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Vault {
    pub accounts: Vec<Account>,
    pub created_at: DateTime<Utc>,
    pub version: String,
}
```

**Deliverable**: Complete backend library with encryption, storage, and password generation

---

### Step 3: CLI Tool Implementation
**Duration**: 2-3 days  
**Dependencies**: Step 2

**Tasks**:
- Implement CLI commands using `clap`
- Add interactive prompts for sensitive data
- Implement secure password input (hidden)
- Add clipboard integration
- Create help system

**CLI Commands**:
```bash
# Initialize vault (first run)
passman init

# Add new account
passman add --name "GitHub" --type social --url "github.com" --username "user@example.com"

# List accounts
passman list
passman list --type social

# Edit account
passman edit "GitHub"

# Delete account
passman delete "GitHub"

# Generate password
passman generate --length 16 --special --numbers --uppercase
passman generate --length 12 --save-to "GitHub"

# Show account details
passman show "GitHub"

# Change master password
passman change-password

# Export vault (encrypted backup)
passman export --output backup.json

# Import vault
passman import --file backup.json
```

**Key Crates**:
```toml
[dependencies]
clap = { version = "4.0", features = ["derive"] }
rpassword = "7.0"
clipboard = "0.5"
dialoguer = "0.11"
indicatif = "0.17"
```

**Deliverable**: Fully functional CLI tool with all commands

---

### Step 4: Desktop GUI with Tauri
**Duration**: 5-6 days  
**Dependencies**: Step 2

**Tasks**:
- Set up Tauri project structure
- Create React/Next.js frontend
- Implement Rust backend bindings
- Build UI components with Tailwind CSS
- Add dark theme (consistent with website)
- Implement all password management features

**Tauri Configuration**:
```toml
[dependencies]
tauri = { version = "1.0", features = ["api-all"] }
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
tokio = { version = "1.0", features = ["full"] }
```

**Frontend Tech Stack**:
- React 18 + TypeScript
- Next.js 14 (for routing and optimization)
- Tailwind CSS v3 (dark theme)
- Framer Motion (animations)
- React Hook Form (form handling)
- React Query (state management)

**GUI Main Flows**:

#### 1. First Launch / Setup
```
┌─────────────────────────────────────┐
│  Welcome to PassMan                │
│  ┌─────────────────────────────────┐ │
│  │  Email: [________________]     │ │
│  │  Master Key: [************]    │ │
│  │  Confirm:   [************]     │ │
│  │  [Create Vault]                │ │
│  └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

#### 2. Login Screen
```
┌─────────────────────────────────────┐
│  PassMan - Unlock Vault            │
│  ┌─────────────────────────────────┐ │
│  │  Master Key: [************]    │ │
│  │  [Unlock] [Forgot?]            │ │
│  └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

#### 3. Main Dashboard
```
┌─────────────────────────────────────────────────────────┐
│ PassMan                    [Settings] [Logout]         │
├─────────────────────────────────────────────────────────┤
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐        │
│ │   [Add]     │ │ [Generate]  │ │  [Import]   │        │
│ │  Account    │ │  Password   │ │   Vault     │        │
│ └─────────────┘ └─────────────┘ └─────────────┘        │
├─────────────────────────────────────────────────────────┤
│ Search: [________________] Filter: [All ▼]             │
├─────────────────────────────────────────────────────────┤
│ GitHub          Social    github.com    [Edit] [Copy]  │
│ Gmail           Personal  gmail.com     [Edit] [Copy]  │
│ Bank Account    Banking   bank.com      [Edit] [Copy]  │
└─────────────────────────────────────────────────────────┘
```

#### 4. Add/Edit Account
```
┌─────────────────────────────────────┐
│  Add Account                        │
│  ┌─────────────────────────────────┐ │
│  │  Name: [________________]      │ │
│  │  Type: [Social        ▼]      │ │
│  │  URL:  [________________]      │ │
│  │  User: [________________]      │ │
│  │  Pass: [________________]      │ │
│  │  Notes: [________________]     │ │
│  │  [Generate] [Save] [Cancel]    │ │
│  └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

**Deliverable**: Complete desktop GUI with all features

---

### Step 5: User Onboarding Flow
**Duration**: 1-2 days  
**Dependencies**: Step 4

**Tasks**:
- Create first-run setup wizard
- Implement master key validation
- Add vault initialization
- Create welcome screens
- Add tutorial/help system

**Onboarding Steps**:
1. Welcome screen with feature overview
2. Email collection (for identification)
3. Master key setup with strength indicator
4. Key confirmation
5. Vault creation
6. First account creation tutorial
7. Security tips and best practices

**Deliverable**: Complete onboarding experience

---

### Step 6: Encryption & Security
**Duration**: 2-3 days  
**Dependencies**: Step 2

**Tasks**:
- Implement AES-GCM encryption for vault
- Add Argon2 key derivation
- Implement secure memory management
- Add vault integrity verification
- Create secure key storage

**Security Features**:
```rust
// Encryption using AES-GCM
pub fn encrypt_vault(vault: &Vault, master_key: &str) -> Result<Vec<u8>> {
    let key = derive_key(master_key)?;
    let nonce = generate_nonce();
    let ciphertext = aes_gcm_encrypt(&vault_json, &key, &nonce)?;
    Ok(combine_nonce_and_ciphertext(&nonce, &ciphertext))
}

// Argon2 key derivation
pub fn derive_key(master_key: &str) -> Result<[u8; 32]> {
    let salt = get_or_create_salt()?;
    let config = Argon2::default();
    let mut key = [0u8; 32];
    config.hash_password_into(master_key.as_bytes(), &salt, &mut key)?;
    Ok(key)
}
```

**Deliverable**: Production-ready encryption system

---

### Step 7: Build & Packaging
**Duration**: 2-3 days  
**Dependencies**: Steps 3, 4, 6

**Tasks**:
- Set up cross-platform builds
- Create installers for each platform
- Add code signing (for distribution)
- Create update mechanism
- Test on all target platforms

**Build Targets**:
- Windows: `.exe` installer + portable
- macOS: `.dmg` + `.app` bundle
- Linux: `.deb`, `.rpm`, `.AppImage`

**Tools**:
- Tauri CLI for desktop app builds
- GitHub Actions for CI/CD
- Code signing certificates

**Deliverable**: Production-ready installers for all platforms

---

### Step 8: Testing
**Duration**: 2-3 days  
**Dependencies**: All previous steps

**Tasks**:
- Unit tests for all backend functions
- Integration tests for CLI commands
- GUI automation tests
- Security testing (encryption, memory)
- Cross-platform compatibility tests

**Test Coverage**:
```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_vault_encryption_decryption() {
        // Test encryption/decryption cycle
    }

    #[test]
    fn test_password_generation() {
        // Test password generator with various options
    }

    #[test]
    fn test_account_crud_operations() {
        // Test add, edit, delete, list operations
    }
}
```

**Deliverable**: Comprehensive test suite with >90% coverage

---

### Step 9: Documentation
**Duration**: 1-2 days  
**Dependencies**: All previous steps

**Tasks**:
- Create comprehensive README
- Write CLI help documentation
- Create GUI user guide
- Add developer documentation
- Create security audit documentation

**Documentation Structure**:
```
docs/
├── README.md                 # Main project overview
├── CLI.md                   # CLI usage guide
├── GUI.md                   # Desktop app guide
├── SECURITY.md              # Security practices
├── DEVELOPER.md             # Development setup
├── API.md                   # Backend API reference
└── CONTRIBUTING.md          # Contribution guidelines
```

**Deliverable**: Complete documentation suite

---

## 🔧 Technical Specifications

### Backend Library API
```rust
pub struct PassMan {
    vault_path: PathBuf,
    is_authenticated: bool,
}

impl PassMan {
    pub fn new() -> Result<Self>;
    pub fn init_vault(email: &str, master_key: &str) -> Result<()>;
    pub fn authenticate(&mut self, master_key: &str) -> Result<()>;
    pub fn add_account(&mut self, account: Account) -> Result<()>;
    pub fn edit_account(&mut self, id: Uuid, account: Account) -> Result<()>;
    pub fn delete_account(&mut self, id: Uuid) -> Result<()>;
    pub fn list_accounts(&self) -> Result<Vec<Account>>;
    pub fn get_account(&self, id: Uuid) -> Result<Account>;
    pub fn generate_password(&self, options: PasswordOptions) -> Result<String>;
    pub fn export_vault(&self) -> Result<Vec<u8>>;
    pub fn import_vault(&mut self, data: &[u8]) -> Result<()>;
}
```

### CLI Command Structure
```rust
#[derive(Parser)]
#[command(name = "passman")]
#[command(about = "A secure local password manager")]
pub struct Cli {
    #[command(subcommand)]
    pub command: Commands,
}

#[derive(Subcommand)]
pub enum Commands {
    Init {
        email: String,
    },
    Add {
        name: String,
        #[arg(short, long)]
        account_type: Option<String>,
        #[arg(short, long)]
        url: Option<String>,
        #[arg(short, long)]
        username: Option<String>,
    },
    List {
        #[arg(short, long)]
        account_type: Option<String>,
    },
    Edit {
        name: String,
    },
    Delete {
        name: String,
    },
    Generate {
        #[arg(short, long, default_value = "16")]
        length: usize,
        #[arg(long)]
        special: bool,
        #[arg(long)]
        numbers: bool,
        #[arg(long)]
        uppercase: bool,
        #[arg(long)]
        lowercase: bool,
    },
    Show {
        name: String,
    },
}
```

---

## 🚀 Development Timeline

| Phase | Duration | Dependencies | Deliverables |
|-------|----------|--------------|--------------|
| 1. Workspace Setup | 1 day | - | Rust workspace |
| 2. Backend Library | 3-4 days | Phase 1 | Core library |
| 3. CLI Tool | 2-3 days | Phase 2 | CLI application |
| 4. Desktop GUI | 5-6 days | Phase 2 | Desktop app |
| 5. Onboarding | 1-2 days | Phase 4 | User setup flow |
| 6. Security | 2-3 days | Phase 2 | Encryption system |
| 7. Build & Package | 2-3 days | Phases 3,4,6 | Installers |
| 8. Testing | 2-3 days | All phases | Test suite |
| 9. Documentation | 1-2 days | All phases | Complete docs |

**Total Estimated Duration**: 19-29 days (4-6 weeks)

---

## 🔒 Security Considerations

### Encryption
- **Algorithm**: AES-GCM-256 for vault encryption
- **Key Derivation**: Argon2id with secure parameters
- **Salt**: Random 32-byte salt per vault
- **Nonce**: Random 12-byte nonce per encryption

### Memory Security
- Use `zeroize` crate to clear sensitive data
- Implement secure string types
- Clear clipboard after timeout
- No sensitive data in logs

### File Security
- Vault file permissions: 600 (owner read/write only)
- Secure temp file handling
- Atomic file operations

---

## 📦 Distribution Strategy

### Release Channels
- **Stable**: Production-ready releases
- **Beta**: Feature-complete, testing phase
- **Alpha**: Early development builds

### Platforms
- **Windows**: x64, ARM64
- **macOS**: Intel, Apple Silicon
- **Linux**: x64, ARM64 (Ubuntu, Debian, Fedora, Arch)

### Distribution Methods
- GitHub Releases (primary)
- Package managers (Homebrew, Chocolatey, Snap)
- Direct download from website

---

## 🧪 Testing Strategy

### Unit Tests
- Backend library functions
- Encryption/decryption
- Password generation
- Data validation

### Integration Tests
- CLI command execution
- File I/O operations
- Cross-platform compatibility

### Security Tests
- Encryption strength validation
- Memory leak detection
- Input sanitization

### User Acceptance Tests
- Complete user workflows
- Error handling scenarios
- Performance under load

---

This implementation plan provides a comprehensive roadmap for building PassMan as a production-ready, secure, and user-friendly password manager. Each phase builds upon the previous ones, ensuring a solid foundation while maintaining security and usability as top priorities.
