# PassMan Update Guide

## How Updates Work with Existing Passwords

### 🔒 **Data Preservation**
PassMan is designed to preserve all your existing data during updates:

- **Vaults**: All your vaults remain intact
- **Passwords**: All stored passwords are preserved
- **Settings**: Your preferences and configurations are maintained
- **Master Password**: Your master password remains unchanged

### 📁 **Data Storage Locations**

#### Linux (DEB Package)
- **Vault Data**: `~/.local/share/passman/`
- **Configuration**: `~/.config/passman/`
- **Application**: `/opt/passman/` (system-wide installation)

#### Data Structure
```
~/.local/share/passman/
├── vaults/
│   ├── vault1.vault
│   ├── vault2.vault
│   └── ...
└── backups/
    └── vault_backup_*.vault

~/.config/passman/
├── settings.json
└── preferences.json
```

### 🔄 **Update Process**

#### Method 1: DEB Package Update
```bash
# Download new version
wget https://github.com/passman/passman/releases/latest/download/passman_1.0.1_amd64.deb

# Install new version (preserves data)
sudo dpkg -i passman_1.0.1_amd64.deb

# Fix dependencies if needed
sudo apt-get install -f
```

#### Method 2: AppImage Update
```bash
# Download new AppImage
wget https://github.com/passman/passman/releases/latest/download/passman-linux.AppImage

# Make executable
chmod +x passman-linux.AppImage

# Replace old AppImage (data is preserved)
mv passman-linux.AppImage ~/Applications/passman.AppImage
```

### 🛡️ **Migration Safety**

#### Automatic Migration
- **Vault Format**: PassMan automatically migrates old vault formats to new versions
- **Backward Compatibility**: New versions can read old vault files
- **Data Integrity**: Checksums verify vault integrity during migration

#### Manual Backup (Recommended)
```bash
# Create backup before updating
cp -r ~/.local/share/passman ~/passman-backup-$(date +%Y%m%d)

# Verify backup
ls -la ~/passman-backup-*/
```

### 🔧 **Troubleshooting Updates**

#### If Update Fails
1. **Check Dependencies**:
   ```bash
   sudo apt-get install -f
   ```

2. **Verify Data Integrity**:
   ```bash
   # Check if vault files exist
   ls -la ~/.local/share/passman/vaults/
   ```

3. **Restore from Backup**:
   ```bash
   # If data is corrupted, restore from backup
   cp -r ~/passman-backup-*/vaults ~/.local/share/passman/
   ```

#### If Passwords Don't Work
1. **Check Vault Migration**:
   - PassMan automatically migrates old vault formats
   - Check console logs for migration messages

2. **Verify Master Password**:
   - Ensure you're using the correct master password
   - Master password doesn't change during updates

### 📋 **Update Checklist**

Before updating:
- [ ] Create backup of `~/.local/share/passman/`
- [ ] Note your master password (it won't change)
- [ ] Close PassMan application

After updating:
- [ ] Verify PassMan starts correctly
- [ ] Test opening your vaults
- [ ] Confirm all passwords are accessible
- [ ] Check that settings are preserved

### 🚀 **Building Your Own DEB Package**

#### Prerequisites
```bash
# Install required tools
sudo apt-get update
sudo apt-get install -y build-essential curl wget file

# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source ~/.cargo/env

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Tauri CLI
npm install -g @tauri-apps/cli@latest
```

#### Build Process
```bash
# Clone repository
git clone https://github.com/passman/passman.git
cd passman

# Build DEB package
./scripts/build-deb.sh --version 1.0.1

# Install locally
sudo dpkg -i dist/passman_1.0.1_amd64.deb
```

### 🔐 **Security Considerations**

#### Data Encryption
- **Vault Encryption**: Each vault is encrypted with its own password
- **Master Password**: Used for app authentication, not stored
- **Migration Security**: Vault migration preserves encryption

#### Update Security
- **Package Verification**: Always verify checksums before installing
- **Source Verification**: Download from official sources only
- **Backup Encryption**: Consider encrypting backups

### 📞 **Support**

If you encounter issues during updates:

1. **Check Logs**: Look for error messages in the console
2. **Verify Data**: Ensure vault files are not corrupted
3. **Restore Backup**: Use your backup if data is lost
4. **Report Issues**: Create an issue on GitHub with details

### 🎯 **Best Practices**

1. **Regular Backups**: Create backups before major updates
2. **Test Updates**: Test updates on a copy of your data first
3. **Version Notes**: Read release notes for breaking changes
4. **Gradual Updates**: Don't skip major versions
5. **Verify Data**: Always verify data integrity after updates

---

**Remember**: Your passwords and vaults are your responsibility. Always maintain backups and verify data integrity after updates.

