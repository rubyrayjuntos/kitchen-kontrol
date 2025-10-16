# Docker Testing & Local Development Guide

**Kitchen Kontrol** supports full Docker Compose testing. This guide covers running tests with Docker locally and in CI/CD.

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Docker Compose Configuration](#docker-compose-configuration)
3. [Local Testing with Docker](#local-testing-with-docker)
4. [E2E Tests with Docker](#e2e-tests-with-docker)
5. [Integration Tests with Docker](#integration-tests-with-docker)
6. [CI/CD Docker Integration](#cicd-docker-integration)
7. [Troubleshooting](#troubleshooting)
8. [Production vs Test Configuration](#production-vs-test-configuration)

---

## Quick Start

### Run Application in Docker (Development)

```bash
# Start full stack (frontend, backend, database)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop stack
docker-compose down
```

### Run Tests with Docker (Testing)

```bash
# Start test stack
docker-compose -f docker-compose.test.yml up -d

# Wait for services to be ready (automatic health checks)
sleep 10

# Run E2E tests against Docker stack
npx cypress run

# Run integration tests against Docker stack
npm test -- --testPathPattern="integration"

# Stop and cleanup test stack
docker-compose -f docker-compose.test.yml down -v
```

---

## Docker Compose Configuration

### Development Stack (`docker-compose.yml`)

```yaml
Services:
├── db (PostgreSQL 15)
│  ├── Port: 5432
│  ├── Creds: postgres/postgres
│  └── Database: kitchendb
│
├── backend (Node 20 + Express)
│  ├── Port: 3002
│  ├── Build: Dockerfile.server
│  ├── Depends on: db (healthy)
│  └── Environment: development
│
└── frontend (Node 20 + React)
   ├── Port: 3000
   ├── Build: Dockerfile.client
   ├── Container: nginx
   └── Depends on: backend
```

**Key Features:**
- ✓ Health checks on all services
- ✓ Automatic service startup order
- ✓ Volume persistence (pgdata)
- ✓ Environment configuration

### Test Stack (`docker-compose.test.yml`)

```yaml
Services:
├── db (PostgreSQL 15)
│  ├── Port: 5433 (isolated)
│  ├── Creds: test_user/test_password
│  ├── Database: kitchen_kontrol_test
│  └── Health check: pg_isready
│
├── backend (Node 20 + Express)
│  ├── Port: 3002
│  ├── Build: Dockerfile.server
│  ├── Depends on: db (healthy)
│  ├── Environment: test
│  └── Health check: /api/health endpoint
│
└── frontend (React)
   ├── Port: 3000
   ├── Build: Dockerfile.client
   ├── Depends on: backend (healthy)
   └── Environment: test with API_URL
```

**Key Differences from Dev:**
- Port 5433 (avoids conflict with dev database)
- Test database credentials
- All health checks enforced
- Isolated test data volume

---

## Local Testing with Docker

### Setup

**Prerequisites:**
```bash
docker --version        # v24+ recommended
docker-compose --version  # v2+ recommended
npm install            # Local dependencies for tests
```

### Option 1: Full Stack Testing

Start all services and run tests locally:

```bash
# 1. Start test stack
docker-compose -f docker-compose.test.yml up -d

# 2. Verify services are ready
docker-compose -f docker-compose.test.yml ps

# Expected output:
# STATUS: healthy for db and backend
# STATUS: up for frontend

# 3. Run your choice of tests:

# E2E tests (Cypress)
npx cypress open  # Interactive mode
npx cypress run   # Headless mode

# Integration tests
npm test -- --testPathPattern="integration" --watch

# Component tests (no Docker needed)
npm test -- --testPathPattern="components"

# All tests
npm test

# 4. View container logs
docker-compose -f docker-compose.test.yml logs -f backend
docker-compose -f docker-compose.test.yml logs -f frontend
docker-compose -f docker-compose.test.yml logs -f db

# 5. Cleanup
docker-compose -f docker-compose.test.yml down -v
```

### Option 2: Run Tests Against Dev Stack

Use your running development containers:

```bash
# 1. Ensure dev stack is running
docker-compose up -d

# 2. Run E2E tests (default: http://localhost:3000)
npx cypress run

# 3. Run integration tests
npm test -- --testPathPattern="integration"
```

### Option 3: Manual Testing

```bash
# Start stack in background
docker-compose -f docker-compose.test.yml up -d

# Manual API calls
curl http://localhost:3002/api/health
curl http://localhost:3002/api/users

# View frontend
open http://localhost:3000

# View backend logs
docker-compose -f docker-compose.test.yml logs backend

# When done, cleanup
docker-compose -f docker-compose.test.yml down -v
```

---

## E2E Tests with Docker

### Configuration

**`cypress.config.js`** should be configured for Docker:

```javascript
const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: process.env.CYPRESS_BASE_URL || 'http://localhost:3000',
    setupNodeEvents(on, config) {
      // Implement node event listeners here
    },
  },
});
```

**Environment Variables:**
```bash
CYPRESS_BASE_URL=http://localhost:3000
API_URL=http://localhost:3002
```

### Running E2E Tests

```bash
# Start test stack
docker-compose -f docker-compose.test.yml up -d

# Wait for services (health checks run automatically)
sleep 10

# Run Cypress (all specs)
npx cypress run

# Run specific spec
npx cypress run --spec "cypress/e2e/auth.cy.js"

# Interactive mode (while stack is running)
npx cypress open

# With headless browser
npx cypress run --headless --browser chrome

# View results
open mochawesome-report/mochawesome.html  # If using reporter
```

### Docker-Specific Considerations

**Network Access from Tests:**
- Services communicate via service name internally: `backend:3002`
- Tests on host communicate via `localhost:3000`
- Use `localhost:3000` in Cypress (tests run on host machine)

**Health Check Validation:**
```bash
# Backend must be ready
curl http://localhost:3002/api/health

# Frontend must be ready
curl http://localhost:3000

# Only then run tests
```

**Port Availability:**
```bash
# Check if ports are in use
lsof -i :3000
lsof -i :3002
lsof -i :5433

# Kill if needed (but use docker-compose down instead!)
kill -9 <PID>
```

---

## Integration Tests with Docker

### Configuration

Tests should connect to Docker database:

```bash
# Environment for integration tests
export DATABASE_URL=postgresql://test_user:test_password@localhost:5433/kitchen_kontrol_test
export NODE_ENV=test
export API_URL=http://localhost:3002
```

### Running Integration Tests

```bash
# Start test stack
docker-compose -f docker-compose.test.yml up -d

# Wait for database
sleep 5

# Run integration tests
npm test -- \
  --testPathPattern="integration" \
  --no-coverage \
  --watchAll=false

# With environment variables
DATABASE_URL=postgresql://test_user:test_password@localhost:5433/kitchen_kontrol_test \
API_URL=http://localhost:3002 \
NODE_ENV=test \
npm test -- --testPathPattern="integration"
```

---

## CI/CD Docker Integration

### GitHub Actions E2E Docker Workflow

A dedicated workflow `e2e-docker.yml` runs tests in containers:

```yaml
jobs:
  e2e-docker:
    # Starts docker-compose.test.yml
    # Runs E2E tests against containerized stack
    # Captures logs and artifacts on failure

  docker-build-test:
    # Builds Docker images
    # Validates Dockerfile configurations
    # Tests build process

  integration-with-docker:
    # Runs integration tests against Docker stack
    # Validates database connections
    # Tests full end-to-end flow
```

### Triggering Docker E2E Tests

```bash
# Automatically triggered on:
- Push to main/develop
- Pull requests to main/develop
- Daily at 2 AM UTC

# Manual trigger via GitHub Actions UI
```

### Viewing CI/CD Results

1. Go to GitHub repository
2. Click "Actions" tab
3. Select "E2E Tests - Docker Integration"
4. View workflow run
5. Check artifacts (screenshots, videos) if failed

---

## Troubleshooting

### Services Won't Start

**Problem:** `docker-compose up -d` fails

**Solutions:**
```bash
# Check Docker is running
docker ps

# View full error logs
docker-compose -f docker-compose.test.yml up  # Without -d

# Check logs for specific service
docker-compose -f docker-compose.test.yml logs db
docker-compose -f docker-compose.test.yml logs backend

# Rebuild images
docker-compose -f docker-compose.test.yml build --no-cache

# Remove orphaned containers
docker-compose -f docker-compose.test.yml down
docker system prune
```

### Port Already in Use

**Problem:** `Port 3002 is already allocated`

**Solutions:**
```bash
# Check what's using the port
lsof -i :3002
netstat -tulpn | grep 3002

# Use docker-compose to free ports (recommended)
docker-compose down
docker-compose -f docker-compose.test.yml down

# Or use different ports in docker-compose.test.yml
# Change ports: - '3003:3002'
```

### Database Connection Failed

**Problem:** Tests fail with database connection errors

**Solutions:**
```bash
# Verify database is running and healthy
docker-compose -f docker-compose.test.yml ps
# Status should be "healthy" for db

# Check database logs
docker-compose -f docker-compose.test.yml logs db

# Verify credentials
DATABASE_URL="postgresql://test_user:test_password@localhost:5433/kitchen_kontrol_test"

# Test connection manually
psql $DATABASE_URL -c "SELECT 1"

# If using from container
docker-compose -f docker-compose.test.yml exec db psql -U test_user -d kitchen_kontrol_test -c "SELECT 1"
```

### Backend Health Check Fails

**Problem:** `Backend health check failed`

**Solutions:**
```bash
# Check if backend is running
docker-compose -f docker-compose.test.yml logs backend

# Verify API endpoint
curl http://localhost:3002/api/health

# Check backend dependencies
docker-compose -f docker-compose.test.yml logs backend | grep -i error

# Rebuild backend image
docker-compose -f docker-compose.test.yml build --no-cache backend

# Check environment variables
docker-compose -f docker-compose.test.yml exec backend env | grep DATABASE_URL
```

### E2E Tests Fail to Connect

**Problem:** Cypress can't connect to frontend

**Solutions:**
```bash
# Verify frontend is running
docker-compose -f docker-compose.test.yml ps
# frontend status should be "up"

# Check frontend logs
docker-compose -f docker-compose.test.yml logs frontend

# Test frontend manually
curl http://localhost:3000

# Check Cypress base URL
echo $CYPRESS_BASE_URL  # Should be http://localhost:3000

# Run Cypress with verbose output
npx cypress run --verbose

# Use Cypress open to debug interactively
npx cypress open
```

### Docker Compose Version Issues

**Problem:** `docker-compose: command not found`

**Solutions:**
```bash
# Install Docker Compose v2
# Via Docker Desktop (recommended) or:
docker compose --version  # Note: no hyphen in v2+

# Use 'docker compose' instead of 'docker-compose'
docker compose -f docker-compose.test.yml up -d
```

---

## Production vs Test Configuration

### Comparison

| Aspect | Development | Testing | Production |
|--------|-------------|---------|-----------|
| **Compose File** | docker-compose.yml | docker-compose.test.yml | Manual or Kubernetes |
| **Database Port** | 5432 | 5433 | N/A (internal) |
| **DB Name** | kitchendb | kitchen_kontrol_test | kitchendb |
| **Node Env** | development | test | production |
| **Frontend Build** | dev build | test build | optimized build |
| **Backend Build** | with dev deps | test deps | prod only |
| **Health Checks** | Basic | Strict | Basic |
| **Volumes** | Mutable | Test-isolated | Read-only |
| **Logging** | Verbose | Captured | Monitored |

### Migrating from Test to Production

1. **Configuration**
   ```bash
   # Dev/Test uses docker-compose files
   # Production uses Docker Compose on server or Kubernetes
   ```

2. **Database**
   ```bash
   # Use managed PostgreSQL (AWS RDS, Azure Database, etc.)
   # Or production PostgreSQL container
   # Update DATABASE_URL in production secrets
   ```

3. **Secrets Management**
   ```bash
   # Development: .env file (not tracked)
   # Testing: Environment in docker-compose.test.yml
   # Production: GitHub Secrets / Docker Secrets / K8s Secrets
   ```

4. **Deployment**
   ```bash
   # Test locally with docker-compose.test.yml
   # Deploy via CI/CD (GitHub Actions)
   # Or manual docker-compose up on production server
   ```

---

## Quick Reference

### Most Common Commands

```bash
# Start development stack
docker-compose up -d

# Start test stack
docker-compose -f docker-compose.test.yml up -d

# Run all tests locally (no Docker)
npm test

# Run E2E tests against Docker stack
docker-compose -f docker-compose.test.yml up -d && npx cypress run

# View logs
docker-compose -f docker-compose.test.yml logs -f backend

# Stop and cleanup
docker-compose -f docker-compose.test.yml down -v

# Full cycle: start, test, cleanup
docker-compose -f docker-compose.test.yml up -d && sleep 10 && npm test && docker-compose -f docker-compose.test.yml down -v
```

---

## Next Steps

- ✅ Run local tests with `npm test`
- ✅ Test with Docker: `docker-compose -f docker-compose.test.yml up -d`
- ✅ Run E2E tests: `npx cypress run`
- ✅ Check GitHub Actions: Push to trigger CI/CD
- ✅ Deploy to production: Manual trigger via CD workflow

For issues, see [Troubleshooting](#troubleshooting) section.
