#!/bin/bash

# Script metadata
VULNERABILITY_ID="CVE-2024-PASSWORD-001"
SEVERITY="high"
DESCRIPTION="Detects insecure password files (passwords.txt) in user home directories"
AUTHOR="sirius-security-team"
VERSION="1.0"

# Configuration
VERBOSE=false
SPECIFIC_USER=""

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --verbose|-v)
            VERBOSE=true
            shift
            ;;
        --user|-u)
            SPECIFIC_USER="$2"
            shift 2
            ;;
        --help|-h)
            echo "Usage: $0 [--verbose] [--user <username>]"
            echo "  --verbose, -v    Enable verbose output"
            echo "  --user, -u       Check specific user's home directory"
            echo "  --help, -h       Show this help message"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Logging function
log_verbose() {
    if [[ "$VERBOSE" == "true" ]]; then
        echo "[VERBOSE] $1" >&2
    fi
}

# Main detection function
find_password_files() {
    local vulnerable=false
    local confidence=0.0
    local evidence=()
    local error=""
    local total_files_found=0

    log_verbose "Starting password file detection"

    # Determine which directories to search
    local search_dirs=()
    
    if [[ -n "$SPECIFIC_USER" ]]; then
        # Check specific user's home directory
        if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
            # Windows
            local user_home="/c/Users/$SPECIFIC_USER"
        else
            # Linux/macOS
            local user_home="/home/$SPECIFIC_USER"
            if [[ "$OSTYPE" == "darwin"* ]]; then
                user_home="/Users/$SPECIFIC_USER"
            fi
        fi
        
        if [[ -d "$user_home" ]]; then
            search_dirs+=("$user_home")
        else
            error="User home directory not found for user: $SPECIFIC_USER"
        fi
    else
        # Search current user's home directory
        if [[ -n "$HOME" ]]; then
            search_dirs+=("$HOME")
        else
            error="HOME environment variable not set"
        fi
    fi

    if [[ -n "$error" ]]; then
        cat << EOF
{
    "vulnerability_id": "$VULNERABILITY_ID",
    "vulnerable": null,
    "confidence": 0.0,
    "evidence": [],
    "metadata": {},
    "error": "$error"
}
EOF
        return
    fi

    # Search for password files
    for search_dir in "${search_dirs[@]}"; do
        log_verbose "Searching directory: $search_dir"
        
        # Look for passwords.txt files (case insensitive)
        local password_files
        password_files=$(find "$search_dir" -type f -iname "passwords.txt" 2>/dev/null)
        
        if [[ -n "$password_files" ]]; then
            while IFS= read -r password_file; do
                if [[ -n "$password_file" ]]; then
                    total_files_found=$((total_files_found + 1))
                    vulnerable=true
                    
                    # Get file details
                    local file_size
                    local file_perms
                    local file_owner
                    local file_modified
                    
                    file_size=$(stat -c%s "$password_file" 2>/dev/null || stat -f%z "$password_file" 2>/dev/null || echo "unknown")
                    file_perms=$(stat -c%a "$password_file" 2>/dev/null || stat -f%A "$password_file" 2>/dev/null || echo "unknown")
                    file_owner=$(stat -c%U "$password_file" 2>/dev/null || stat -f%Su "$password_file" 2>/dev/null || echo "unknown")
                    file_modified=$(stat -c%Y "$password_file" 2>/dev/null || stat -f%m "$password_file" 2>/dev/null || echo "unknown")
                    
                    # Check if file is world-readable
                    local world_readable=false
                    if [[ "$file_perms" =~ [0-9][0-9][4-7] ]]; then
                        world_readable=true
                    fi
                    
                    # Build evidence entry
                    local evidence_entry
                    evidence_entry=$(cat << EOF
{
    "type": "insecure_password_file",
    "file_path": "$password_file",
    "file_size": "$file_size",
    "file_permissions": "$file_perms",
    "file_owner": "$file_owner",
    "last_modified": "$file_modified",
    "world_readable": $world_readable,
    "risk_level": "$(if [[ "$world_readable" == "true" ]]; then echo "critical"; else echo "high"; fi)"
}
EOF
                    )
                    
                    evidence+=("$evidence_entry")
                    
                    log_verbose "FOUND: $password_file (size: $file_size, perms: $file_perms, world-readable: $world_readable)"
                fi
            done <<< "$password_files"
        fi
        
        # Also look for other common password file patterns
        local other_patterns=("password.txt" "pass.txt" "passwords.log" "creds.txt" "credentials.txt")
        for pattern in "${other_patterns[@]}"; do
            local found_files
            found_files=$(find "$search_dir" -type f -iname "$pattern" 2>/dev/null)
            
            if [[ -n "$found_files" ]]; then
                while IFS= read -r found_file; do
                    if [[ -n "$found_file" ]]; then
                        total_files_found=$((total_files_found + 1))
                        vulnerable=true
                        
                        local file_size
                        local file_perms
                        file_size=$(stat -c%s "$found_file" 2>/dev/null || stat -f%z "$found_file" 2>/dev/null || echo "unknown")
                        file_perms=$(stat -c%a "$found_file" 2>/dev/null || stat -f%A "$found_file" 2>/dev/null || echo "unknown")
                        
                        local evidence_entry
                        evidence_entry=$(cat << EOF
{
    "type": "potential_password_file",
    "file_path": "$found_file",
    "file_size": "$file_size",
    "file_permissions": "$file_perms",
    "risk_level": "medium"
}
EOF
                        )
                        
                        evidence+=("$evidence_entry")
                        
                        log_verbose "FOUND: $found_file (pattern: $pattern)"
                    fi
                done <<< "$found_files"
            fi
        done
    done

    # Calculate confidence
    if [[ "$vulnerable" == "true" ]]; then
        if [[ $total_files_found -ge 5 ]]; then
            confidence=0.95
        elif [[ $total_files_found -ge 3 ]]; then
            confidence=0.85
        elif [[ $total_files_found -ge 2 ]]; then
            confidence=0.75
        else
            confidence=0.65
        fi
    fi

    # Format evidence array
    local evidence_json=""
    if [[ ${#evidence[@]} -gt 0 ]]; then
        evidence_json=$(printf '%s,' "${evidence[@]}" | sed 's/,$//')
    fi

    log_verbose "Password file detection complete: $total_files_found files found"

    # Output JSON result
    cat << EOF
{
    "vulnerability_id": "$VULNERABILITY_ID",
    "vulnerable": $vulnerable,
    "confidence": $confidence,
    "evidence": [$evidence_json],
    "metadata": {
        "scan_type": "password_file_detection",
        "total_files_found": $total_files_found,
        "search_directories": "$(printf '%s,' "${search_dirs[@]}" | sed 's/,$//')",
        "searched_user": "$(if [[ -n "$SPECIFIC_USER" ]]; then echo "$SPECIFIC_USER"; else echo "current"; fi)"
    },
    "error": null
}
EOF
}

# Execute detection
find_password_files 