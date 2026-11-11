export const ALL_NSE_SCRIPTS = "*";

export function canonicalizeScriptId(value: string | null | undefined): string {
  // Match Go templates.CanonicalScriptID: no whitespace trimming, and only
  // the lowercase suffix is removed. A trailing slash has an empty basename.
  const raw = value ?? "";
  if (!raw || raw === ALL_NSE_SCRIPTS) return raw;
  return raw.slice(raw.lastIndexOf("/") + 1).replace(/\.nse$/, "");
}

export function canonicalizeScriptIds(
  values: readonly string[] | null | undefined
): string[] {
  if (!values?.length) return [];

  const seen = new Set<string>();
  const canonicalIds: string[] = [];

  values.forEach((value) => {
    const canonicalId = canonicalizeScriptId(value);
    if (!canonicalId || seen.has(canonicalId)) return;

    seen.add(canonicalId);
    canonicalIds.push(canonicalId);
  });

  return canonicalIds;
}

export function summarizeScriptRefs(
  selectedScriptIds: readonly string[] | null | undefined,
  availableScriptIds: Iterable<string>
): {
  linkedScriptCount: number;
  totalScriptRefs: number;
  missingScriptRefs: number;
  hasWildcard: boolean;
} {
  const availableCanonicalIds = new Set(
    Array.from(availableScriptIds, (id) => canonicalizeScriptId(id)).filter(
      Boolean
    )
  );
  const canonicalSelectedIds = canonicalizeScriptIds(selectedScriptIds);
  const hasWildcard = canonicalSelectedIds.includes(ALL_NSE_SCRIPTS);

  if (hasWildcard) {
    return {
      linkedScriptCount: availableCanonicalIds.size,
      totalScriptRefs: availableCanonicalIds.size,
      missingScriptRefs: 0,
      hasWildcard: true,
    };
  }

  const linkedScriptCount = canonicalSelectedIds.filter((id) =>
    availableCanonicalIds.has(id)
  ).length;
  const totalScriptRefs = canonicalSelectedIds.length;

  return {
    linkedScriptCount,
    totalScriptRefs,
    missingScriptRefs: totalScriptRefs - linkedScriptCount,
    hasWildcard: false,
  };
}
