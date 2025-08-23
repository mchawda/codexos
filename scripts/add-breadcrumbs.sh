#!/bin/bash

# Script to add breadcrumbs to all documentation files
# Usage: ./scripts/add-breadcrumbs.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🔗 Adding breadcrumbs to documentation files..."

# Function to add breadcrumbs based on file path
add_breadcrumbs() {
    local file_path="$1"
    local relative_path="${file_path#docs/}"
    local dir_name=$(dirname "$relative_path")
    local file_name=$(basename "$relative_path" .md)
    
    # Skip if already has breadcrumbs
    if grep -q "📚 Docs ▸" "$file_path"; then
        echo -e "${YELLOW}⚠️  Skipping $file_path (already has breadcrumbs)${NC}"
        return
    fi
    
    # Determine breadcrumb based on path
    local breadcrumb=""
    case "$dir_name" in
        ".")
            # Root docs directory
            case "$file_name" in
                "README")
                    breadcrumb="📚 Docs ▸ Documentation Overview"
                    ;;
                "architecture")
                    breadcrumb="📚 Docs ▸ Architecture & Design"
                    ;;
                "quickstart")
                    breadcrumb="📚 Docs ▸ Getting Started"
                    ;;
                "security")
                    breadcrumb="📚 Docs ▸ Security & Compliance"
                    ;;
                "threat-model")
                    breadcrumb="📚 Docs ▸ Security & Threat Model"
                    ;;
                "rbac")
                    breadcrumb="📚 Docs ▸ Security & Compliance"
                    ;;
                "production")
                    breadcrumb="📚 Docs ▸ Deployment & Operations"
                    ;;
                "hostinger-deployment")
                    breadcrumb="📚 Docs ▸ Deployment & Operations"
                    ;;
                "tenancy")
                    breadcrumb="📚 Docs ▸ Architecture & Design"
                    ;;
                "sub-agent-chaining")
                    breadcrumb="📚 Docs ▸ Architecture & Design"
                    ;;
                *)
                    breadcrumb="📚 Docs ▸ Documentation"
                    ;;
            esac
            ;;
        "runbooks")
            case "$file_name" in
                "README")
                    breadcrumb="📚 Docs ▸ Runbooks"
                    ;;
                "database-maintenance"|"monitoring-alerting"|"deployment"|"backup-recovery")
                    breadcrumb="📚 Docs ▸ Runbooks ▸ Operations"
                    ;;
                "security-incidents"|"service-outages"|"performance-issues"|"data-loss")
                    breadcrumb="📚 Docs ▸ Runbooks ▸ Incident Response"
                    ;;
                "system-updates"|"certificate-management"|"log-management"|"resource-scaling")
                    breadcrumb="📚 Docs ▸ Runbooks ▸ Maintenance"
                    ;;
                *)
                    breadcrumb="📚 Docs ▸ Runbooks"
                    ;;
            esac
            ;;
        "api")
            breadcrumb="📚 Docs ▸ API Reference"
            ;;
        *)
            breadcrumb="📚 Docs ▸ Documentation"
            ;;
    esac
    
    # Add breadcrumbs after the title
    if [ -n "$breadcrumb" ]; then
        # Create temporary file
        temp_file=$(mktemp)
        
        # Add breadcrumbs after the first line (title)
        awk -v breadcrumb="$breadcrumb" '
        NR == 1 { print; print ""; print "> **" breadcrumb "**  "; print "> **Last Updated**: $(date)  "; print "> **Status**: Active"; print ""; next }
        { print }
        ' "$file_path" > "$temp_file"
        
        # Replace original file
        mv "$temp_file" "$file_path"
        
        echo -e "${GREEN}✅ Added breadcrumbs to $file_path${NC}"
    fi
}

# Find all markdown files in docs directory
find docs -name "*.md" -type f | while read -r file; do
    add_breadcrumbs "$file"
done

echo -e "${GREEN}🎉 Breadcrumbs added to all documentation files!${NC}"
echo ""
echo "Next steps:"
echo "1. Review the changes: git diff"
echo "2. Commit the updates: git add . && git commit -m 'Add breadcrumbs to documentation'"
echo "3. Test the CI link checker: git push"
