---
title: "Terraform Cloud Deployment Guide"
description: "Complete guide for deploying Sirius to AWS using Terraform Infrastructure as Code"
template: "TEMPLATE.guide"
version: "1.0.0"
last_updated: "2025-01-03"
author: "Development Team"
tags: ["terraform", "aws", "deployment", "infrastructure", "cloud"]
categories: ["deployment", "infrastructure"]
difficulty: "intermediate"
prerequisites: ["docker", "aws-cli", "terraform"]
related_docs: ["README.development.md", "README.architecture.md"]
dependencies: ["docker-compose.yaml", "infrastructure/"]
llm_context: "high"
search_keywords:
  ["terraform", "aws", "deployment", "infrastructure", "cloud", "ec2", "docker"]
---

# Terraform Cloud Deployment Guide

## Purpose

This guide provides comprehensive instructions for deploying Sirius to AWS using Terraform Infrastructure as Code. It covers everything from initial setup to production deployment, based on the proven infrastructure patterns from the sirius-demo project.

## When to Use This Guide

- **Production deployments** - Deploying Sirius to AWS for production use
- **Staging environments** - Creating isolated testing environments
- **Demo environments** - Setting up temporary demo instances
- **Infrastructure automation** - Managing infrastructure as code
- **Cloud migration** - Moving from local Docker to cloud deployment

## Prerequisites

### Required Tools

- **Terraform** >= 1.0.0
- **AWS CLI** >= 2.0.0
- **Docker** >= 20.10.0 (for local testing)
- **Git** >= 2.0.0

### AWS Requirements

- AWS account with appropriate permissions
- EC2, VPC, IAM, and S3 access
- Default VPC or custom VPC/subnet configuration

### Knowledge Prerequisites

- Basic understanding of Terraform
- AWS fundamentals (EC2, VPC, Security Groups)
- Docker and Docker Compose
- Linux command line

## Quick Start

### 1. Clone and Setup

```bash
# Clone the repository
git clone https://github.com/SiriusScan/Sirius.git
cd Sirius

# Create infrastructure directory
mkdir -p infrastructure/aws
cd infrastructure/aws
```

### 2. Basic Terraform Configuration

Create `main.tf`:

```hcl
terraform {
  required_version = ">= 1.0.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = var.common_tags
  }
}

# Data source for latest Ubuntu 22.04 LTS AMI
data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"] # Canonical

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

# Security Group for Sirius
resource "aws_security_group" "sirius" {
  name        = "sirius-sg"
  description = "Security group for Sirius deployment"
  vpc_id      = var.vpc_id

  # UI access
  ingress {
    description = "UI Access"
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = var.allowed_cidrs
  }

  # API access
  ingress {
    description = "API Access"
    from_port   = 9001
    to_port     = 9001
    protocol    = "tcp"
    cidr_blocks = var.allowed_cidrs
  }

  # HTTP/HTTPS for load balancer
  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = var.allowed_cidrs
  }

  ingress {
    description = "HTTPS"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = var.allowed_cidrs
  }

  # SSH access (optional)
  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = var.ssh_cidrs
  }

  # All outbound traffic
  egress {
    description = "All outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "sirius-sg"
  }
}

# IAM role for EC2 instance
resource "aws_iam_role" "sirius_instance" {
  name = "sirius-instance-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name = "sirius-instance-role"
  }
}

# Attach SSM managed policy
resource "aws_iam_role_policy_attachment" "ssm_managed_instance" {
  role       = aws_iam_role.sirius_instance.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

# Attach CloudWatch policy
resource "aws_iam_role_policy_attachment" "cloudwatch_agent" {
  role       = aws_iam_role.sirius_instance.name
  policy_arn = "arn:aws:iam::aws:policy/CloudWatchAgentServerPolicy"
}

# Instance profile
resource "aws_iam_instance_profile" "sirius" {
  name = "sirius-instance-profile"
  role = aws_iam_role.sirius_instance.name

  tags = {
    Name = "sirius-instance-profile"
  }
}

# EC2 Instance
resource "aws_instance" "sirius" {
  ami           = data.aws_ami.ubuntu.id
  instance_type = var.instance_type
  subnet_id     = var.subnet_id

  vpc_security_group_ids = [aws_security_group.sirius.id]
  iam_instance_profile   = aws_iam_instance_profile.sirius.name

  root_block_device {
    volume_type           = "gp3"
    volume_size           = var.root_volume_size
    delete_on_termination = true
    encrypted             = true
  }

  user_data = templatefile("${path.module}/user_data.sh", {
    sirius_repo_url = var.sirius_repo_url
    sirius_branch   = var.sirius_branch
    environment     = var.environment
  })

  user_data_replace_on_change = true

  tags = {
    Name = "sirius-${var.environment}"
  }
}
```

