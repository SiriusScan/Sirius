---
title: "Testing Checklists by Issue Type"
description: "Comprehensive testing checklists for different types of changes to ensure thorough validation before merging"
template: "TEMPLATE.documentation-standard"
version: "1.0.0"
last_updated: "2025-10-11"
author: "Development Team"
tags: ["testing", "checklist", "validation", "quality-assurance"]
categories: ["testing", "development"]
difficulty: "beginner"
prerequisites: ["docker", "git", "development-environment"]
related_docs:
  - "README.container-testing.md"
  - "../operations/README.git-operations.md"
dependencies: []
llm_context: "high"
search_keywords: ["testing", "checklist", "validation", "qa", "issue-types"]
---

# Testing Checklists by Issue Type

## Purpose

This document provides specific testing checklists for different types of changes. Use the appropriate checklist based on what components your fix or feature affects.

## When to Use

- **Before committing** any code changes
- **Before merging** to main/demo branch
- **During code review** to ensure completeness
- **After deployment** for verification

## How to Use

1. Identify which type of change you're making
2. Follow the complete checklist for that type
3. Check off each item as you test
4. Document any failures or issues
5. Only proceed to merge after all checks pass

## Testing Checklists

### Frontend Changes (UI/UX)

**Applies to**: Changes in `sirius-ui/src/pages/`, `sirius-ui/src/components/`

- [ ] **Visual Testing**

  - [ ] Component renders correctly in browser
  - [ ] Responsive design works on mobile/tablet/desktop
  - [ ] Dark mode (if applicable) displays correctly
  - [ ] All buttons and interactive elements are clickable
  - [ ] No layout breaking or overflow issues

- [ ] **Functional Testing**

  - [ ] All forms submit correctly
  - [ ] Validation messages display properly
  - [ ] Error states are handled gracefully
  - [ ] Loading states display when appropriate
  - [ ] Success/error toasts appear as expected

- [ ] **Browser Testing**

  - [ ] Chrome/Chromium (primary)
  - [ ] Firefox (if significant changes)
  - [ ] Safari (if significant changes)

- [ ] **Accessibility**

  - [ ] Keyboard navigation works
  - [ ] Screen reader friendly (if major UI change)
  - [ ] Proper ARIA labels (if applicable)

- [ ] **Container Testing**
  - [ ] Hot reload works in development mode
  - [ ] Production build completes successfully
  - [ ] No console errors in browser

**Container Commands**:

```bash
# Development mode test
docker compose up

# Production build test
docker compose -f docker-compose.yaml up --build
```

---

### Backend API Changes (TRPC/Routes)

**Applies to**: Changes in `sirius-ui/src/server/api/routers/`

- [ ] **API Endpoint Testing**

  - [ ] Endpoint accepts correct input format
  - [ ] Endpoint returns expected data structure
  - [ ] Error cases return appropriate error messages
  - [ ] HTTP status codes are correct
  - [ ] Response time is acceptable

- [ ] **Data Validation**

  - [ ] Input validation works (Zod schemas)
  - [ ] Required fields are enforced
  - [ ] Type coercion works correctly
  - [ ] Invalid data is rejected with clear errors

- [ ] **Authentication/Authorization**

  - [ ] Protected endpoints require authentication
  - [ ] Session/JWT validation works
  - [ ] Unauthorized access is blocked

- [ ] **Database Interaction**

  - [ ] Queries return expected data
  - [ ] No SQL injection vulnerabilities
  - [ ] Transactions complete successfully
  - [ ] Error handling for database failures

- [ ] **Container Testing**
  - [ ] Check logs for errors: `docker compose logs sirius-ui`
  - [ ] Verify no crashes or exceptions
  - [ ] Test with development and production builds

**Testing Example**:

```bash
# Watch container logs during testing
docker compose logs -f sirius-ui

# Test endpoint via browser console or Postman
# Verify response structure and error handling
```

---

### Database Schema Changes

**Applies to**: Changes in `sirius-ui/prisma/schema.prisma`, migrations

- [ ] **Schema Validation**

  - [ ] Prisma schema is valid: `npx prisma validate`
  - [ ] Migration generates correctly: `npx prisma migrate dev`
  - [ ] No conflicting field types
  - [ ] Relationships are correctly defined

- [ ] **Migration Testing**

  - [ ] Migration runs successfully on clean database
  - [ ] Migration is reversible (if needed)
  - [ ] Existing data is preserved (if applicable)
  - [ ] Seed script works with new schema

- [ ] **Application Testing**

  - [ ] All queries still work
  - [ ] CRUD operations function correctly
  - [ ] No type errors in TypeScript
  - [ ] Prisma Client regenerates correctly

- [ ] **Data Integrity**
  - [ ] Foreign keys are enforced
  - [ ] Unique constraints work
  - [ ] Default values are applied
  - [ ] Required fields are enforced

**Container Commands**:

```bash
# Inside container
docker exec -it sirius-ui npx prisma db push --force-reset
docker exec -it sirius-ui npm run seed

# Verify schema
docker exec -it sirius-ui npx prisma validate

# Check generated client
docker exec -it sirius-ui npx prisma generate
```

---

### Authentication Changes

**Applies to**: Changes in `sirius-ui/src/server/auth.ts`, auth-related endpoints

- [ ] **Login/Logout Testing**

  - [ ] Can log in with valid credentials
  - [ ] Login fails with invalid credentials
  - [ ] Logout clears session correctly
  - [ ] Session persists across page refreshes

- [ ] **Session Management**

  - [ ] Session timeout works correctly
  - [ ] JWT tokens are generated properly
  - [ ] Token expiration is handled
  - [ ] Refresh tokens work (if implemented)

