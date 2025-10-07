#!/bin/bash

# PassMan Multi-Platform Build Script
# Builds PassMan for Linux, macOS, and Windows

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions for colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Parse command line arguments
DEBUG=false
CLEAN=false
INSTALL=false
PLATFORM="all"
VERSION="1.0.0"

while [[ $# -gt 0 ]]; do
    case $1 in
        --debug)
            DEBUG=true
            shift
            ;;
        --clean)
            CLEAN=true
            shift
            ;;
        --install)
            INSTALL=true
            shift
            ;;
        --platform)
            PLATFORM="$2"
            shift 2
            ;;
        --version)
            VERSION="$2"
            shift 2
            ;;
        -h|--help)
            echo "Usage: $0 [OPTIONS]"
            echo "Options:"
            echo "  --debug       Build in debug mode"
            echo "  --clean       Clean build artifacts before building"
            echo "  --install     Install the built package (Linux only)"
            echo "  --platform    Target platform: linux, macos, windows, or all (default: all)"
            echo "  --version     Version number (default: 1.0.0)"
            echo "  -h, --help    Show this help message"
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            exit 1
            ;;
    esac
done

print_status "Starting PassMan multi-platform build..."
print_status "Platform: $PLATFORM"
print_status "Version: $VERSION"
print_status "Debug mode: $DEBUG"
print_status "Clean build: $CLEAN"

# Change to desktop directory
cd "$(dirname "$0")/../desktop"

# Clean if requested
if [ "$CLEAN" = true ]; then
    print_status "Cleaning build artifacts..."
    rm -rf dist/
    rm -rf src-tauri/target/
    npm run clean 2>/dev/null || true
fi

# Install frontend dependencies
print_status "Installing frontend dependencies..."
npm ci

# Build frontend
print_status "Building frontend..."
npm run build

# Install Tauri CLI globally
print_status "Installing Tauri CLI..."
npm install -g @tauri-apps/cli@latest

# Build function for each platform
build_linux() {
    print_status "Building for Linux..."
    
    # Build for x86_64-unknown-linux-gnu
    if [ "$DEBUG" = true ]; then
        npm run tauri build -- --target x86_64-unknown-linux-gnu
    else
        npm run tauri build -- --target x86_64-unknown-linux-gnu
    fi
    
    # Copy DEB package
    DEB_PATH="src-tauri/target/x86_64-unknown-linux-gnu/release/bundle/deb/passman_${VERSION}_amd64.deb"
    if [ -f "$DEB_PATH" ]; then
        cp "$DEB_PATH" "../../dist/PassMan_${VERSION}_amd64.deb"
        print_success "DEB package created: dist/PassMan_${VERSION}_amd64.deb"
        
        # Generate checksum
        sha256sum "../../dist/PassMan_${VERSION}_amd64.deb" > "../../dist/PassMan_${VERSION}_amd64.deb.sha256"
        print_success "Checksum generated: dist/PassMan_${VERSION}_amd64.deb.sha256"
    else
        print_error "DEB package not found at $DEB_PATH"
    fi
    
    # Copy AppImage
    APPIMAGE_PATH="src-tauri/target/x86_64-unknown-linux-gnu/release/bundle/appimage/passman_${VERSION}_amd64.AppImage"
    if [ -f "$APPIMAGE_PATH" ]; then
        cp "$APPIMAGE_PATH" "../../dist/passman-linux.AppImage"
        print_success "AppImage created: dist/passman-linux.AppImage"
    fi
}

build_macos() {
    print_status "Building for macOS..."
    
    # Check if we're on macOS or have cross-compilation setup
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # Build for x86_64-apple-darwin and aarch64-apple-darwin
        if [ "$DEBUG" = true ]; then
            npm run tauri build -- --target x86_64-apple-darwin
            npm run tauri build -- --target aarch64-apple-darwin
        else
            npm run tauri build -- --target x86_64-apple-darwin
            npm run tauri build -- --target aarch64-apple-darwin
        fi
        
        # Copy DMG packages
        DMG_X64_PATH="src-tauri/target/x86_64-apple-darwin/release/bundle/dmg/PassMan_${VERSION}_x64.dmg"
        DMG_ARM64_PATH="src-tauri/target/aarch64-apple-darwin/release/bundle/dmg/PassMan_${VERSION}_aarch64.dmg"
        
        if [ -f "$DMG_X64_PATH" ]; then
            cp "$DMG_X64_PATH" "../../dist/PassMan_${VERSION}_macos_x64.dmg"
            print_success "macOS x64 DMG created: dist/PassMan_${VERSION}_macos_x64.dmg"
            sha256sum "../../dist/PassMan_${VERSION}_macos_x64.dmg" > "../../dist/PassMan_${VERSION}_macos_x64.dmg.sha256"
        fi
        
        if [ -f "$DMG_ARM64_PATH" ]; then
            cp "$DMG_ARM64_PATH" "../../dist/PassMan_${VERSION}_macos_arm64.dmg"
            print_success "macOS ARM64 DMG created: dist/PassMan_${VERSION}_macos_arm64.dmg"
            sha256sum "../../dist/PassMan_${VERSION}_macos_arm64.dmg" > "../../dist/PassMan_${VERSION}_macos_arm64.dmg.sha256"
        fi
    else
        print_warning "macOS build requires macOS system or cross-compilation setup"
        print_warning "Skipping macOS build on non-macOS system"
    fi
}

