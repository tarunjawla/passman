#!/bin/bash

# Build DEB package for PassMan
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
INSTALL=false
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
        --install)
            INSTALL=true
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
            echo "  --install    Install the DEB package after building"
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

print_status "Building PassMan DEB package v$VERSION"

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

# Build Tauri app with DEB target
print_status "Building Tauri app for DEB package..."
if [ "$RELEASE" = true ]; then
    npm run tauri build -- --target x86_64-unknown-linux-gnu
    BUNDLE_PATH="src-tauri/target/x86_64-unknown-linux-gnu/release/bundle"
else
    npm run tauri build -- --debug --target x86_64-unknown-linux-gnu
    BUNDLE_PATH="src-tauri/target/x86_64-unknown-linux-gnu/debug/bundle"
fi

# Copy DEB package to dist
if [ -d "$BUNDLE_PATH/deb" ]; then
    DEB_FILE=$(ls "$BUNDLE_PATH/deb"/*.deb | head -1)
    if [ -n "$DEB_FILE" ]; then
        cp "$DEB_FILE" ../../dist/
        DEB_FILENAME=$(basename "$DEB_FILE")
        print_status "DEB package created: dist/$DEB_FILENAME"
        
        # Generate checksum
        shasum -a 256 "../../dist/$DEB_FILENAME" > "../../dist/$DEB_FILENAME.sha256"
        print_status "Checksum: $(cat "../../dist/$DEB_FILENAME.sha256")"
        
        # Show package info
        print_info "Package information:"
        dpkg-deb --info "../../dist/$DEB_FILENAME"
        
        # Install if requested
        if [ "$INSTALL" = true ]; then
            print_status "Installing DEB package..."
            sudo dpkg -i "../../dist/$DEB_FILENAME"
            # Fix any dependency issues
            sudo apt-get install -f
            print_status "Package installed successfully!"
        fi
    else
        print_error "No DEB file found in $BUNDLE_PATH/deb"
        exit 1
    fi
else
    print_error "DEB bundle directory not found: $BUNDLE_PATH/deb"
    print_info "Available directories:"
    ls -la "$BUNDLE_PATH/" 2>/dev/null || echo "Bundle path does not exist"
    exit 1
fi

cd ..

print_status "DEB package build completed!"
print_info "Files in dist directory:"
ls -la dist/

print_info ""
print_info "To install the package:"
print_info "  sudo dpkg -i dist/passman_${VERSION}_amd64.deb"
print_info "  sudo apt-get install -f  # Fix dependencies if needed"
print_info ""
print_info "To uninstall:"
print_info "  sudo dpkg -r passman"
print_info ""
print_info "Update behavior:"
print_info "  - Existing vaults and passwords are preserved"
print_info "  - User data is stored in ~/.local/share/passman/"
print_info "  - Configuration is stored in ~/.config/passman/"
