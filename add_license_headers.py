#!/usr/bin/env python3
# SPDX-License-Identifier: LicenseRef-NIA-Proprietary
"""
Script to add SPDX license headers to all source code files
"""

import os
import glob
from pathlib import Path

def add_license_header(file_path):
    """Add SPDX license header to a file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Skip if already has license header
        if "SPDX-License-Identifier: LicenseRef-NIA-Proprietary" in content:
            return False
        
        # Determine comment style based on file extension
        ext = Path(file_path).suffix.lower()
        
        if ext in ['.py', '.sh', '.ps1', '.bat']:
            header = "# SPDX-License-Identifier: LicenseRef-NIA-Proprietary\n"
        elif ext in ['.tsx', '.ts', '.js', '.jsx', '.json', '.yml', '.yaml', '.toml', '.ini', '.cfg', '.conf']:
            header = "// SPDX-License-Identifier: LicenseRef-NIA-Proprietary\n"
        else:
            return False
        
        # Add header at the beginning
        new_content = header + content
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        
        return True
    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return False

def main():
    """Main function to process all source code files"""
    # File patterns to process
    patterns = [
        "**/*.py",
        "**/*.tsx", 
        "**/*.ts",
        "**/*.js",
        "**/*.jsx",
        "**/*.sql",
        "**/*.sh",
        "**/*.ps1",
        "**/*.bat",
        "**/*.yml",
        "**/*.yaml",
        "**/*.toml",
        "**/*.ini",
        "**/*.cfg",
        "**/*.conf"
    ]
    
    # Directories to exclude
    exclude_dirs = {
        'node_modules', '.git', '.next', '__pycache__', 
        '.pytest_cache', '.venv', 'venv', 'env'
    }
    
    processed = 0
    skipped = 0
    
    for pattern in patterns:
        for file_path in glob.glob(pattern, recursive=True):
            # Skip excluded directories
            if any(exclude_dir in file_path for exclude_dir in exclude_dirs):
                continue
            
            if add_license_header(file_path):
                processed += 1
                print(f"Added license header: {file_path}")
            else:
                skipped += 1
    
    print(f"\nSummary:")
    print(f"Files processed: {processed}")
    print(f"Files skipped (already had header): {skipped}")
    print(f"Total files: {processed + skipped}")

if __name__ == "__main__":
    main()
