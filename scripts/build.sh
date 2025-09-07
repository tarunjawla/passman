#!/bin/bash

# Build script for PassMan
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
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

# Check if we're in the right directory
if [ ! -f "Cargo.toml" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

# Parse command line arguments
BUILD_DESKTOP=false
BUILD_CLI=false
BUILD_ALL=false
TARGET=""
RELEASE=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --desktop)
            BUILD_DESKTOP=true
            shift
            ;;
        --cli)
            BUILD_CLI=true
            shift
            ;;
        --all)
            BUILD_ALL=true
            shift
            ;;
        --target)
            TARGET="$2"
            shift 2
            ;;
        --release)
            RELEASE=true
            shift
            ;;
        --help)
            echo "Usage: $0 [OPTIONS]"
            echo "Options:"
            echo "  --desktop     Build desktop app only"
            echo "  --cli         Build CLI only"
            echo "  --all         Build both desktop and CLI"
            echo "  --target      Target architecture (e.g., x86_64-unknown-linux-gnu)"
            echo "  --release     Build in release mode"
            echo "  --help        Show this help message"
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Default to building all if no specific target is specified
if [ "$BUILD_DESKTOP" = false ] && [ "$BUILD_CLI" = false ] && [ "$BUILD_ALL" = false ]; then
    BUILD_ALL=true
fi

# Set build mode
BUILD_MODE=""
if [ "$RELEASE" = true ]; then
    BUILD_MODE="--release"
    print_status "Building in release mode"
else
    print_status "Building in debug mode"
fi

# Set target
TARGET_FLAG=""
if [ -n "$TARGET" ]; then
    TARGET_FLAG="--target $TARGET"
    print_status "Building for target: $TARGET"
fi

# Create output directory
mkdir -p dist

# Build CLI
if [ "$BUILD_CLI" = true ] || [ "$BUILD_ALL" = true ]; then
    print_status "Building CLI..."
    
    if [ -n "$TARGET" ]; then
        cargo build $BUILD_MODE $TARGET_FLAG --bin passman
        BINARY_PATH="target/$TARGET/release/passman"
        if [ "$RELEASE" = false ]; then
            BINARY_PATH="target/$TARGET/debug/passman"
        fi
    else
        cargo build $BUILD_MODE --bin passman
        BINARY_PATH="target/release/passman"
        if [ "$RELEASE" = false ]; then
            BINARY_PATH="target/debug/passman"
        fi
    fi
    
    # Create CLI archive
    CLI_ARCHIVE="dist/passman-cli-$(uname -s | tr '[:upper:]' '[:lower:]')-$(uname -m).tar.gz"
    mkdir -p temp-cli
    cp "$BINARY_PATH" temp-cli/passman
    chmod +x temp-cli/passman
    tar -czf "$CLI_ARCHIVE" -C temp-cli .
    rm -rf temp-cli
    
    # Generate checksum
    shasum -a 256 "$CLI_ARCHIVE" > "$CLI_ARCHIVE.sha256"
    
    print_status "CLI built: $CLI_ARCHIVE"
    print_status "Checksum: $(cat "$CLI_ARCHIVE.sha256")"
fi

# Build Desktop
if [ "$BUILD_DESKTOP" = true ] || [ "$BUILD_ALL" = true ]; then
    print_status "Building desktop app..."
    
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
    
    # Build Tauri app
    print_status "Building Tauri app..."
    if [ -n "$TARGET" ]; then
        npm run tauri build -- --target "$TARGET"
    else
        npm run tauri build
    fi
    
    # Move built files to dist
    if [ -n "$TARGET" ]; then
        BUNDLE_PATH="src-tauri/target/$TARGET/release/bundle"
    else
        BUNDLE_PATH="src-tauri/target/release/bundle"
    fi
    
    # Copy desktop app files
    if [ -d "$BUNDLE_PATH/dmg" ]; then
        cp "$BUNDLE_PATH/dmg"/*.dmg ../../dist/passman-macos.dmg
        shasum -a 256 ../../dist/passman-macos.dmg > ../../dist/passman-macos.dmg.sha256
    fi
    
    if [ -d "$BUNDLE_PATH/msi" ]; then
        cp "$BUNDLE_PATH/msi"/*.msi ../../dist/passman-windows.msi
        shasum -a 256 ../../dist/passman-windows.msi > ../../dist/passman-windows.msi.sha256
    fi
    
    if [ -d "$BUNDLE_PATH/appimage" ]; then
        cp "$BUNDLE_PATH/appimage"/*.AppImage ../../dist/passman-linux.AppImage
        shasum -a 256 ../../dist/passman-linux.AppImage > ../../dist/passman-linux.AppImage.sha256
    fi
    
    cd ..
    
    print_status "Desktop app built successfully"
fi

print_status "Build completed! Check the 'dist' directory for artifacts."
ls -la dist/
