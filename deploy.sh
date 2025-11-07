#!/bin/bash

# Production deployment script for Arcane City Frontend
# This script handles safe deployment with error checking and logging

set -euo pipefail  # Exit on error, undefined variables, and pipe failures

# Color output for better visibility
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Configuration
DEPLOY_DIR="/var/www/arcane-city-frontend"
BACKUP_DIR="$DEPLOY_DIR/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

log_info "Starting deployment at $(date)"
log_info "Current directory contents:"
ls -la

# Change to deployment directory
cd "$DEPLOY_DIR" || { log_error "Failed to change to deployment directory"; exit 1; }

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Backup current build before deployment
if [ -d "dist" ]; then
    log_info "Backing up current build to $BACKUP_DIR/dist_$TIMESTAMP"
    cp -r dist "$BACKUP_DIR/dist_$TIMESTAMP"
    
    # Keep only the last 5 backups
    ls -t "$BACKUP_DIR" | tail -n +6 | xargs -r -I {} rm -rf "$BACKUP_DIR/{}"
fi

# Pull latest changes from main branch
log_info "Pulling latest changes from main branch..."
if ! git pull origin main; then
    log_error "Git pull failed"
    exit 1
fi

# Install dependencies
log_info "Installing dependencies..."
if ! npm ci; then
    log_error "npm ci failed"
    exit 1
fi

# Build the application
log_info "Building application..."
if ! npm run build; then
    log_error "Build failed, restoring from backup if available"
    if [ -d "$BACKUP_DIR/dist_$TIMESTAMP" ]; then
        rm -rf dist
        cp -r "$BACKUP_DIR/dist_$TIMESTAMP" dist
        log_warn "Restored previous build from backup"
    fi
    exit 1
fi

# Verify build was successful
if [ ! -d "dist" ] || [ ! -f "dist/index.html" ]; then
    log_error "Build verification failed - dist directory or index.html not found"
    exit 1
fi

log_info "Deployment completed successfully at $(date)"
log_info "Build size: $(du -sh dist | cut -f1)"