### 3. Variables Configuration

Create `variables.tf`:

```hcl
variable "aws_region" {
  description = "AWS region for deployment"
  type        = string
  default     = "us-east-1"
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t3.medium"
}

variable "root_volume_size" {
  description = "Root EBS volume size in GB"
  type        = number
  default     = 30
}

variable "vpc_id" {
  description = "VPC ID where Sirius will be deployed"
  type        = string
}

variable "subnet_id" {
  description = "Subnet ID for Sirius instance"
  type        = string
}

variable "allowed_cidrs" {
  description = "CIDR blocks allowed to access Sirius"
  type        = list(string)
  default     = ["0.0.0.0/0"]
}

variable "ssh_cidrs" {
  description = "CIDR blocks allowed SSH access"
  type        = list(string)
  default     = ["0.0.0.0/0"]
}

variable "sirius_repo_url" {
  description = "Sirius repository URL"
  type        = string
  default     = "https://github.com/SiriusScan/Sirius.git"
}

variable "sirius_branch" {
  description = "Git branch to deploy"
  type        = string
  default     = "main"
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "dev"
}

variable "common_tags" {
  description = "Common tags for all resources"
  type        = map(string)
  default = {
    Project     = "Sirius"
    Environment = "dev"
    ManagedBy   = "Terraform"
  }
}
```

### 4. Outputs Configuration

Create `outputs.tf`:

```hcl
output "instance_id" {
  description = "EC2 instance ID"
  value       = aws_instance.sirius.id
}

output "instance_public_ip" {
  description = "Public IP address of Sirius instance"
  value       = aws_instance.sirius.public_ip
}

output "instance_public_dns" {
  description = "Public DNS name of Sirius instance"
  value       = aws_instance.sirius.public_dns
}

output "ui_url" {
  description = "URL to access Sirius UI"
  value       = "http://${aws_instance.sirius.public_ip}:3000"
}

output "api_url" {
  description = "URL to access Sirius API"
  value       = "http://${aws_instance.sirius.public_ip}:9001"
}

output "ssh_command" {
  description = "SSH command to connect to instance"
  value       = "ssh -i ~/.ssh/your-key.pem ubuntu@${aws_instance.sirius.public_ip}"
}

output "ssm_command" {
  description = "AWS SSM Session Manager command"
  value       = "aws ssm start-session --target ${aws_instance.sirius.id} --region ${var.aws_region}"
}
```

### 5. Bootstrap Script

Create `user_data.sh`:

```bash
#!/bin/bash
set -e

# Log all output
exec > >(tee -a /var/log/sirius-bootstrap.log)
exec 2>&1

echo "========================================="
echo "Sirius Bootstrap Script"
echo "Started at: $(date)"
echo "Environment: ${environment}"
echo "========================================="

# Update system
echo "📦 Updating system packages..."
apt-get update -y
DEBIAN_FRONTEND=noninteractive apt-get upgrade -y

# Install dependencies
echo "📦 Installing dependencies..."
apt-get install -y \
    git \
    jq \
    curl \
    ca-certificates \
    gnupg \
    lsb-release

# Install Docker
echo "🐳 Installing Docker..."
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Start Docker
echo "🐳 Starting Docker service..."
systemctl enable docker
systemctl start docker
usermod -aG docker ubuntu

# Verify Docker
echo "✅ Verifying Docker installation..."
docker --version
docker compose version

# Create application directory
echo "📁 Creating application directory..."
mkdir -p /opt/sirius
cd /opt/sirius

# Clone repository
echo "📥 Cloning Sirius repository..."
echo "Repository: ${sirius_repo_url}"
echo "Branch: ${sirius_branch}"

git clone --branch ${sirius_branch} ${sirius_repo_url} repo
cd repo

# Create environment configuration
echo "⚙️  Configuring environment..."
cat > .env << 'EOF'
# Environment Configuration
NODE_ENV=production
GO_ENV=production

# Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=change_me_in_production
POSTGRES_DB=sirius
POSTGRES_HOST=sirius-postgres
POSTGRES_PORT=5432

# API
API_PORT=9001

# UI
NEXTAUTH_SECRET=change_me_in_production
NEXTAUTH_URL=http://localhost:3000

# Redis/Valkey
VALKEY_HOST=sirius-valkey
VALKEY_PORT=6379

# RabbitMQ
RABBITMQ_URL=amqp://guest:guest@sirius-rabbitmq:5672/

# Engine
ENGINE_MAIN_PORT=5174
GRPC_AGENT_PORT=50051

# Logging
LOG_LEVEL=info
EOF

echo "✅ Environment configuration created"

# Determine image tag from sirius_branch variable
if [[ "${sirius_branch}" =~ ^v[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    # Version tag (e.g., v0.4.1)
    IMAGE_TAG="${sirius_branch}"
elif [ "${sirius_branch}" == "main" ]; then
    # Main branch uses latest
    IMAGE_TAG="latest"
else
    # Default to latest
    IMAGE_TAG="latest"
fi
export IMAGE_TAG
echo "📦 Using image tag: ${IMAGE_TAG}"

# Pull Docker images from registry
echo "🐳 Pulling prebuilt images from GitHub Container Registry..."
docker compose pull || echo "⚠️  Some images may need to be built (fallback)"

# Start services (uses prebuilt images by default)
echo "🚀 Starting Sirius services..."
echo "Starting services with prebuilt images (this should take 2-5 minutes)..."
docker compose up -d

# Wait for services
echo "⏳ Waiting for services to initialize..."
sleep 30

# Show running containers
echo "📊 Running containers:"
docker compose ps

echo "========================================="
echo "Bootstrap completed at: $(date)"
echo "========================================="
echo ""
echo "Access services:"
echo "  UI:  http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):3000"
echo "  API: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):9001"
echo "========================================="
```

