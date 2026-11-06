---
name: ci-cd-and-automation
description: CI/CD pipeline design and implementation - GitHub Actions, GitLab CI, automated testing, deployment strategies, and release management
---

# CI/CD and Automation

You are an expert in CI/CD pipeline design, implementation, and optimization. Guide users through building reliable, fast, and secure automation workflows.

## When to Use This Skill

Use this skill when:
- Setting up CI/CD for new projects
- Optimizing existing pipelines
- Implementing automated testing
- Configuring deployment strategies
- Managing release workflows
- Setting up branch protection rules
- Implementing infrastructure as code
- Automating code quality checks

## CI/CD Fundamentals

### Pipeline Stages

**Standard Pipeline**
```yaml
# Typical CI/CD pipeline stages
1. Build - Compile code, install dependencies
2. Test - Run unit, integration, e2e tests
3. Security - Scan for vulnerabilities
4. Quality - Linting, formatting, code coverage
5. Package - Create artifacts (Docker images, binaries)
6. Deploy Staging - Deploy to staging environment
7. Deploy Production - Deploy to production
```

### Pipeline Design Principles

- **Fast Feedback**: Keep pipelines under 10 minutes
- **Parallel Execution**: Run independent jobs in parallel
- **Caching**: Cache dependencies and build artifacts
- **Fail Fast**: Stop on first failure
- **Reproducible**: Same input = same output
- **Idempotent**: Can run multiple times safely

## GitHub Actions

### Basic Workflow

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Build
        run: npm run build
```

### Advanced Workflow

```yaml
name: Advanced CI/CD

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint

  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18, 20, 22]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'
      - run: npm ci
      - run: npm test
      - name: Upload coverage
        uses: actions/upload-artifact@v4
        with:
          name: coverage-${{ matrix.node-version }}
          path: coverage/

  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run security audit
        run: npm audit --audit-level=high
      - name: Run Snyk
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}

  build:
    needs: [lint, test, security]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-artifact@v4
        with:
          name: build
          path: dist/

  deploy-staging:
    needs: build
    if: github.ref == 'refs/heads/develop'
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - uses: actions/download-artifact@v4
        with:
          name: build
          path: dist/
      - name: Deploy to staging
        run: ./deploy.sh staging

  deploy-production:
    needs: build
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/download-artifact@v4
        with:
          name: build
          path: dist/
      - name: Deploy to production
        run: ./deploy.sh production
```

### Caching

```yaml
- name: Cache node modules
  uses: actions/cache@v4
  with:
    path: ~/.npm
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
    restore-keys: |
      ${{ runner.os }}-node-

- name: Cache build output
  uses: actions/cache@v4
  with:
    path: .next/cache
    key: ${{ runner.os }}-nextjs-${{ hashFiles('**/package-lock.json') }}
```

### Matrix Strategy

```yaml
jobs:
  test:
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
        node-version: [18, 20, 22]
    runs-on: ${{ matrix.os }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
      - run: npm test
```

## Docker Integration

### Multi-Stage Build

```dockerfile
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./

EXPOSE 3000
CMD ["node", "dist/index.js"]
```

### GitHub Actions with Docker

```yaml
jobs:
  docker:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3
      
      - name: Login to Docker Hub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}
      
      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          push: true
          tags: user/app:latest,user/app:${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
```

## Deployment Strategies

### Blue-Green Deployment

```yaml
# Deploy to green environment
- name: Deploy to green
  run: |
    kubectl set image deployment/app-green app=myapp:$IMAGE_TAG
    kubectl rollout status deployment/app-green

# Switch traffic to green
- name: Switch to green
  run: |
    kubectl patch service app -p '{"spec":{"selector":{"version":"green"}}}'

# Verify and cleanup blue
- name: Verify and cleanup
  run: |
    sleep 30  # Wait for traffic to switch
    kubectl set image deployment/app-blue app=myapp:$PREVIOUS_TAG
```

### Canary Deployment

```yaml
- name: Deploy canary (10% traffic)
  run: |
    kubectl set image deployment/app-canary app=myapp:$IMAGE_TAG
    kubectl scale deployment/app-canary --replicas=1

- name: Monitor canary
  run: |
    # Check error rate
    ERROR_RATE=$(curl -s http://metrics/error-rate)
    if (( $(echo "$ERROR_RATE > 0.01" | bc -l) )); then
      echo "Error rate too high, rolling back"
      kubectl delete deployment/app-canary
      exit 1
    fi

- name: Promote canary
  run: |
    kubectl set image deployment/app app=myapp:$IMAGE_TAG
    kubectl delete deployment/app-canary
```

## Infrastructure as Code

### Terraform

```hcl
# main.tf
provider "aws" {
  region = "us-west-2"
}

resource "aws_instance" "app" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t2.micro"
  
  tags = {
    Name = "app-server"
    Environment = "production"
  }
}

resource "aws_security_group" "app_sg" {
  name = "app-sg"
  
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
}
```

### GitHub Actions with Terraform

```yaml
jobs:
  terraform:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Terraform
        uses: hashicorp/setup-terraform@v3
      
      - name: Terraform Init
        run: terraform init
      
      - name: Terraform Plan
        run: terraform plan
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
      
      - name: Terraform Apply
        if: github.ref == 'refs/heads/main'
        run: terraform apply -auto-approve
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
```

## Branch Protection

### Required Status Checks

```yaml
# .github/settings.yml (using probot/settings)
branches:
  - name: main
    protection:
      required_status_checks:
        strict: true
        contexts:
          - test
          - lint
          - security
      required_pull_request_reviews:
        required_approving_review_count: 2
        dismiss_stale_reviews: true
      enforce_admins: true
      restrictions:
        users: []
        teams: []
        apps: []
```

## Release Management

### Automated Releases

```yaml
name: Release

on:
  push:
    tags:
      - 'v*'

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
      
      - name: Generate changelog
        run: npx conventional-changelog -p angular -i CHANGELOG.md -s
      
      - name: Create GitHub Release
        uses: actions/create-release@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tag_name: ${{ github.ref }}
          release_name: Release ${{ github.ref }}
          body_path: CHANGELOG.md
```

## Best Practices

### Pipeline Optimization
- Use caching for dependencies
- Run jobs in parallel when possible
- Use matrix builds for testing across environments
- Keep pipelines under 10 minutes
- Fail fast on errors

### Security
- Scan dependencies for vulnerabilities
- Use secrets management (never commit secrets)
- Implement branch protection rules
- Require code reviews
- Sign commits and tags
- Use OIDC for cloud authentication

### Testing
- Run tests on every PR
- Use test coverage thresholds
- Implement integration tests
- Add E2E tests for critical flows
- Use test parallelization

### Deployment
- Use environment-specific configurations
- Implement rollback procedures
- Use feature flags for gradual rollouts
- Monitor deployments with health checks
- Automate database migrations

## Quality Standards

- **Reliable**: Pipelines should pass consistently
- **Fast**: Optimize for speed without sacrificing quality
- **Secure**: Scan for vulnerabilities at every stage
- **Observable**: Log and monitor pipeline execution
- **Maintainable**: Keep configurations simple and documented

**IMPORTANT**: CI/CD is the backbone of modern development - invest in it.
**IMPORTANT**: Security is not optional - scan at every stage.
**IMPORTANT**: Test your pipelines - they're code too.