build_windows() {
    print_status "Building for Windows..."
    
    # Check if we have Windows cross-compilation setup
    if command -v x86_64-w64-mingw32-gcc &> /dev/null || [[ "$OSTYPE" == "msys"* ]] || [[ "$OSTYPE" == "cygwin"* ]]; then
        # Build for x86_64-pc-windows-msvc
        if [ "$DEBUG" = true ]; then
            npm run tauri build -- --target x86_64-pc-windows-msvc
        else
            npm run tauri build -- --target x86_64-pc-windows-msvc
        fi
        
        # Copy MSI package
        MSI_PATH="src-tauri/target/x86_64-pc-windows-msvc/release/bundle/msi/PassMan_${VERSION}_x64_en-US.msi"
        if [ -f "$MSI_PATH" ]; then
            cp "$MSI_PATH" "../../dist/PassMan_${VERSION}_windows_x64.msi"
            print_success "Windows MSI created: dist/PassMan_${VERSION}_windows_x64.msi"
            sha256sum "../../dist/PassMan_${VERSION}_windows_x64.msi" > "../../dist/PassMan_${VERSION}_windows_x64.msi.sha256"
        fi
        
        # Copy NSIS installer
        NSIS_PATH="src-tauri/target/x86_64-pc-windows-msvc/release/bundle/nsis/PassMan_${VERSION}_x64-setup.exe"
        if [ -f "$NSIS_PATH" ]; then
            cp "$NSIS_PATH" "../../dist/PassMan_${VERSION}_windows_x64-setup.exe"
            print_success "Windows NSIS installer created: dist/PassMan_${VERSION}_windows_x64-setup.exe"
            sha256sum "../../dist/PassMan_${VERSION}_windows_x64-setup.exe" > "../../dist/PassMan_${VERSION}_windows_x64-setup.exe.sha256"
        fi
    else
        print_warning "Windows build requires Windows system or cross-compilation setup"
        print_warning "Skipping Windows build"
    fi
}

# Build CLI for Linux
build_cli() {
    print_status "Building CLI for Linux..."
    
    cd "../cli"
    
    # Build CLI
    if [ "$DEBUG" = true ]; then
        cargo build --target x86_64-unknown-linux-gnu
        CLI_BINARY="target/x86_64-unknown-linux-gnu/debug/passman"
    else
        cargo build --release --target x86_64-unknown-linux-gnu
        CLI_BINARY="target/x86_64-unknown-linux-gnu/release/passman"
    fi
    
    # Create CLI package
    if [ -f "$CLI_BINARY" ]; then
        cd "../dist"
        tar -czf "passman-cli-linux-x86_64.tar.gz" -C "../cli" "$CLI_BINARY"
        print_success "CLI package created: dist/passman-cli-linux-x86_64.tar.gz"
        
        # Generate checksum
        sha256sum "passman-cli-linux-x86_64.tar.gz" > "passman-cli-linux-x86_64.tar.gz.sha256"
        print_success "CLI checksum generated: dist/passman-cli-linux-x86_64.tar.gz.sha256"
    else
        print_error "CLI binary not found at $CLI_BINARY"
    fi
    
    cd "../desktop"
}

# Main build logic
case $PLATFORM in
    "linux")
        build_linux
        build_cli
        ;;
    "macos")
        build_macos
        ;;
    "windows")
        build_windows
        ;;
    "all")
        build_linux
        build_cli
        build_macos
        build_windows
        ;;
    *)
        print_error "Unknown platform: $PLATFORM"
        exit 1
        ;;
esac

# Install if requested (Linux only)
if [ "$INSTALL" = true ] && [ "$PLATFORM" = "linux" ] || [ "$PLATFORM" = "all" ]; then
    print_status "Installing DEB package..."
    sudo dpkg -i "../../dist/PassMan_${VERSION}_amd64.deb" || sudo apt-get install -f
    print_success "PassMan installed successfully!"
fi

print_success "Build completed!"
print_status "Built packages are available in the dist/ directory:"
ls -la ../../dist/

# Display package information
if [ -f "../../dist/PassMan_${VERSION}_amd64.deb" ]; then
    print_status "DEB Package Information:"
    dpkg-deb --info "../../dist/PassMan_${VERSION}_amd64.deb"
fi

