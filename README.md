# Passman 🔐

*A simple, secure, and cross-platform password manager written in Rust.*

[![Rust](https://img.shields.io/badge/Rust-2021-orange?logo=rust)](https://www.rust-lang.org/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Contributions](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](./CONTRIBUTING.md)

---

## ✨ Features

- **Secure Storage** – Passwords encrypted using AES-GCM with Argon2 key derivation
- **CLI Interface** – Manage your vault directly from the terminal
- **Cross-Platform** – Works on Linux, macOS, and Windows
- **Local-Only Storage** – All data stays on your device, no cloud sync
- **Configurable Vault Location** – Stored in user's home directory via [`dirs`](https://crates.io/crates/dirs)
- **Zeroize Sensitive Data** – Memory cleared after use to prevent leaks
- **JSON-based Vault** – Lightweight storage format with `serde` and `serde_json`
- **Random Password Generation** – Strong password generator powered by `rand`
- **Account Management** – Store account name, type, URL, username, and password

---

## 📂 Project Structure

```
passman/
├── backend/                # Library crate (core logic: encryption, storage, password mgmt)
│   ├── Cargo.toml
│   └── src/
│       └── lib.rs
├── cli/                    # CLI binary crate (user-facing commands)
│   ├── Cargo.toml
│   └── src/
│       └── main.rs
├── frontend/               # GUI app (React + Tauri) - Coming Soon
├── README.md
└── .gitignore
```

---

## 🚀 Getting Started

### Prerequisites

- [Rust](https://www.rust-lang.org/tools/install) (latest stable recommended)
- Cargo package manager (bundled with Rust)

### Installation

Clone the repository:

```bash
git clone https://github.com/your-username/passman.git
cd passman
```

Build the backend library:

```bash
cd backend
cargo build --release
```

Build and run the CLI:

```bash
cd ../cli
cargo build --release
cargo run -- --help
```

---

## 🛠️ CLI Usage

### Initialize your vault

```bash
passman init
```

### Add a new password

```bash
passman add --name "Google" --type "Social Media" --url "https://google.com" --username "your-email@gmail.com" --password "your-secure-password"
```

### List all stored accounts

```bash
passman list
```

### Retrieve a password

```bash
passman get --name "Google"
```

### Generate a strong password

```bash
passman generate --length 16 --include-symbols
```

### Remove an account

```bash
passman remove --name "Google"
```

---

## 📦 Dependencies

### Backend (`backend/Cargo.toml`)

- `serde` + `serde_json` → Serialization and deserialization
- `dirs` → Cross-platform user directory detection
- `rand` → Secure random password generation
- `argon2` → Secure key derivation from master password
- `aes-gcm` → AES-GCM encryption/decryption
- `aes` → AES cipher implementation
- `zeroize` → Memory security (clear sensitive data)

### CLI (`cli/Cargo.toml`)

- `clap` → Command-line argument parsing
- `backend` → Local dependency on the backend library

---

## 🔒 Security Features

- **Master Password Protection** – All data encrypted with your master password
- **AES-GCM Encryption** – Industry-standard authenticated encryption
- **Argon2 Key Derivation** – Secure password-based key derivation function
- **Memory Safety** – Sensitive data cleared from memory after use
- **Local Storage Only** – No network requests, no cloud synchronization

---

## 🎯 Roadmap

- ✅ **Rust Backend Library** – Core password management logic
- ✅ **CLI Interface** – Command-line password manager
- 🔜 **GUI Application** – Desktop app with React + Tauri
- 🔜 **Password Generator** – Built-in secure password generation
- 🔜 **Import/Export** – Migrate from other password managers
- 🔜 **Auto-lock** – Automatically lock vault after inactivity
- 🔜 **Clipboard Management** – Auto-clear copied passwords

---

## 🧑‍💻 Contributing

We welcome contributions! Here's how to get started:

1. Fork the repository
2. Create a new branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests if applicable
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Development Setup

```bash
# Clone your fork
git clone https://github.com/your-username/passman.git
cd passman

# Build and test
cargo build
cargo test

# Run CLI in development mode
cd cli
cargo run -- --help
```

---

## 📜 License

This project is licensed under the MIT License – see the [LICENSE](LICENSE) file for details.

---

## 🙌 Acknowledgements

- [Rust Crypto](https://github.com/RustCrypto) for secure cryptographic primitives
- [Serde](https://serde.rs/) for serialization support
- [Clap](https://clap.rs/) for excellent command-line parsing
- [Tauri](https://tauri.app/) for the upcoming GUI framework

---

## 🤝 Support

If you have questions, suggestions, or need help:

- 📝 Open an [Issue](https://github.com/your-username/passman/issues)
- 💬 Start a [Discussion](https://github.com/your-username/passman/discussions)
- 🐛 Report bugs with detailed reproduction steps

---

*Built with ❤️ using Rust for security, performance, and reliability.*
