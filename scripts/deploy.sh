#!/bin/bash

# Sirius Scan Deployment Script
# Usage: ./scripts/deploy.sh [environment] [image_tag]
# Example: ./scripts/deploy.sh production v1.2.3

set -e  # Exit on any error

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
ENVIRONMENTS_DIR="$PROJECT_DIR/environments"

# Default values
ENVIRONMENT="${1:-development}"
IMAGE_TAG="${2:-latest}"
COMPOSE_PROJECT_NAME="sirius"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Help function
show_help() {
    cat << EOF
Sirius Scan Deployment Script

Usage: $0 [ENVIRONMENT] [IMAGE_TAG]

ENVIRONMENT:
    development  - Local development (default)
    staging      - Staging environment
    production   - Production environment

IMAGE_TAG:
    Version tag for Docker images (default: latest)

Examples:
    $0                          # Deploy development with latest images
    $0 staging                  # Deploy staging with latest images
    $0 production v1.2.3        # Deploy production with specific version
    $0 staging beta-2024.01.15  # Deploy staging with beta version

Environment Configuration:
    All environments use defaults in compose files with override capability:
    - Development: Uses docker-compose.override.yaml
    - Staging/Production: Uses sensible defaults with ${VAR:-default} syntax
    - Override any variable: export POSTGRES_PASSWORD=mypassword

Docker Compose Files:
    - docker-compose.yaml (base configuration)
    - docker-compose.override.yaml (development - auto-loaded)
    - docker-compose.staging.yaml (staging environment)
    - docker-compose.production.yaml (production environment)

EOF
}

# Validate environment
validate_environment() {
    case "$ENVIRONMENT" in
        development|staging|production)
            log_info "Deploying to: $ENVIRONMENT"
            ;;
        help|--help|-h)
            show_help
            exit 0
            ;;
        *)
            log_error "Invalid environment: $ENVIRONMENT"
            log_error "Valid environments: development, staging, production"
            exit 1
            ;;
    esac
}

# Check if environment file exists (now using defaults in compose files)
check_env_file() {
    if [[ "$ENVIRONMENT" == "development" ]]; then
        log_info "Development environment uses docker-compose.override.yaml"
        return 0
    fi
    
    log_info "Using defaults from compose files (no separate env file needed)"
    log_info "Override variables with: export POSTGRES_PASSWORD=yourpassword"
}

# Check if Docker Compose files exist
check_compose_files() {
    local base_file="$PROJECT_DIR/docker-compose.yaml"
    local env_file=""
    
    if [[ ! -f "$base_file" ]]; then
        log_error "Base docker-compose.yaml not found: $base_file"
        exit 1
    fi
    
    case "$ENVIRONMENT" in
        development)
            env_file="$PROJECT_DIR/docker-compose.override.yaml"
            ;;
        staging)
            env_file="$PROJECT_DIR/docker-compose.staging.yaml"
            ;;
        production)
            env_file="$PROJECT_DIR/docker-compose.production.yaml"
            ;;
    esac
    
    if [[ -n "$env_file" && ! -f "$env_file" ]]; then
        log_error "Environment-specific compose file not found: $env_file"
        exit 1
    fi
    
    log_success "Docker Compose files validated"
}

# Pre-deployment checks
pre_deployment_checks() {
    log_info "Running pre-deployment checks..."
    
    # Check if Docker is running
    if ! docker info >/dev/null 2>&1; then
        log_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
    
    # Check if Docker Compose is available
    if ! command -v docker >/dev/null 2>&1; then
        log_error "Docker Compose is not installed or not in PATH"
        exit 1
    fi
    
    # Check available disk space (warn if less than 5GB)
    local available_space=$(df "$PROJECT_DIR" | awk 'NR==2 {print $4}')
    if [[ "$available_space" -lt 5242880 ]]; then  # 5GB in KB
        log_warning "Low disk space detected. Consider cleaning up before deployment."
    fi
    
    log_success "Pre-deployment checks passed"
}

# Build compose command
build_compose_command() {
    local cmd="docker compose"
    
    # Add base compose file
    cmd="$cmd -f docker-compose.yaml"
    
    # Add environment-specific compose file
    case "$ENVIRONMENT" in
        staging)
            cmd="$cmd -f docker-compose.staging.yaml"
            ;;
        production)
            cmd="$cmd -f docker-compose.production.yaml"
            ;;
        development)
            # docker-compose.override.yaml is loaded automatically
            ;;
    esac
    
    # Environment variables are handled with defaults in compose files
    # No separate env files needed
    
    # Set project name
    cmd="$cmd -p ${COMPOSE_PROJECT_NAME}_${ENVIRONMENT}"
    
    echo "$cmd"
}

