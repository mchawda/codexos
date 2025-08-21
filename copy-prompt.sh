# SPDX-License-Identifier: LicenseRef-NIA-Proprietary
#!/bin/bash

# Script to copy a prompt file to clipboard

# Check if a prompt file was specified
if [ $# -eq 0 ]; then
    echo "Usage: ./copy-prompt.sh <prompt-file>"
    echo "Available prompts:"
    ls -1 *.md | grep -v "README.md" | grep -v "PRD.md" | sed 's/^/  - /'
    exit 1
fi

# Check if the file exists
if [ ! -f "$1" ]; then
    echo "Error: File '$1' not found."
    exit 1
fi

# Check which operating system we're on
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    cat "$1" | pbcopy
    echo "Prompt copied to clipboard! Paste it into your AI assistant."
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux with xclip
    if command -v xclip > /dev/null; then
        cat "$1" | xclip -selection clipboard
        echo "Prompt copied to clipboard! Paste it into your AI assistant."
    elif command -v xsel > /dev/null; then
        cat "$1" | xsel --clipboard
        echo "Prompt copied to clipboard! Paste it into your AI assistant."
    else
        echo "Error: xclip or xsel is not installed. Please install one of them or copy the file contents manually."
        exit 1
    fi
elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    # Windows with clip
    cat "$1" | clip
    echo "Prompt copied to clipboard! Paste it into your AI assistant."
else
    echo "Unsupported operating system. Please copy the file contents manually."
    exit 1
fi 