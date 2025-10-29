# Repository Management System Specification

## Overview

The Repository Management System allows operators to manage multiple GitHub repositories containing agent templates. This enables centralized control over template sources and multi-organization support.

## Current State

**Backend:** Single hardcoded repository: `https://github.com/SiriusScan/sirius-agent-modules`
**Frontend:** No repository management UI

## Requirements

### Backend API Endpoints

#### 1. List Repositories

- **Endpoint:** `GET /api/repositories`
- **Response:**

```json
{
  "repositories": [
    {
      "id": "uuid",
      "name": "Sirius Official",
      "url": "https://github.com/SiriusScan/sirius-agent-modules",
      "branch": "main",
      "priority": 1,
      "enabled": true,
      "last_sync": "2025-01-15T10:30:00Z",
      "template_count": 42,
      "status": "synced|syncing|error",
      "error_message": null,
      "created_at": "2025-01-01T00:00:00Z",
      "updated_at": "2025-01-15T10:30:00Z"
    }
  ]
}
```

#### 2. Add Repository

- **Endpoint:** `POST /api/repositories`
- **Request:**

```json
{
  "name": "Custom Templates",
  "url": "https://github.com/myorg/custom-templates",
  "branch": "main",
  "priority": 2,
  "enabled": true
}
```

- **Response:** Repository object with ID

#### 3. Update Repository

- **Endpoint:** `PUT /api/repositories/:id`
- **Request:** Same as add (partial updates allowed)
- **Response:** Updated repository object

#### 4. Delete Repository

- **Endpoint:** `DELETE /api/repositories/:id`
- **Response:** `{"success": true}`

#### 5. Sync Repository

- **Endpoint:** `POST /api/repositories/:id/sync`
- **Response:**

```json
{
  "status": "syncing",
  "message": "Sync started",
  "job_id": "sync-uuid"
}
```

#### 6. Get Sync Status

- **Endpoint:** `GET /api/repositories/:id/sync-status`
- **Response:**

```json
{
  "status": "syncing|completed|failed",
  "progress": 75,
  "templates_processed": 30,
  "templates_total": 40,
  "error_message": null,
  "started_at": "2025-01-15T10:30:00Z",
  "completed_at": null
}
```

### Data Storage

**Valkey Keys:**

- `sirius:repositories:list` - JSON array of repository configs
- `sirius:repository:{id}` - Individual repository object
- `sirius:sync:{id}` - Sync status/progress

### Backend Implementation Plan

1. **Create repository handler** (`sirius-api/handlers/repository_handler.go`)

   - `GetRepositories()`
   - `AddRepository()`
   - `UpdateRepository()`
   - `DeleteRepository()`
   - `SyncRepository()`
   - `GetSyncStatus()`

2. **Update main.go** to register repository routes

3. **Update ServerTemplateManager** to support multiple repos
   - Loop through enabled repositories during sync
   - Handle priority/precedence for duplicate template IDs
   - Track per-repository sync status

### Frontend Implementation

#### 1. tRPC Router

**File:** `sirius-ui/src/server/api/routers/repositories.ts`

```typescript
export const repositoriesRouter = createTRPCRouter({
  list: publicProcedure.query(async () => {
    /* ... */
  }),
  add: publicProcedure.input(addRepoSchema).mutation(async ({ input }) => {
    /* ... */
  }),
  update: publicProcedure
    .input(updateRepoSchema)
    .mutation(async ({ input }) => {
      /* ... */
    }),
  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      /* ... */
    }),
  sync: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      /* ... */
    }),
  getSyncStatus: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      /* ... */
    }),
});
```

#### 2. TypeScript Types

**File:** `sirius-ui/src/types/repositoryTypes.ts`

```typescript
export interface Repository {
  id: string;
  name: string;
  url: string;
  branch: string;
  priority: number;
  enabled: boolean;
  last_sync: string | null;
  template_count: number;
  status: "synced" | "syncing" | "error" | "never_synced";
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

export interface SyncStatus {
  status: "syncing" | "completed" | "failed";
  progress: number;
  templates_processed: number;
  templates_total: number;
  error_message: string | null;
  started_at: string;
  completed_at: string | null;
}

export interface AddRepositoryInput {
  name: string;
  url: string;
  branch: string;
  priority: number;
  enabled: boolean;
}
```

#### 3. Repositories Tab Component

**File:** `sirius-ui/src/components/scanner/repositories/RepositoriesTab.tsx`

**Features:**

- Table of repositories with columns: Name, URL, Status, Template Count, Last Sync, Actions
- Add Repository button → Modal/Form
- Actions: Sync Now, Edit, Delete, Enable/Disable toggle
- Real-time sync progress indicators
- Error states with messages

**Layout:**

```
┌─────────────────────────────────────────────────┐
│  Repositories                    [+ Add Repo]   │
├─────────────────────────────────────────────────┤
│ Name           │ URL             │ Status │ ... │
├─────────────────────────────────────────────────┤
│ Sirius Official│ github.com/...  │ ✓ Synced    │
│ Custom         │ github.com/...  │ ⏳ Syncing  │
└─────────────────────────────────────────────────┘
```

#### 4. Add to Navigation

Update `AgentTemplatesTab.tsx` to include Repositories tab:

```typescript
<TabsList>
  <TabsTrigger value="templates">Templates</TabsTrigger>
  <TabsTrigger value="repositories">Repositories</TabsTrigger>
  <TabsTrigger value="settings">Settings</TabsTrigger>
</TabsList>
```

### Priority System

When multiple repositories contain the same template ID:

1. **Higher priority number wins** (priority: 1 > priority: 2)
2. Within same priority, **first repository wins**
3. Custom templates (type: "custom") **always override** repository templates

### Validation Rules

- URL must be valid GitHub repository URL
- Name must be unique
- Priority must be positive integer
- Branch must be valid git branch name

### Error Handling

- **Network errors:** Show retry option, don't disable repo
- **Invalid templates:** Log, skip, continue with others
- **Sync conflicts:** Use priority system to resolve
- **Missing manifest:** Show error, allow manual fix

## Implementation Order

1. ✅ Backend API endpoints (repository_handler.go)
2. ✅ Update ServerTemplateManager for multi-repo support
3. ✅ Create tRPC router (repositories.ts)
4. ✅ Create TypeScript types (repositoryTypes.ts)
5. ✅ Create RepositoriesTab component
6. ✅ Add to AgentTemplatesTab navigation
7. ✅ End-to-end testing

## Testing Checklist

- [ ] Add repository with valid GitHub URL
- [ ] Add repository with invalid URL (should error)
- [ ] Sync repository successfully
- [ ] View sync progress in real-time
- [ ] Handle sync errors gracefully
- [ ] Update repository priority
- [ ] Enable/disable repository
- [ ] Delete repository
- [ ] Verify template precedence with multiple repos
- [ ] Test with empty repositories
- [ ] Test with large repositories (100+ templates)

## Future Enhancements

- Private repository support (authentication)
- Custom branch selection per repo
- Webhook-based auto-sync
- Repository health monitoring
- Template diff view between syncs
- Rollback to previous sync state
