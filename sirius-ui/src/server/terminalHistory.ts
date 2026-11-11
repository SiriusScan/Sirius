import { z } from "zod";

/** Zod schema matching CommandHistoryEntry for validation */
export const CommandHistoryEntrySchema = z.object({
  id: z.string(),
  timestamp: z.string().datetime({ offset: true }),
  command: z.string(),
  target: z.object({
    type: z.enum(["engine", "agent"]),
    id: z.string().optional(),
    name: z.string().optional(),
  }),
  output: z.string(),
  success: z.boolean(),
  durationMs: z.number().optional(),
  multiExec: z
    .object({
      agentCount: z.number(),
      succeeded: z.number(),
      failed: z.number(),
      cancelled: z.number(),
      results: z.array(
        z.object({
          agentId: z.string(),
          agentName: z.string().optional(),
          output: z.string(),
          success: z.boolean(),
        })
      ),
    })
    .optional(),
});

export interface HistoryStore {
  lrange(key: string, start: number, stop: number): Promise<string[]>;
  lrem(key: string, count: number, value: string): Promise<number>;
}

export function parseHistoryEntries(raw: string[]) {
  const entries: z.infer<typeof CommandHistoryEntrySchema>[] = [];
  for (const value of raw) {
    try {
      const parsed = CommandHistoryEntrySchema.safeParse(JSON.parse(value));
      if (parsed.success) entries.push(parsed.data);
    } catch {
      // A damaged entry must not hide the rest of the user's history.
    }
  }
  return entries;
}

/** Remove matching values without rewriting or resurrecting unrelated entries. */
export async function deleteHistoryEntry(
  store: HistoryStore,
  key: string,
  entryId: string
): Promise<void> {
  const raw = await store.lrange(key, 0, -1);
  for (const value of raw) {
    let entry: unknown;
    try {
      entry = JSON.parse(value);
    } catch {
      continue;
    }
    const parsed = z.object({ id: z.string() }).safeParse(entry);
    if (parsed.success && parsed.data.id === entryId) {
      await store.lrem(key, 0, value);
    }
  }
}
