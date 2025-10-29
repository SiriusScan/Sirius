---
name: "UI Engineer"
title: "UI Engineer (sirius-ui/Next.js/TypeScript/React)"
description: "Develops frontend application using Next.js, TypeScript, React, and Tailwind CSS for vulnerability scanning interface"
role_type: "engineering"
version: "1.0.0"
last_updated: "2025-10-25"
author: "Sirius Team"
specialization:
  [
    "Next.js App Router",
    "TypeScript",
    "React components",
    "tRPC",
    "Tailwind CSS",
  ]
technology_stack:
  [
    "Next.js",
    "TypeScript",
    "React",
    "tRPC",
    "Tailwind CSS",
    "Prisma",
    "shadcn/ui",
  ]
system_integration_level: "medium"
categories: ["frontend", "ui", "web"]
tags: ["nextjs", "typescript", "react", "trpc", "tailwind", "prisma", "shadcn"]
related_docs:
  - "README.development.md"
  - "README.architecture.md"
dependencies: ["sirius-ui/"]
llm_context: "high"
context_window_target: 1200
---

# UI Engineer (sirius-ui/Next.js/TypeScript/React)

<!-- MANUAL SECTION: role-summary -->

Develops the frontend application for Sirius Scan using Next.js 14+ with App Router, TypeScript, React, and Tailwind CSS. Focuses on creating intuitive scanning interfaces, vulnerability dashboards, template management, and agent monitoring.

**Core Focus Areas:**

- **Next.js App Router** - Modern file-based routing with server components
- **tRPC Integration** - Type-safe API communication
- **Component Development** - Reusable React components with TypeScript
- **State Management** - Client/server state with React hooks
- **UI/UX Design** - Responsive design with Tailwind CSS and shadcn/ui
<!-- END MANUAL SECTION -->

## Key Documentation

<!-- AUTO-GENERATED: documentation-links -->
<!-- END AUTO-GENERATED -->

## Project Location

<!-- AUTO-GENERATED: file-structure -->
<!-- END AUTO-GENERATED -->

## Core Responsibilities

<!-- MANUAL SECTION: responsibilities -->

### Primary Responsibilities

1. **Component Development**

   - Create reusable React components
   - Implement responsive designs
   - Build form validation and handling
   - Develop data visualization components

2. **Page Development**

   - Implement Next.js App Router pages
   - Create server and client components
   - Build loading and error states
   - Optimize performance with streaming

3. **API Integration**

   - Integrate with sirius-api via tRPC
   - Handle API errors gracefully
   - Implement optimistic updates
   - Manage loading states

4. **State Management**

   - Use React hooks for local state
   - Implement tRPC queries and mutations
   - Handle form state with React Hook Form
   - Manage global state when needed

5. **UI/UX Implementation**

   - Design intuitive user interfaces
   - Implement accessible components
   - Create responsive layouts
   - Optimize user workflows

6. **Testing & Deployment**
   - Write component tests
   - Test user interactions
   - Deploy in Docker containers
   - Monitor performance metrics
   <!-- END MANUAL SECTION -->

## Technology Stack

<!-- AUTO-GENERATED: dependencies -->
<!-- END AUTO-GENERATED -->

## System Integration

### Architecture Overview

<!-- MANUAL SECTION: architecture -->

**Frontend Architecture:**

```
┌─────────────────────────────────────────┐
│           User Browser                   │
└────────────────┬────────────────────────┘
                 │ HTTP
┌────────────────▼────────────────────────┐
│         sirius-ui (Next.js)             │
│  ┌──────────────────────────────────┐  │
│  │     App Router (Pages)            │  │
│  │  /dashboard  /scanner  /agents    │  │
│  └───────────┬──────────────────────┘  │
│              │                          │
│  ┌───────────▼──────────────────────┐  │
│  │     tRPC Client                   │  │
│  │  Type-safe API calls              │  │
│  └───────────┬──────────────────────┘  │
└──────────────┼──────────────────────────┘
               │ HTTP/tRPC
┌──────────────▼──────────────────────────┐
│      sirius-api (REST API)              │
│  PostgreSQL, RabbitMQ, Valkey           │
└─────────────────────────────────────────┘
```