### 6. Terraform Variables File

Create `terraform.tfvars`:

```hcl
# AWS Configuration
aws_region = "us-east-1"

# Network Configuration (REQUIRED)
vpc_id    = "vpc-xxxxxxxxxxxxxxxxx"   # Replace with your VPC ID
subnet_id = "subnet-xxxxxxxxxxxxxxxxx" # Replace with your subnet ID

# Instance Configuration
instance_type      = "t3.medium"
root_volume_size   = 30

# Access Control
allowed_cidrs = ["0.0.0.0/0"]  # Restrict for production
ssh_cidrs     = ["0.0.0.0/0"]  # Restrict for production

# Repository Configuration
sirius_repo_url = "https://github.com/SiriusScan/Sirius.git"
sirius_branch   = "main"
environment     = "dev"

# Resource Tags
common_tags = {
  Project     = "Sirius"
  Environment = "dev"
  ManagedBy   = "Terraform"
  Owner       = "YourTeam"
}
```

## Container Registry Deployment

Sirius now uses prebuilt container images from GitHub Container Registry (GHCR) by default, providing **60-75% faster deployments** (5-8 minutes vs 20-25 minutes). The base `docker-compose.yaml` automatically pulls images from `ghcr.io/siriusscan/sirius-{ui,api,engine}:{tag}`.

### Image Tagging

Images are automatically tagged based on the deployment:

- **Version tags** (e.g., `v0.4.1`): Use when deploying specific releases
- **Latest tag**: Default for main branch deployments
- **Beta tag**: Available for beta releases

### Environment Variable

Control which images to use with the `IMAGE_TAG` environment variable in your bootstrap script:

```bash
# In user_data.sh or .env file
export IMAGE_TAG="${sirius_branch:-latest}"
```

### Benefits

- **Faster deployments**: 5-8 minutes vs 20-25 minutes
- **Reduced resource usage**: No compilation on EC2 instance
- **Consistent builds**: Same images tested in CI/CD
- **Easy updates**: Pull latest images without rebuilding

### Fallback to Local Builds

If registry images are unavailable, you can fall back to local builds by modifying the bootstrap script to use `docker compose up -d --build` instead of `docker compose up -d`.

For more details, see [Docker Container Deployment Guide](../deployment/README.docker-container-deployment.md).

## Deployment Process

### 1. Initialize Terraform

```bash
# Initialize Terraform
terraform init

# Validate configuration
terraform validate

# Review planned changes
terraform plan
```

### 2. Deploy Infrastructure

```bash
# Apply configuration
terraform apply

# Confirm with 'yes' when prompted
# Or use -auto-approve for automated deployment
terraform apply -auto-approve
```

### 3. Access Your Deployment

After deployment completes, Terraform will output the URLs:

```bash
# Get outputs
terraform output

# Access UI
open http://$(terraform output -raw instance_public_ip):3000

# Check API health
curl http://$(terraform output -raw instance_public_ip):9001/health
```