# Pull images for production/staging
pull_images() {
    if [[ "$ENVIRONMENT" == "development" ]]; then
        log_info "Skipping image pull for development environment"
        return 0
    fi
    
    log_info "Pulling Docker images for $ENVIRONMENT..."
    
    local compose_cmd=$(build_compose_command)
    
    # Export IMAGE_TAG for compose
    export IMAGE_TAG="$IMAGE_TAG"
    
    if $compose_cmd pull; then
        log_success "Images pulled successfully"
    else
        log_error "Failed to pull images"
        exit 1
    fi
}

# Deploy services
deploy_services() {
    log_info "Deploying services for $ENVIRONMENT environment..."
    
    local compose_cmd=$(build_compose_command)
    
    # Export IMAGE_TAG for compose
    export IMAGE_TAG="$IMAGE_TAG"
    
    # Deploy based on environment
    case "$ENVIRONMENT" in
        development)
            log_info "Starting development environment with build..."
            if $compose_cmd up --build -d; then
                log_success "Development environment started"
            else
                log_error "Failed to start development environment"
                exit 1
            fi
            ;;
        staging|production)
            log_info "Starting $ENVIRONMENT environment..."
            if $compose_cmd up -d; then
                log_success "$ENVIRONMENT environment started"
            else
                log_error "Failed to start $ENVIRONMENT environment"
                exit 1
            fi
            ;;
    esac
}

# Health checks
run_health_checks() {
    log_info "Running health checks..."
    
    local compose_cmd=$(build_compose_command)
    
    # Wait for services to be ready
    sleep 10
    
    # Check if all services are running
    local running_services=$($compose_cmd ps --services --filter "status=running" | wc -l)
    local total_services=$($compose_cmd ps --services | wc -l)
    
    if [[ "$running_services" -eq "$total_services" ]]; then
        log_success "All services are running ($running_services/$total_services)"
    else
        log_warning "Some services may not be running ($running_services/$total_services)"
        log_info "Service status:"
        $compose_cmd ps
    fi
    
    # Basic connectivity tests
    case "$ENVIRONMENT" in
        development)
            log_info "Testing local endpoints..."
            if curl -f http://localhost:3000 >/dev/null 2>&1; then
                log_success "UI is responding on http://localhost:3000"
            else
                log_warning "UI may not be ready yet on http://localhost:3000"
            fi
            
            if curl -f http://localhost:9001 >/dev/null 2>&1; then
                log_success "API is responding on http://localhost:9001"
            else
                log_warning "API may not be ready yet on http://localhost:9001"
            fi
            ;;
    esac
}

# Show deployment summary
show_summary() {
    log_success "Deployment completed successfully!"
    echo
    echo "=== Deployment Summary ==="
    echo "Environment: $ENVIRONMENT"
    echo "Image Tag: $IMAGE_TAG"
    echo "Project Name: ${COMPOSE_PROJECT_NAME}_${ENVIRONMENT}"
    echo
    
    case "$ENVIRONMENT" in
        development)
            echo "Access URLs:"
            echo "  UI: http://localhost:3000"
            echo "  API: http://localhost:9001"
            echo "  RabbitMQ Management: http://localhost:15672"
            echo "  PostgreSQL: localhost:5432"
            echo
            echo "Useful commands:"
            echo "  View logs: docker compose logs -f"
            echo "  Stop services: docker compose down"
            echo "  Restart: docker compose restart"
            ;;
        staging|production)
            echo "Useful commands:"
            local compose_cmd=$(build_compose_command)
            echo "  View logs: $compose_cmd logs -f"
            echo "  Stop services: $compose_cmd down"
            echo "  Restart: $compose_cmd restart"
            echo "  Scale service: $compose_cmd up -d --scale sirius-api=3"
            ;;
    esac
    
    echo
    echo "For more information, see: documentation/README.deployment-strategy.md"
}

# Cleanup on exit
cleanup() {
    if [[ $? -ne 0 ]]; then
        log_error "Deployment failed. Check the logs above for details."
        echo
        echo "Troubleshooting tips:"
        echo "1. Check Docker daemon is running"
        echo "2. Verify environment file exists and is valid"
        echo "3. Ensure sufficient disk space"
        echo "4. Check network connectivity for image pulls"
    fi
}

trap cleanup EXIT

# Main execution
main() {
    echo "=== Sirius Scan Deployment Script ==="
    echo
    
    validate_environment
    check_env_file
    check_compose_files
    pre_deployment_checks
    
    if [[ "$ENVIRONMENT" != "development" ]]; then
        pull_images
    fi
    
    deploy_services
    run_health_checks
    show_summary
}

# Change to project directory
cd "$PROJECT_DIR"

# Run main function
main "$@" 