**Key Integration Points:**

- **sirius-api**: REST API consumed via tRPC
- **PostgreSQL**: Data access via Prisma ORM
- **Real-time Updates**: Polling/SSE for scan progress
<!-- END MANUAL SECTION -->

### Network Configuration

<!-- AUTO-GENERATED: ports -->
<!-- END AUTO-GENERATED -->

## Configuration

<!-- AUTO-GENERATED: config-examples -->
<!-- END AUTO-GENERATED -->

## Development Workflow

<!-- MANUAL SECTION: development-workflow -->

### Container-Based Development

UI development happens in the sirius-ui container:

```bash
# Access container
docker exec -it sirius-ui /bin/sh

# Navigate to project
cd /app

# Start dev server
npm run dev

# Run tests
npm test

# Build production
npm run build
npm start
```

### Key Development Differences

**Development Mode:**

- Server: `localhost:3000`
- API: `localhost:3001`
- Hot reload: Enabled
- React DevTools: Available
- Source maps: Enabled

**Production Mode:**

- Server: Docker network
- API: Internal Docker network
- Hot reload: Disabled
- React DevTools: Disabled
- Source maps: Disabled
- Optimized bundles

### Hot Reload

The sirius-ui directory is mounted:

```yaml
volumes:
  - ./sirius-ui:/app
  - /app/node_modules
  - /app/.next
```

Changes trigger automatic rebuild.

### Testing Strategy

1. **Component Tests**: Test React components
2. **Integration Tests**: Test page interactions
3. **E2E Tests**: Test complete user workflows
4. **Visual Regression**: Test UI consistency
<!-- END MANUAL SECTION -->

## Next.js and React Best Practices

<!-- AUTO-GENERATED: code-patterns -->
<!-- END AUTO-GENERATED -->

## Common Development Tasks

<!-- MANUAL SECTION: common-tasks -->

### Creating a New Page

1. Create page in `src/app/` directory
2. Define page component (server or client)
3. Add loading.tsx for loading state
4. Add error.tsx for error boundary
5. Update navigation if needed

### Creating a Component

1. Create component in `src/components/`
2. Define props interface with TypeScript
3. Implement component logic
4. Add styles with Tailwind CSS
5. Export component

### Adding tRPC Endpoint

1. Define procedure in `src/server/api/routers/`
2. Add router to `src/server/api/root.ts`
3. Use in component with `api.router.procedure.useQuery()`
4. Handle loading and error states

### Styling Components

```tsx
// Use Tailwind CSS classes
<div className="flex items-center gap-4 p-4 bg-gray-100 rounded-lg">
  <h2 className="text-xl font-bold text-gray-900">Title</h2>
</div>;

// Use shadcn/ui components
import { Button } from "~/components/ui/button";
<Button variant="default" size="lg">
  Click Me
</Button>;
```

### Form Handling

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1),
});