## Advanced Configuration

### Production Deployment

For production deployments, consider these enhancements:

#### 1. State Management

Create `backend.tf`:

```hcl
terraform {
  backend "s3" {
    bucket         = "your-terraform-state-bucket"
    key            = "sirius/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "terraform-state-lock"
  }
}
```

#### 2. Load Balancer Configuration

Add to `main.tf`:

```hcl
# Application Load Balancer
resource "aws_lb" "sirius" {
  name               = "sirius-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = var.subnet_ids

  enable_deletion_protection = false

  tags = {
    Name = "sirius-alb"
  }
}

# Target Group
resource "aws_lb_target_group" "sirius" {
  name     = "sirius-tg"
  port     = 3000
  protocol = "HTTP"
  vpc_id   = var.vpc_id

  health_check {
    enabled             = true
    healthy_threshold   = 2
    interval            = 30
    matcher             = "200"
    path                = "/"
    port                = "traffic-port"
    protocol            = "HTTP"
    timeout             = 5
    unhealthy_threshold = 2
  }
}

# ALB Listener
resource "aws_lb_listener" "sirius" {
  load_balancer_arn = aws_lb.sirius.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.sirius.arn
  }
}

# Target Group Attachment
resource "aws_lb_target_group_attachment" "sirius" {
  target_group_arn = aws_lb_target_group.sirius.arn
  target_id        = aws_instance.sirius.id
  port             = 3000
}
```

#### 3. Database Configuration

For production, consider using RDS:

```hcl
# RDS Instance
resource "aws_db_instance" "sirius" {
  identifier = "sirius-db"

  engine         = "postgres"
  engine_version = "15.4"
  instance_class = "db.t3.micro"

  allocated_storage     = 20
  max_allocated_storage = 100
  storage_type          = "gp2"
  storage_encrypted     = true

  db_name  = "sirius"
  username = "postgres"
  password = var.db_password

  vpc_security_group_ids = [aws_security_group.rds.id]
  db_subnet_group_name   = aws_db_subnet_group.sirius.name

  backup_retention_period = 7
  backup_window          = "03:00-04:00"
  maintenance_window     = "sun:04:00-sun:05:00"

  skip_final_snapshot = true

  tags = {
    Name = "sirius-db"
  }
}
```

### Environment-Specific Deployments

#### Development Environment

```hcl
# terraform.tfvars.dev
environment = "dev"
instance_type = "t3.small"
allowed_cidrs = ["0.0.0.0/0"]
```

#### Staging Environment

```hcl
# terraform.tfvars.staging
environment = "staging"
instance_type = "t3.medium"
allowed_cidrs = ["10.0.0.0/8", "172.16.0.0/12", "192.168.0.0/16"]
```

#### Production Environment

```hcl
# terraform.tfvars.prod
environment = "prod"
instance_type = "t3.large"
allowed_cidrs = ["10.0.0.0/8"]  # Restrict to internal networks
ssh_cidrs = ["10.0.0.0/8"]      # Restrict SSH access
```

## Monitoring and Maintenance

### Health Checks

```bash
# Check instance status
aws ec2 describe-instances --instance-ids $(terraform output -raw instance_id)

# Check application health
curl -f http://$(terraform output -raw instance_public_ip):9001/health

# Check Docker containers
aws ssm start-session --target $(terraform output -raw instance_id) --region us-east-1
docker compose ps
```

### Log Management

```bash
# View bootstrap logs
aws ssm start-session --target $(terraform output -raw instance_id) --region us-east-1
sudo tail -f /var/log/sirius-bootstrap.log

# View application logs
docker compose logs -f
```

### Updates and Scaling

```bash
# Update instance type
terraform apply -var="instance_type=t3.large"

# Update to new branch
terraform apply -var="sirius_branch=feature/new-feature"

# Scale storage
terraform apply -var="root_volume_size=50"
```

## Security Considerations

### Network Security

- **Restrict access**: Use specific CIDR blocks instead of 0.0.0.0/0
- **Use private subnets**: Deploy in private subnets with NAT Gateway
- **Implement WAF**: Add AWS WAF for additional protection
- **VPN access**: Use VPN for secure access to private resources

### Instance Security

- **Key pairs**: Use EC2 key pairs for SSH access
- **Security groups**: Implement least-privilege security group rules
- **IAM roles**: Use IAM roles instead of access keys
- **Encryption**: Enable encryption for EBS volumes

### Application Security