- [ ] **Password Security**

  - [ ] Passwords are hashed (never stored plain text)
  - [ ] Password reset works correctly
  - [ ] Old password verification works
  - [ ] Password requirements are enforced

- [ ] **Protected Routes**

  - [ ] Unauthorized users are redirected to login
  - [ ] Authorized users can access protected pages
  - [ ] Session state is checked on route changes

- [ ] **Database State**
  - [ ] User records are created/updated correctly
  - [ ] Can reset database to default credentials
  - [ ] Seed script recreates admin user

**Testing Commands**:

```bash
# Reset database to default credentials
docker exec -it sirius-ui npx prisma db push --force-reset
docker exec -it sirius-ui npm run seed

# Default credentials: admin / password
```

**Important**: After testing authentication changes, **reset the database** so other developers aren't affected:

```bash
docker exec -it sirius-ui npm run seed
```

---

### Docker/Container Changes

**Applies to**: Changes in `Dockerfile`, `docker-compose.yaml`, startup scripts

- [ ] **Build Testing**

  - [ ] Development image builds successfully
  - [ ] Production image builds successfully
  - [ ] Build time is reasonable
  - [ ] Image size is acceptable

- [ ] **Runtime Testing**

  - [ ] Container starts successfully
  - [ ] All processes run correctly
  - [ ] Environment variables are loaded
  - [ ] Healthchecks pass

- [ ] **Development Mode**

  - [ ] Hot reload works
  - [ ] Volume mounts work correctly
  - [ ] Source code changes reflect immediately
  - [ ] Debugging is possible

- [ ] **Production Mode**

  - [ ] Optimized build runs correctly
  - [ ] No development dependencies in final image
  - [ ] Security scanning passes (if applicable)
  - [ ] Startup time is acceptable

- [ ] **Multi-Container Testing**
  - [ ] All containers start together
  - [ ] Services can communicate
  - [ ] Networking is configured correctly
  - [ ] Dependencies start in correct order

**Testing Commands**:

```bash
# Test development build
docker compose up --build

# Test production build
docker compose -f docker-compose.yaml up --build

# Check container health
docker compose ps

# View logs for debugging
docker compose logs -f [service-name]

# Test rebuild after changes
docker compose down
docker compose up --build
```

---

### Documentation Changes

**Applies to**: Changes in `documentation/` directory

- [ ] **Content Quality**

  - [ ] YAML front matter is complete and valid
  - [ ] All required sections are present
  - [ ] Examples are accurate and tested
  - [ ] Links are valid and working
  - [ ] Code snippets are correct

- [ ] **Structure Validation**

  - [ ] Follows appropriate template
  - [ ] Consistent formatting throughout
  - [ ] Proper markdown syntax
  - [ ] Headings are hierarchical

- [ ] **Documentation Index**

  - [ ] File is added to `README.documentation-index.md`
  - [ ] Categorized correctly
  - [ ] Description is accurate

- [ ] **Pre-commit Checks**
  - [ ] Quick documentation checks pass
  - [ ] Index completeness validation passes
  - [ ] No linting errors

**Testing Commands**:

```bash
cd testing
make lint-docs-quick  # Quick validation
make lint-docs         # Full validation
make lint-index        # Index completeness check
```

---

### Git Operations Changes

**Applies to**: Changes in pre-commit hooks, git workflows

- [ ] **Pre-commit Hook Testing**

  - [ ] Hook runs on commit attempt
  - [ ] Checks execute correctly
  - [ ] Failures block commit appropriately
  - [ ] Success allows commit to proceed

- [ ] **Workflow Testing**

  - [ ] Test on feature branch
  - [ ] Test on main/demo branch
  - [ ] Verify branch detection logic
  - [ ] Check optimization flags work

- [ ] **Documentation**
  - [ ] New workflow is documented
  - [ ] Examples are provided
  - [ ] Troubleshooting section added

**Testing Commands**:

```bash
# Test pre-commit hook
git add .
git commit -m "test: validate pre-commit hook"

# Test on feature branch
git checkout -b test/pre-commit-test
# Make a change and commit

# Test failure cases
# Intentionally create validation failure
```

---

## Post-Merge Verification

After merging to main/demo, verify:

- [ ] **Container Health**

  - [ ] All containers start successfully
  - [ ] No errors in logs
  - [ ] Services respond to requests

- [ ] **Functionality Check**

  - [ ] Core features still work
  - [ ] No regressions introduced
  - [ ] New feature/fix works as expected

- [ ] **Rollback Preparedness**
  - [ ] Know the last good commit hash
  - [ ] Can quickly revert if needed
  - [ ] Team is notified of deployment

---

## Troubleshooting Testing Issues

### Container Won't Start

```bash
# Check logs
docker compose logs [service-name]

# Rebuild from scratch
docker compose down -v
docker compose build --no-cache
docker compose up
```

### Database Issues

```bash
# Reset database
docker exec -it sirius-ui npx prisma db push --force-reset
docker exec -it sirius-ui npm run seed
```

### Network Issues

```bash
# Check container networking
docker network ls
docker network inspect sirius_default

# Restart containers
docker compose restart
```

### Build Issues

```bash
# Clear Docker cache
docker builder prune -a

# Rebuild specific service
docker compose build --no-cache [service-name]
```

---

## Continuous Improvement

**Add new checklists** as you encounter new types of issues:

1. Document what testing was needed
2. Create a new checklist section
3. Include specific commands and examples
4. Update this document
5. Notify team of new checklist

**Update existing checklists** based on:

- Issues that slipped through testing
- New tools or testing approaches
- Feedback from team members
- Changes in technology stack

---

_This document follows the Sirius Documentation Standard. For questions about documentation structure, see [ABOUT.documentation.md](../ABOUT.documentation.md)._
