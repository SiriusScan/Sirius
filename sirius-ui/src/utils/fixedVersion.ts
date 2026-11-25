/**
 * Finds the version that fixes a vulnerability, when the advisory text names
 * one. NVD descriptions usually do, in a few stock phrasings:
 *   "Users are recommended to upgrade to version 2.4.68, which fixes the issue."
 *   "sshd in OpenSSH before 9.8 ..."            → fixed in 9.8
 *   "This issue is fixed in 1.2.3" / "patched in 1.2.3"
 * Explicit fix statements win over "before X" ranges. Returns null when the
 * text names no fixed version; callers then keep the generic guidance.
 */

export interface FixedVersion {
  /** The first version that is not affected, e.g. "2.4.68". */
  version: string;
  /** Product named next to the version, when the text names one. */
  product?: string;
  /** The sentence the version was taken from, for display as evidence. */
  evidence: string;
}

const VERSION = String.raw`(\d+(?:\.\d+)+(?:[a-z]\d*|-\w+)?|\d+p\d+)`;
const PRODUCT = String.raw`([A-Z][\w.+-]*(?:\s+[A-Z][\w.+-]*){0,3})`;

const EXPLICIT: RegExp[] = [
  new RegExp(String.raw`upgrad(?:e|ing) to (?:version |release )?${VERSION}`, "i"),
  new RegExp(String.raw`(?:is |are |was |been )?(?:fixed|patched|resolved|addressed) in (?:version |release )?${VERSION}`, "i"),
];

const BEFORE = new RegExp(
  String.raw`(?:${PRODUCT}\s+)?(?:versions?\s+)?(?:before|prior to|earlier than)\s+(?:version\s+)?${VERSION}`,
);

function sentenceAround(text: string, index: number): string {
  const start = Math.max(text.lastIndexOf(". ", index) + 2, 0);
  const endDot = text.indexOf(". ", index);
  const end = endDot === -1 ? text.length : endDot + 1;
  return text.slice(start, end).trim();
}

function trimVersion(version: string): string {
  return version.replace(/[.,;:)]+$/, "");
}

function cleanProduct(product: string | undefined): string | undefined {
  const cleaned = product?.replace(/^(?:In|The|An?|For|Of|This|Affected)\s+/, "").trim();
  return cleaned && !/^(?:Versions?|Before|Prior|Users?|This|It)$/i.test(cleaned) ? cleaned : undefined;
}

function productNear(text: string): string | undefined {
  const match = new RegExp(
    String.raw`(?:in|of|for|affects)\s+${PRODUCT}:?\s+(?:\d|versions?|before|prior|through|from|with|on)`,
  ).exec(text);
  return cleanProduct(match?.[1]);
}

export function findFixedVersion(description: string | undefined | null): FixedVersion | null {
  const text = (description ?? "").replace(/\s+/g, " ").trim();
  if (!text) return null;

  for (const pattern of EXPLICIT) {
    const match = pattern.exec(text);
    if (match?.[1]) {
      return {
        version: trimVersion(match[1]),
        product: productNear(text),
        evidence: sentenceAround(text, match.index),
      };
    }
  }

  const before = BEFORE.exec(text);
  if (before?.[2]) {
    const product = cleanProduct(before[1]) ?? productNear(text);
    return {
      version: trimVersion(before[2]),
      product,
      evidence: sentenceAround(text, before.index),
    };
  }
  return null;
}
