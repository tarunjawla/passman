# PassMan - Secure Local Password Manager

A secure, local-first password manager built with Rust that stores your passwords encrypted locally with military-grade encryption. Your data never leaves your device.

## 🚀 Features

- **Local-First**: All data is stored locally on your device
- **Military-Grade Encryption**: AES-GCM-256 encryption with Argon2id key derivation
- **Cross-Platform**: Works on Windows, macOS, and Linux
- **CLI Interface**: Full command-line interface for power users
- **Desktop GUI**: Beautiful desktop application (coming soon)
- **Password Generation**: Strong password generation with customizable options
- **Secure Storage**: Encrypted vault files with secure file permissions
- **No Cloud Dependencies**: Your data never leaves your device

## 🏗️ Architecture

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

## 📦 Project Structure

```
passman/
├── backend/          # Core Rust library
│   ├── src/
│   │   ├── lib.rs           # Public API
│   │   ├── models.rs        # Data structures
│   │   ├── crypto.rs        # Encryption/decryption
│   │   ├── storage.rs       # Vault file management
│   │   ├── auth.rs          # Authentication
│   │   ├── generator.rs     # Password generation
│   │   └── vault.rs         # Main vault manager
│   └── Cargo.toml
├── cli/              # Command-line interface
│   ├── src/
│   │   └── main.rs
│   └── Cargo.toml
├── desktop/          # Desktop GUI (Tauri)
│   └── src-tauri/
├── website/          # Marketing website
└── Cargo.toml        # Workspace configuration
```

## 🛠️ Development Status

### ✅ Completed (Phase 1)
- [x] Rust workspace setup
- [x] Backend library with core functionality
- [x] Data models and types
- [x] Encryption/decryption system
- [x] Password generation
- [x] Vault storage management
- [x] Authentication system
- [x] CLI tool with basic commands

### 🚧 In Progress
- [ ] Desktop GUI (Tauri + React)
- [ ] Cross-platform builds
- [ ] Comprehensive testing
- [ ] Documentation

### 📋 Planned
- [ ] Mobile apps
- [ ] Browser extension
- [ ] Advanced features (2FA, etc.)

## 🚀 Quick Start

### Prerequisites

- Rust 1.70+ (install from [rustup.rs](https://rustup.rs/))
- Git

### Building from Source

1. **Clone the repository**
   ```bash
   git clone https://github.com/tarunjawla/passman.git
   cd passman
   ```

2. **Build the project**
   ```bash
   cargo build --release
   ```

3. **Run the CLI**
   ```bash
   ./target/release/passman --help
   ```

### Using the CLI

1. **Initialize a new vault**
   ```bash
   passman init your-email@example.com
   ```

2. **Add an account**
   ```bash
   passman add "GitHub" --type social --url github.com --username user@example.com
   ```

3. **List accounts**
   ```bash
   passman list
   ```

4. **Generate a password**
   ```bash
   passman generate --length 16 --special --numbers
   ```

## 🔒 Security

- **Encryption**: AES-GCM-256 for vault encryption
- **Key Derivation**: Argon2id with secure parameters
- **Memory Safety**: Sensitive data is zeroized after use
- **File Permissions**: Vault files have restricted permissions (600)
- **No Network**: No data is ever sent over the network

## 📚 Documentation

- [Implementation Plan](IMPLEMENTATION_PLAN.md) - Detailed development roadmap
- [API Documentation](docs/api.md) - Backend library API reference
- [CLI Reference](docs/cli.md) - Command-line interface documentation
- [Security Guide](docs/security.md) - Security best practices

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Rust](https://www.rust-lang.org/)
- CLI powered by [Clap](https://github.com/clap-rs/clap)
- Encryption using [aes-gcm](https://github.com/RustCrypto/AEADs) and [Argon2](https://github.com/RustCrypto/password-hashes)
- Desktop GUI will use [Tauri](https://tauri.app/)

## 📞 Support

- GitHub Issues: [Report bugs or request features](https://github.com/tarunjawla/passman/issues)
- Discussions: [Community discussions](https://github.com/tarunjawla/passman/discussions)

---

**PassMan** - Secure, Local, Private Password Management