- **Secrets management**: Use AWS Secrets Manager or Parameter Store
- **TLS certificates**: Implement SSL/TLS with ACM
- **Regular updates**: Keep base images and dependencies updated
- **Monitoring**: Implement CloudWatch monitoring and alerting

## Troubleshooting

### Common Issues

#### 1. Instance Not Starting

```bash
# Check instance status
aws ec2 describe-instances --instance-ids $(terraform output -raw instance_id)

# View system logs
aws ec2 get-console-output --instance-id $(terraform output -raw instance_id)
```

#### 2. Services Not Responding

```bash
# Connect to instance
aws ssm start-session --target $(terraform output -raw instance_id) --region us-east-1

# Check Docker status
sudo systemctl status docker
docker compose ps

# View logs
docker compose logs -f
```

#### 3. Network Connectivity Issues

```bash
# Check security groups
aws ec2 describe-security-groups --group-ids $(terraform output -raw security_group_id)

# Test connectivity
curl -v http://$(terraform output -raw instance_public_ip):3000
```

### Debugging Commands

```bash
# Terraform state inspection
terraform state list
terraform state show aws_instance.sirius

# Plan changes
terraform plan -var-file="terraform.tfvars.prod"

# Destroy and recreate
terraform destroy
terraform apply
```

## Cost Optimization

### Instance Sizing

- **Development**: t3.small (2 vCPU, 2GB RAM) - ~$15/month
- **Staging**: t3.medium (2 vCPU, 4GB RAM) - ~$30/month
- **Production**: t3.large (2 vCPU, 8GB RAM) - ~$60/month

### Storage Optimization

- **GP3 volumes**: More cost-effective than GP2
- **Right-sizing**: Monitor usage and adjust volume sizes
- **Cleanup**: Regular cleanup of unused resources

### Monitoring Costs

```bash
# Check current costs
aws ce get-cost-and-usage \
  --time-period Start=2024-01-01,End=2024-01-31 \
  --granularity MONTHLY \
  --metrics BlendedCost

# Set up billing alerts
aws cloudwatch put-metric-alarm \
  --alarm-name "Sirius-Monthly-Cost" \
  --alarm-description "Alert when monthly cost exceeds $100" \
  --metric-name EstimatedCharges \
  --namespace AWS/Billing \
  --statistic Maximum \
  --period 86400 \
  --threshold 100 \
  --comparison-operator GreaterThanThreshold
```

## Cleanup

### Destroy Infrastructure

```bash
# Destroy all resources
terraform destroy

# Confirm with 'yes' when prompted
# Or use -auto-approve
terraform destroy -auto-approve
```

### Clean Up State

```bash
# Remove state file (if using local state)
rm terraform.tfstate*

# Clean up .terraform directory
rm -rf .terraform/
```

## Best Practices

### Infrastructure as Code

- **Version control**: Keep all Terraform files in version control
- **State management**: Use remote state with locking
- **Modular design**: Break down into reusable modules
- **Documentation**: Document all variables and outputs

### Security

- **Least privilege**: Use minimal required permissions
- **Secrets management**: Never hardcode secrets
- **Regular updates**: Keep Terraform and providers updated
- **Audit trails**: Enable CloudTrail for API calls

### Operations

- **Monitoring**: Implement comprehensive monitoring
- **Backup**: Regular backups of state and data
- **Testing**: Test changes in non-production first
- **Documentation**: Keep deployment procedures documented

## Integration with CI/CD

### GitHub Actions Example

```yaml
name: Deploy Sirius
on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1

      - name: Setup Terraform
        uses: hashicorp/setup-terraform@v3
        with:
          terraform_version: 1.6.0

      - name: Terraform Init
        run: |
          cd infrastructure/aws
          terraform init

      - name: Terraform Plan
        run: |
          cd infrastructure/aws
          terraform plan

      - name: Terraform Apply
        run: |
          cd infrastructure/aws
          terraform apply -auto-approve
```

## Related Documentation

- [Development Guide](dev/README.development.md) - Local development setup
- [Architecture Overview](dev/architecture/README.architecture.md) - System architecture
- [Container Testing](dev/test/README.container-testing.md) - Testing procedures

## Support

For issues with Terraform deployment:

1. Check the troubleshooting section above
2. Review Terraform logs and AWS CloudTrail
3. Consult AWS documentation for specific services
4. Create an issue in the Sirius repository

---

_This guide follows the Sirius Documentation Standard. For questions about documentation structure, see [ABOUT.documentation.md](dev/ABOUT.documentation.md)._
