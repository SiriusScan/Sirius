// Target Parser Utility
// Handles parsing, validation, and expansion of scan targets

export interface ParsedTarget {
  id: string;
  raw: string;
  type: "ip" | "cidr" | "range" | "domain";
  value: string;
  isValid: boolean;
  error?: string;
  warning?: string;
  hostCount?: number;
}

export interface ValidationResult {
  isValid: boolean;
  type?: "ip" | "cidr" | "range" | "domain";
  error?: string;
  warning?: string;
  hostCount?: number;
}

// RFC1918 Private IP ranges
const PRIVATE_RANGES = [
  { start: "10.0.0.0", end: "10.255.255.255", cidr: "10.0.0.0/8" },
  { start: "172.16.0.0", end: "172.31.255.255", cidr: "172.16.0.0/12" },
  { start: "192.168.0.0", end: "192.168.255.255", cidr: "192.168.0.0/16" },
];

// Reserved IP ranges
const RESERVED_RANGES = [
  { start: "127.0.0.0", end: "127.255.255.255", name: "Loopback" },
  { start: "169.254.0.0", end: "169.254.255.255", name: "Link-local" },
  { start: "224.0.0.0", end: "239.255.255.255", name: "Multicast" },
  { start: "240.0.0.0", end: "255.255.255.255", name: "Reserved" },
];

/**
 * Convert IP address to number for comparison
 */
function ipToNumber(ip: string): number {
  const parts = ip.split(".");
  return parts.reduce(
    (acc, part, i) => acc + parseInt(part) * Math.pow(256, 3 - i),
    0
  );
}

/**
 * Convert number back to IP address
 */
function numberToIp(num: number): string {
  return [
    (num >>> 24) & 255,
    (num >>> 16) & 255,
    (num >>> 8) & 255,
    num & 255,
  ].join(".");
}

/**
 * Check if IP is in a range
 */
function isIpInRange(ip: string, start: string, end: string): boolean {
  const ipNum = ipToNumber(ip);
  const startNum = ipToNumber(start);
  const endNum = ipToNumber(end);
  return ipNum >= startNum && ipNum <= endNum;
}

/**
 * Validate a single IP address
 */
function validateIpAddress(ip: string): ValidationResult {
  const parts = ip.split(".");

  if (parts.length !== 4) {
    return { isValid: false, error: "Invalid IP format" };
  }

  const valid = parts.every((part) => {
    const num = parseInt(part);
    return !isNaN(num) && num >= 0 && num <= 255;
  });

  if (!valid) {
    return { isValid: false, error: "Invalid IP address octets" };
  }

  // Check for reserved ranges
  for (const range of RESERVED_RANGES) {
    if (isIpInRange(ip, range.start, range.end)) {
      return {
        isValid: false,
        error: `IP is in ${range.name} range (not scannable)`,
      };
    }
  }

  // Warn about private IPs
  for (const range of PRIVATE_RANGES) {
    if (isIpInRange(ip, range.start, range.end)) {
      return {
        isValid: true,
        type: "ip",
        warning: `Private IP (${range.cidr})`,
        hostCount: 1,
      };
    }
  }

  return { isValid: true, type: "ip", hostCount: 1 };
}

/**
 * Validate CIDR notation
 */
function validateCIDR(cidr: string): ValidationResult {
  const [ip, maskStr] = cidr.split("/");

  if (!ip || !maskStr) {
    return { isValid: false, error: "Invalid CIDR format" };
  }

  const mask = parseInt(maskStr);
  if (isNaN(mask) || mask < 0 || mask > 32) {
    return { isValid: false, error: "CIDR mask must be between 0 and 32" };
  }

  const ipValidation = validateIpAddress(ip);
  if (!ipValidation.isValid) {
    return ipValidation;
  }

  // Calculate host count
  const hostCount = Math.pow(2, 32 - mask) - 2; // Subtract network and broadcast

  if (hostCount > 65536) {
    return {
      isValid: true,
      type: "cidr",
      warning: `Large range (${hostCount.toLocaleString()} hosts)`,
      hostCount,
    };
  }

  return { isValid: true, type: "cidr", hostCount };
}

/**
 * Normalize an IP range to full START_IP-END_IP format.
 * Supports short notation like "192.168.1.1-10" → "192.168.1.1-192.168.1.10"
 * Also supports "192.168.1.1-192.168.2.10" (already full) unchanged.
 */
export function normalizeRange(range: string): string {
  const dashIndex = range.indexOf("-");
  if (dashIndex === -1) return range;

  const startPart = range.substring(0, dashIndex).trim();
  const endPart = range.substring(dashIndex + 1).trim();

  // If end part is already a full IP (contains dots), return as-is
  if (endPart.includes(".")) {
    return `${startPart}-${endPart}`;
  }

  // Short notation: end part is just the last octet(s)
  // e.g. "192.168.1.1-10" → startPart="192.168.1.1", endPart="10"
  const startOctets = startPart.split(".");
  if (startOctets.length !== 4) return range; // Can't normalize if start isn't valid

  const endOctetCount = endPart.split(".").length;
  // Replace the last N octets of the start IP with the end part
  const prefix = startOctets.slice(0, 4 - endOctetCount).join(".");
  const fullEnd = `${prefix}.${endPart}`;

  return `${startPart}-${fullEnd}`;
}

/**
 * Validate IP range
 */
