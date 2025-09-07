# Build and Release Guide

This guide explains how to build and release PassMan for all supported platforms.

## Prerequisites

- Rust (latest stable)
- Node.js 18+
- npm
- Git

For cross-platform builds:
- Linux: No additional requirements
- macOS: Xcode Command Line Tools
- Windows: Visual Studio Build Tools

## Local Development Builds

### Quick Build Script

Use the provided build script for easy local builds:

```bash
# Build everything (debug mode)
./scripts/build.sh --all

# Build specific components
./scripts/build.sh --desktop
./scripts/build.sh --cli

# Build for specific target
./scripts/build.sh --all --target x86_64-unknown-linux-gnu

# Build in release mode
./scripts/build.sh --all --release
```

### Manual Builds

#### Desktop App (Tauri)

```bash
cd desktop

# Install dependencies
npm ci

# Build frontend
npm run build

# Install Tauri CLI
npm install -g @tauri-apps/cli@latest

# Build for current platform
npm run tauri build

# Build for specific target
npm run tauri build -- --target x86_64-unknown-linux-gnu
```

#### CLI Tool

```bash
# Build for current platform
cargo build --release --bin passman

# Build for specific target
cargo build --release --target x86_64-unknown-linux-gnu --bin passman
```

## Automated Releases

### GitHub Actions

The project includes GitHub Actions workflows for automated builds and releases:

1. **build-desktop.yml** - Builds desktop app for all platforms
2. **build-cli.yml** - Builds CLI tool for all platforms  
3. **release.yml** - Creates GitHub releases from build artifacts

### Creating a Release

1. **Update version** in `Cargo.toml`:
   ```toml
   [workspace.package]
   version = "0.2.0"  # Update this
   ```

2. **Create and push a tag**:
   ```bash
   git tag v0.2.0
   git push origin v0.2.0
   ```

3. **GitHub Actions will automatically**:
   - Build all platform binaries
   - Generate checksums
   - Create a GitHub release
   - Upload all artifacts

### Release Artifacts

Each release will include:

**Desktop App:**
- `passman-linux.tar.gz` - Linux AppImage
- `passman-macos.dmg` - macOS Intel
- `passman-macos-arm64.dmg` - macOS Apple Silicon
- `passman-windows.msi` - Windows installer

**CLI Tool:**
- `passman-cli-linux.tar.gz` - Linux x86_64
- `passman-cli-linux-arm64.tar.gz` - Linux ARM64
- `passman-cli-macos.tar.gz` - macOS Intel
- `passman-cli-macos-arm64.tar.gz` - macOS Apple Silicon
- `passman-cli-windows.zip` - Windows

**Checksums:**
- Each artifact includes a `.sha256` checksum file

## Website Integration

The website automatically fetches release information from GitHub:

- Real file sizes
- Download counts
- Version numbers
- Download URLs
- Checksums

### Testing Website Integration

1. Start the development server:
   ```bash
   cd website
   npm run dev
   ```

2. Visit `/download` to see the download page

3. The page will attempt to fetch real data from GitHub releases

### Fallback Behavior

If GitHub API is unavailable, the website falls back to:
- Default platform information
- Placeholder download URLs
- Static version numbers

## Platform-Specific Notes

### Linux
- Builds AppImage by default
- Requires `libgtk-3-dev` and `libwebkit2gtk-4.0-dev` for Tauri
- CLI builds as static binary

### macOS
- Requires Xcode Command Line Tools
- Builds both Intel and Apple Silicon versions
- Creates `.dmg` installers

### Windows
- Requires Visual Studio Build Tools
- Builds `.msi` installers
- CLI builds as `.exe` with dependencies

## Troubleshooting

### Build Failures

1. **Tauri build fails**: Check that all system dependencies are installed
2. **Cross-compilation fails**: Ensure target is installed: `rustup target add <target>`
3. **Frontend build fails**: Clear node_modules and reinstall: `rm -rf node_modules && npm ci`

### Release Issues

1. **GitHub Actions fail**: Check the Actions tab for detailed logs
2. **Missing artifacts**: Ensure all build jobs complete successfully
3. **Checksum mismatch**: Rebuild and regenerate checksums

### Website Issues

1. **API rate limits**: GitHub API has rate limits for unauthenticated requests
2. **CORS issues**: The website should work with GitHub's CORS policy
3. **Network errors**: Check browser console for detailed error messages

## Security

- All builds are reproducible
- Checksums are generated automatically
- No secrets are stored in the repository
- GitHub Actions uses secure token management

## Contributing

When adding new platforms or build targets:

1. Update the GitHub Actions workflows
2. Update the build script
3. Update the website's platform detection
4. Test locally before creating a release
5. Update this documentation