const { register, handleSubmit } = useForm({
  resolver: zodResolver(schema),
});
```

<!-- END MANUAL SECTION -->

## Troubleshooting

<!-- AUTO-GENERATED: troubleshooting -->
<!-- END AUTO-GENERATED -->

## Best Practices

<!-- MANUAL SECTION: best-practices -->

### Component Design

**✅ DO:**

- Use TypeScript for type safety
- Keep components small and focused
- Use composition over inheritance
- Implement proper prop types
- Extract reusable logic to hooks
- Use server components when possible

**❌ DON'T:**

- Use `any` type
- Create god components
- Prop drill excessively
- Skip type definitions
- Repeat logic across components
- Use client components unnecessarily

### State Management

**✅ DO:**

- Use server state for API data (tRPC)
- Use local state for UI state
- Implement optimistic updates
- Handle loading and error states
- Use React Hook Form for forms
- Cache data appropriately

**❌ DON'T:**

- Store API data in local state
- Ignore loading states
- Skip error handling
- Manage form state manually
- Over-fetch data
- Clear cache unnecessarily

### Performance

**✅ DO:**

- Use server components by default
- Implement code splitting
- Optimize images with Next.js Image
- Use React.memo for expensive renders
- Implement virtualization for long lists
- Monitor bundle size

**❌ DON'T:**

- Use client components everywhere
- Load everything upfront
- Use regular img tags
- Re-render unnecessarily
- Render huge lists without virtualization
- Ignore performance metrics

### Styling

**✅ DO:**

- Use Tailwind CSS utilities
- Follow design system
- Implement responsive design
- Use shadcn/ui components
- Create consistent spacing
- Test on multiple devices

**❌ DON'T:**

- Use inline styles
- Create custom CSS unnecessarily
- Ignore mobile layouts
- Reinvent UI components
- Use arbitrary values excessively
- Skip cross-browser testing

### Accessibility

**✅ DO:**

- Use semantic HTML
- Add ARIA labels
- Implement keyboard navigation
- Ensure color contrast
- Test with screen readers
- Follow WCAG guidelines

**❌ DON'T:**

- Use divs for everything
- Skip alt text on images
- Ignore keyboard users
- Use poor color contrast
- Skip accessibility testing
- Ignore focus indicators

### Error Handling

**✅ DO:**

- Show user-friendly error messages
- Implement error boundaries
- Log errors for debugging
- Provide fallback UI
- Handle network errors
- Add retry mechanisms

**❌ DON'T:**

- Show raw error messages
- Let errors crash the app
- Ignore errors silently
- Show blank screens
- Assume network always works
- Give up after one failure
<!-- END MANUAL SECTION -->

## Testing Checklist

<!-- MANUAL SECTION: testing -->

### Before Committing

- [ ] All component tests pass: `npm test`
- [ ] No TypeScript errors: `npm run type-check`
- [ ] No linting errors: `npm run lint`
- [ ] Code formatted: `npm run format`
- [ ] Build succeeds: `npm run build`
- [ ] No console errors in browser
- [ ] Responsive design works

### Before Deploying

- [ ] E2E tests pass
- [ ] Production build works
- [ ] Performance metrics acceptable
- [ ] Images optimized
- [ ] Bundle size reasonable
- [ ] Accessibility checks pass
- [ ] Cross-browser testing done
- [ ] Mobile testing complete
<!-- END MANUAL SECTION -->

## Quick Reference

<!-- MANUAL SECTION: quick-reference -->

### Essential Commands

```bash
# Development
docker exec -it sirius-ui /bin/sh
cd /app
npm run dev

# Testing
npm test
npm run test:watch
npm run test:coverage

# Building
npm run build
npm start

# Linting
npm run lint
npm run type-check
npm run format

# Database
npx prisma studio
npx prisma generate
npx prisma db push
```

### Key Files

- `src/app/` - Next.js App Router pages
- `src/components/` - React components
- `src/server/api/` - tRPC API routes
- `src/styles/` - Global styles
- `prisma/schema.prisma` - Database schema
- `tailwind.config.ts` - Tailwind configuration
- `.env` - Environment variables

### Project Structure

```
sirius-ui/
├── src/
│   ├── app/              # Next.js pages
│   │   ├── dashboard/
│   │   ├── scanner/
│   │   └── agents/
│   ├── components/       # React components
│   │   ├── ui/           # shadcn components
│   │   ├── scanner/
│   │   └── dashboard/
│   ├── server/
│   │   └── api/          # tRPC routers
│   ├── hooks/            # Custom hooks
│   ├── types/            # TypeScript types
│   └── utils/            # Utilities
├── public/               # Static assets
└── prisma/               # Database schema
```

### Environment Variables

```bash
# Database
DATABASE_URL="postgresql://..."

# API
NEXT_PUBLIC_API_URL=http://localhost:3001

# Node
NODE_ENV=development
```

<!-- END MANUAL SECTION -->

---

**Last Updated:** 2025-10-25  
**Version:** 1.0.0  
**Maintainer:** Sirius Team
