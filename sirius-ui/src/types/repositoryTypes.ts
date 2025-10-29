// Repository Management Types

export type RepositoryStatus = "synced" | "syncing" | "error" | "never_synced";
export type SyncStatusType = "syncing" | "completed" | "failed";

export interface Repository {
  id: string;
  name: string;
  url: string;
  branch: string;
  priority: number;
  enabled: boolean;
  last_sync: string | null;
  template_count: number;
  status: RepositoryStatus;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

export interface SyncStatus {
  status: SyncStatusType;
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

export interface UpdateRepositoryInput extends Partial<AddRepositoryInput> {
  id: string;
}
