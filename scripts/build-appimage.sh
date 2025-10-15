#!/bin/bash

# Build AppImage package for PassMan
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "Cargo.toml" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

# Parse command line arguments
RELEASE=true
CLEAN=false
VERSION="1.0.0"

while [[ $# -gt 0 ]]; do
    case $1 in
        --debug)
            RELEASE=false
            shift
            ;;
        --clean)
            CLEAN=true
            shift
            ;;
        --version)
            VERSION="$2"
            shift 2
            ;;
        --help)
            echo "Usage: $0 [OPTIONS]"
            echo "Options:"
            echo "  --debug      Build in debug mode (default: release)"
            echo "  --clean      Clean build artifacts before building"
            echo "  --version    Set version number (default: 1.0.0)"
            echo "  --help       Show this help message"
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            exit 1
            ;;
    esac
done

print_status "Building PassMan AppImage package v$VERSION"

# Update version in tauri.conf.json
if [ -f "desktop/src-tauri/tauri.conf.json" ]; then
    print_status "Updating version to $VERSION"
    sed -i "s/\"version\": \".*\"/\"version\": \"$VERSION\"/" desktop/src-tauri/tauri.conf.json
fi

# Clean if requested
if [ "$CLEAN" = true ]; then
    print_status "Cleaning build artifacts..."
    rm -rf desktop/src-tauri/target
    rm -rf desktop/dist
    rm -rf dist
fi

# Create output directory
mkdir -p dist

# Check if we're in the desktop directory
if [ ! -f "desktop/package.json" ]; then
    print_error "Desktop directory not found. Please run from project root."
    exit 1
fi

cd desktop

# Install dependencies
print_status "Installing frontend dependencies..."
npm ci

# Build frontend
print_status "Building frontend..."
npm run build

# Install Tauri CLI if not already installed
if ! command -v tauri &> /dev/null; then
    print_status "Installing Tauri CLI..."
    npm install -g @tauri-apps/cli@latest
fi

# Build Tauri app with AppImage target
print_status "Building Tauri app for AppImage package..."
if [ "$RELEASE" = true ]; then
    npm run tauri build -- --target x86_64-unknown-linux-gnu
    BUNDLE_PATH="../target/x86_64-unknown-linux-gnu/release/bundle"
else
    npm run tauri build -- --debug --target x86_64-unknown-linux-gnu
    BUNDLE_PATH="../target/x86_64-unknown-linux-gnu/debug/bundle"
fi

# Copy AppImage package to dist
if [ -d "$BUNDLE_PATH/appimage" ]; then
    APPIMAGE_FILE=$(ls "$BUNDLE_PATH/appimage"/*.AppImage | head -1)
    if [ -n "$APPIMAGE_FILE" ]; then
        cp "$APPIMAGE_FILE" ../dist/
        APPIMAGE_FILENAME=$(basename "$APPIMAGE_FILE")
        print_status "AppImage package created: dist/$APPIMAGE_FILENAME"
        
        # Generate checksum
        sha256sum "../dist/$APPIMAGE_FILENAME" > "../dist/$APPIMAGE_FILENAME.sha256"
        print_status "Checksum: $(cat "../dist/$APPIMAGE_FILENAME.sha256")"
        
        # Show file info
        print_info "AppImage information:"
        ls -lh "../dist/$APPIMAGE_FILENAME"
        
        # Make it executable
        chmod +x "../dist/$APPIMAGE_FILENAME"
        print_status "AppImage made executable"
        
    else
        print_error "No AppImage file found in $BUNDLE_PATH/appimage"
        exit 1
    fi
else
    print_error "AppImage bundle directory not found: $BUNDLE_PATH/appimage"
    print_info "Available directories:"
    ls -la "$BUNDLE_PATH/" 2>/dev/null || echo "Bundle path does not exist"
    exit 1
fi

cd ..

print_status "AppImage package build completed!"
print_info "Files in dist directory:"
ls -la dist/

print_info ""
print_info "To run the AppImage:"
print_info "  ./dist/passman_${VERSION}_amd64.AppImage"
print_info ""
print_info "AppImage features:"
print_info "  - Portable executable (no installation required)"
print_info "  - Self-contained with all dependencies"
print_info "  - Works on most Linux distributions"
print_info "  - Can be run from USB drives or network shares"
print_info ""
print_info "User data location:"
print_info "  - Vaults: ~/.local/share/passman/"
print_info "  - Config: ~/.config/passman/"
