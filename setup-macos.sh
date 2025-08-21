#!/bin/bash
# SPDX-License-Identifier: LicenseRef-NIA-Proprietary

# CodexOS macOS Setup Script
# Quick setup for macOS users

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${GREEN}🍎 CodexOS macOS Setup${NC}"
echo "Setting up CodexOS on your Mac..."
echo ""

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to display error and exit
error_exit() {
    echo -e "${RED}❌ Error: $1${NC}" >&2
    exit 1
}

# Function to display success
success() {
    echo -e "${GREEN}✓ $1${NC}"
}

# Function to display info
info() {
    echo -e "${BLUE}→ $1${NC}"
}

# Function to display warning
warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Install Homebrew if not present
install_homebrew() {
    if ! command_exists brew; then
        info "Installing Homebrew..."
        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
        
        # Add Homebrew to PATH for Apple Silicon Macs
        if [[ $(uname -m) == "arm64" ]]; then
            echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
            eval "$(/opt/homebrew/bin/brew shellenv)"
        fi
        
        success "Homebrew installed"
    else
        success "Homebrew found"
    fi
}

# Install Xcode Command Line Tools
install_xcode_tools() {
    if ! xcode-select -p >/dev/null 2>&1; then
        info "Installing Xcode Command Line Tools..."
        xcode-select --install
        echo "Please complete the Xcode Command Line Tools installation in the popup window."
        echo "Press Enter when installation is complete..."
        read -r
        success "Xcode Command Line Tools installed"
    else
        success "Xcode Command Line Tools found"
    fi
}

# Install Node.js
install_nodejs() {
    if ! command_exists node; then
        info "Installing Node.js..."
        brew install node
        success "Node.js installed"
    else
        NODE_VERSION=$(node -v | cut -d 'v' -f 2 | cut -d '.' -f 1)
        if [ "$NODE_VERSION" -lt 18 ]; then
            warning "Node.js version 18+ is required. Current version: $(node -v)"
            info "Updating Node.js..."
            brew upgrade node
        else
            success "Node.js $(node -v) found"
        fi
    fi
}

# Install Python
install_python() {
    if ! command_exists python3; then
        info "Installing Python 3.11..."
        brew install python@3.11
        success "Python 3.11 installed"
    else
        PYTHON_VERSION=$(python3 -c 'import sys; print(".".join(map(str, sys.version_info[:2])))')
        PYTHON_MAJOR=$(echo $PYTHON_VERSION | cut -d '.' -f 1)
        PYTHON_MINOR=$(echo $PYTHON_VERSION | cut -d '.' -f 2)
        if [ "$PYTHON_MAJOR" -lt 3 ] || ([ "$PYTHON_MAJOR" -eq 3 ] && [ "$PYTHON_MINOR" -lt 11 ]); then
            warning "Python 3.11+ is required. Current version: $PYTHON_VERSION"
            info "Updating Python..."
            brew upgrade python@3.11
        else
            success "Python $PYTHON_VERSION found"
        fi
    fi
}

# Install Docker
install_docker() {
    if ! command_exists docker; then
        info "Installing Docker Desktop..."
        brew install --cask docker
        success "Docker Desktop installed"
        warning "Please start Docker Desktop manually from Applications folder"
        echo "Press Enter when Docker Desktop is running..."
        read -r
    else
        success "Docker found"
    fi
    
    # Check if Docker is running
    if ! docker info >/dev/null 2>&1; then
        error_exit "Docker is not running. Please start Docker Desktop and try again."
    fi
}

# Install additional tools
install_tools() {
    info "Installing additional development tools..."
    
    # Install pnpm
    if ! command_exists pnpm; then
        info "Installing pnpm..."
        npm install -g pnpm
        success "pnpm installed"
    else
        success "pnpm found"
    fi
    
    # Install Poetry
    if ! command_exists poetry; then
        info "Installing Poetry..."
        curl -sSL https://install.python-poetry.org | python3 -
        export PATH="$HOME/.local/bin:$PATH"
        success "Poetry installed"
    else
        success "Poetry found"
    fi
    
    # Install additional useful tools
    info "Installing additional tools..."
    brew install git curl wget jq
    success "Additional tools installed"
}

# Setup shell configuration
setup_shell() {
    info "Setting up shell configuration..."
    
    # Add Poetry to PATH permanently
    if [[ "$SHELL" == *"zsh"* ]]; then
        if ! grep -q "export PATH=\"\$HOME/.local/bin:\$PATH\"" ~/.zshrc; then
            echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc
            success "Added Poetry to PATH in ~/.zshrc"
        fi
    elif [[ "$SHELL" == *"bash"* ]]; then
        if ! grep -q "export PATH=\"\$HOME/.local/bin:\$PATH\"" ~/.bash_profile; then
            echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bash_profile
            success "Added Poetry to PATH in ~/.bash_profile"
        fi
    fi
    
    # Reload shell configuration
    if [[ "$SHELL" == *"zsh"* ]]; then
        source ~/.zshrc
    elif [[ "$SHELL" == *"bash"* ]]; then
        source ~/.bash_profile
    fi
}

# Verify installation
verify_installation() {
    info "Verifying installation..."
    
    echo ""
    echo -e "${BLUE}Installed versions:${NC}"
    echo "Node.js: $(node -v)"
    echo "npm: $(npm -v)"
    echo "pnpm: $(pnpm -v)"
    echo "Python: $(python3 --version)"
    echo "Poetry: $(poetry --version)"
    echo "Docker: $(docker --version)"
    echo "Docker Compose: $(docker-compose --version)"
    echo ""
    
    success "All tools installed successfully!"
}

# Show next steps
show_next_steps() {
    echo ""
    echo -e "${GREEN}🎉 macOS setup completed!${NC}"
    echo ""
    echo -e "${BLUE}Next steps:${NC}"
    echo "1. Run: ./startup-new-laptop.sh (for first-time setup)"
    echo "2. Or run: ./build-dev.sh (for development builds)"
    echo "3. Access CodexOS at: http://localhost:3000"
    echo ""
    echo -e "${YELLOW}💡 Tips:${NC}"
    echo "- Docker Desktop must be running before using Docker commands"
    echo "- You may need to restart your terminal for PATH changes to take effect"
    echo "- Check the documentation in the docs/ folder"
    echo ""
    echo -e "${GREEN}Happy coding with CodexOS on macOS! 🚀${NC}"
}

# Main execution
main() {
    echo -e "${BLUE}Starting macOS setup...${NC}"
    echo ""
    
    install_xcode_tools
    install_homebrew
    install_nodejs
    install_python
    install_docker
    install_tools
    setup_shell
    verify_installation
    show_next_steps
}

# Run main function
main "$@"