function validateRange(range: string): ValidationResult {
  // Normalize short notation (e.g. 192.168.1.1-10 → 192.168.1.1-192.168.1.10)
  const normalized = normalizeRange(range);
  const [startIp, endIp] = normalized.split("-");

  if (!startIp || !endIp) {
    return { isValid: false, error: "Invalid range format" };
  }

  const startValidation = validateIpAddress(startIp.trim());
  if (!startValidation.isValid) {
    return { isValid: false, error: `Start IP: ${startValidation.error}` };
  }

  const endValidation = validateIpAddress(endIp.trim());
  if (!endValidation.isValid) {
    return { isValid: false, error: `End IP: ${endValidation.error}` };
  }

  const startNum = ipToNumber(startIp.trim());
  const endNum = ipToNumber(endIp.trim());

  if (startNum > endNum) {
    return { isValid: false, error: "Start IP must be less than end IP" };
  }

  const hostCount = endNum - startNum + 1;

  if (hostCount > 65536) {
    return {
      isValid: true,
      type: "range",
      warning: `Large range (${hostCount.toLocaleString()} hosts)`,
      hostCount,
    };
  }

  return { isValid: true, type: "range", hostCount };
}

/**
 * Validate domain name
 */
function validateDomain(domain: string): ValidationResult {
  // Basic domain validation
  const domainPattern =
    /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?(?:\.[a-zA-Z]{2,})+$/;

  if (!domainPattern.test(domain)) {
    return { isValid: false, error: "Invalid domain format" };
  }

  // Check for wildcard
  if (domain.startsWith("*.")) {
    return {
      isValid: true,
      type: "domain",
      warning: "Wildcard domain (may resolve to multiple IPs)",
      hostCount: 1,
    };
  }

  return { isValid: true, type: "domain", hostCount: 1 };
}

/**
 * Validate a single target string
 */
export function validateTarget(target: string): ValidationResult {
  const trimmed = target.trim();

  if (!trimmed) {
    return { isValid: false, error: "Empty target" };
  }

  // Try to detect type and validate
  if (trimmed.includes("/")) {
    return validateCIDR(trimmed);
  } else if (trimmed.includes("-") && /^\d/.test(trimmed)) {
    return validateRange(trimmed);
  } else if (/^\d+\.\d+\.\d+\.\d+$/.test(trimmed)) {
    return validateIpAddress(trimmed);
  } else {
    return validateDomain(trimmed);
  }
}

/**
 * Parse multiple targets from text input
 */
export function parseTargets(input: string): ParsedTarget[] {
  const lines = input.split("\n").filter((line) => line.trim());
  const targets: ParsedTarget[] = [];

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) return;

    // Handle comma-separated targets on one line
    const parts = trimmed.split(",").filter((p) => p.trim());

    parts.forEach((part) => {
      const trimmed = part.trim();
      const validation = validateTarget(trimmed);

      // For ranges, normalize short notation so the stored value is always
      // in full START_IP-END_IP format (required by the backend scanner)
      const normalizedValue =
        validation.type === "range" ? normalizeRange(trimmed) : trimmed;

      const target: ParsedTarget = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        raw: trimmed,
        value: normalizedValue,
        type: validation.type || "ip",
        isValid: validation.isValid,
        error: validation.error,
        warning: validation.warning,
        hostCount: validation.hostCount,
      };
      targets.push(target);
    });
  });

  return targets;
}

/**
 * Expand CIDR notation to individual IPs
 */
export function expandCIDR(cidr: string): string[] {
  const [ip, maskStr] = cidr.split("/");
  if (!ip || !maskStr) return [];

  const mask = parseInt(maskStr);
  const ipNum = ipToNumber(ip);
  const hostCount = Math.pow(2, 32 - mask);
  const networkAddress = ipNum & (0xffffffff << (32 - mask));

  const ips: string[] = [];

  // Skip network address (first) and broadcast (last)
  for (let i = 1; i < hostCount - 1; i++) {
    ips.push(numberToIp(networkAddress + i));
  }

  return ips;
}

/**
 * Expand IP range to individual IPs
 * Supports short notation (e.g. "192.168.1.1-10")
 */
export function expandRange(range: string): string[] {
  const normalized = normalizeRange(range);
  const [startIp, endIp] = normalized.split("-");
  if (!startIp || !endIp) return [];

  const startNum = ipToNumber(startIp.trim());
  const endNum = ipToNumber(endIp.trim());

  const ips: string[] = [];
  for (let i = startNum; i <= endNum; i++) {
    ips.push(numberToIp(i));
  }

  return ips;
}

/**
 * Detect and merge duplicate targets
 */
export function detectDuplicates(targets: ParsedTarget[]): ParsedTarget[] {
  const seen = new Map<string, ParsedTarget>();
  const result: ParsedTarget[] = [];

  targets.forEach((target) => {
    const key = `${target.type}:${target.value}`;

    if (seen.has(key)) {
      // Mark as duplicate
      result.push({
        ...target,
        isValid: false,
        warning: "Duplicate target (will be ignored)",
      });
    } else {
      seen.set(key, target);
      result.push(target);
    }
  });

  return result;
}

/**
 * Calculate total host count from parsed targets
 */
export function calculateTotalHosts(targets: ParsedTarget[]): number {
  return targets
    .filter((t) => t.isValid)
    .reduce((sum, t) => sum + (t.hostCount || 0), 0);
}

/**
 * Get summary statistics
 */
export function getTargetStats(targets: ParsedTarget[]) {
  const valid = targets.filter((t) => t.isValid);
  const invalid = targets.filter((t) => !t.isValid && t.error);
  const warnings = targets.filter((t) => t.warning);

  const byType = {
    ip: valid.filter((t) => t.type === "ip").length,
    cidr: valid.filter((t) => t.type === "cidr").length,
    range: valid.filter((t) => t.type === "range").length,
    domain: valid.filter((t) => t.type === "domain").length,
  };

  return {
    total: targets.length,
    valid: valid.length,
    invalid: invalid.length,
    warnings: warnings.length,
    byType,
    totalHosts: calculateTotalHosts(targets),
  };
}

