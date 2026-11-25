/**
 * What an NSE script says about itself, read from its own Lua source:
 * categories (`categories = {"safe", "discovery"}`), the default ports of its
 * port rule (`portrule = shortport.port_or_service(2202, "acarsd", {"tcp"})`),
 * its description and author.
 *
 * The script manifest the scanner syncs records "*" as every repository
 * script's protocol and stores "NSE script for * protocol" as its
 * description, so the library reads these from the code instead. Nothing
 * here guesses: a rule this parser cannot read shows as unknown.
 *
 * Pure and dependency-free so it runs under `npx tsx`.
 */

/** How a script decides where it runs. */
export type NseRuleKind =
  /** A port rule with literal default ports, e.g. 2202/tcp. */
  | "ports"
  /** A port rule that matches services, e.g. shortport.http. */
  | "service"
  /** A port rule that only checks the protocol, e.g. any tcp port. */
  | "any"
  /** No port rule; runs once per host. */
  | "host"
  /** Runs once before the scan. */
  | "prerule"
  /** Runs once after the scan. */
  | "postrule"
  /** A port rule this parser cannot read. */
  | "unknown";

export interface NsePortRule {
  kind: NseRuleKind;
  /** "2202" or a range "27960-27970", in source order, de-duplicated. */
  ports: string[];
  /** "tcp" | "udp" | …, in source order, de-duplicated. */
  protocols: string[];
  /** Service names from the rule, e.g. ["acarsd"] or ["http"]. */
  services: string[];
}

export interface NsePortLabel {
  /** Short cell text: "2202/tcp", "143/tcp, 993/tcp +1", "http", "Per host". */
  label: string;
  /** Full sentence for a hover title. */
  title: string;
  /** True for real port/service values, false for muted placeholders. */
  isPort: boolean;
}

/* ------------------------------------------------------------------ */
/*  Lexing helpers                                                     */
/* ------------------------------------------------------------------ */

/**
 * Removes Lua comments (`-- …` and `--[[ … ]]`) outside of strings. With
 * `maskLongStrings`, long strings (`[[ … ]]`, e.g. the description) become
 * `""` so text inside them can't look like code.
 */
export function stripLuaComments(code: string, maskLongStrings = false): string {
  let out = "";
  let i = 0;
  const n = code.length;
  while (i < n) {
    const ch = code[i]!;
    // Long strings [[ … ]] / [==[ … ]==] are kept as-is.
    if (ch === "[") {
      const m = /^\[(=*)\[/.exec(code.slice(i, i + 12));
      if (m) {
        const close = `]${m[1]}]`;
        const end = code.indexOf(close, i + m[0].length);
        const stop = end === -1 ? n : end + close.length;
        out += maskLongStrings ? '""' : code.slice(i, stop);
        i = stop;
        continue;
      }
    }
    if (ch === '"' || ch === "'") {
      let j = i + 1;
      while (j < n && code[j] !== ch && code[j] !== "\n") {
        if (code[j] === "\\") j++;
        j++;
      }
      out += code.slice(i, j + 1);
      i = j + 1;
      continue;
    }
    if (ch === "-" && code[i + 1] === "-") {
      const m = /^--\[(=*)\[/.exec(code.slice(i, i + 14));
      if (m) {
        const close = `]${m[1]}]`;
        const end = code.indexOf(close, i + m[0].length);
        i = end === -1 ? n : end + close.length;
        continue;
      }
      const eol = code.indexOf("\n", i);
      i = eol === -1 ? n : eol;
      continue;
    }
    out += ch;
    i++;
  }
  return out;
}

/** The text between the bracket at `open` and its match, or null. */
function balanced(text: string, open: number): string | null {
  const pairs: Record<string, string> = { "(": ")", "{": "}", "[": "]" };
  const first = text[open];
  const closer = first ? pairs[first] : undefined;
  if (!closer) return null;
  const stack: string[] = [closer];
  let i = open + 1;
  while (i < text.length) {
    const ch = text[i]!;
    if (ch === '"' || ch === "'") {
      let j = i + 1;
      while (j < text.length && text[j] !== ch) {
        if (text[j] === "\\") j++;
        j++;
      }
      i = j + 1;
      continue;
    }
    const nested = pairs[ch];
    if (nested) stack.push(nested);
    else if (ch === stack[stack.length - 1]) {
      stack.pop();
      if (stack.length === 0) return text.slice(open + 1, i);
    }
    i++;
  }
  return null;
}

/** Splits an argument list on top-level commas. */
function splitArgs(args: string): string[] {
  const out: string[] = [];
  let depth = 0;
  let cur = "";
  for (let i = 0; i < args.length; i++) {
    const ch = args[i]!;
    if (ch === '"' || ch === "'") {
      let j = i + 1;
      while (j < args.length && args[j] !== ch) {
        if (args[j] === "\\") j++;
        j++;
      }
      cur += args.slice(i, j + 1);
      i = j;
      continue;
    }
    if (ch === "(" || ch === "{" || ch === "[") depth++;
    if (ch === ")" || ch === "}" || ch === "]") depth--;
    if (ch === "," && depth === 0) {
      out.push(cur.trim());
      cur = "";
      continue;
    }
    cur += ch;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}

const STRING_RE = /^(["'])(.*)\1$/s;
const NUMBER_RE = /^\d+$/;

/** Literal strings in an argument: "a" or {"a", 'b'}. Null if not literal. */
function literalStrings(arg: string | undefined): string[] | null {
  if (!arg) return null;
  const a = arg.trim();
  const s = STRING_RE.exec(a);
  if (s) return [s[2]!];
  if (a.startsWith("{") && a.endsWith("}")) {
    const inner = splitArgs(a.slice(1, -1));
    const vals: string[] = [];
    for (const part of inner) {
      const m = STRING_RE.exec(part.trim());
      if (!m) return null;
      vals.push(m[2]!);
    }
    return vals;
  }
  return null;
}

/** Literal ports in an argument: 80, {80, 443}, range(a, b). Null if not literal. */
function literalPorts(arg: string | undefined): string[] | null {
  if (!arg) return null;
  const a = arg.trim();
  if (NUMBER_RE.test(a)) return [a];
  const range = /^range\s*\(\s*(\d+)\s*,\s*(\d+)\s*\)$/.exec(a);
  if (range) return [`${range[1]}-${range[2]}`];
  if (a.startsWith("{") && a.endsWith("}")) {
    const inner = splitArgs(a.slice(1, -1)).filter(Boolean);
    const vals: string[] = [];
    for (const part of inner) {
      if (!NUMBER_RE.test(part.trim())) return null;
      vals.push(part.trim());
    }
    return vals;
  }
  return null;
}

function unique(values: readonly string[]): string[] {
  return Array.from(new Set(values.filter(Boolean)));
}

/* ------------------------------------------------------------------ */
/*  Fields                                                             */
/* ------------------------------------------------------------------ */

/** `categories = {"safe", "discovery"}` → ["safe", "discovery"]. */
export function parseNseCategories(code: string | null | undefined): string[] {
  if (!code) return [];
  const clean = stripLuaComments(code, true);
  const m = /^\s*categories\s*=\s*\{/m.exec(clean);
  if (!m) return [];
  const body = balanced(clean, m.index + m[0].length - 1);
  if (body === null) return [];
  return unique(
    Array.from(body.matchAll(/["']([^"']+)["']/g), (x) => x[1]!.trim().toLowerCase()),
  );
}

/** `description = [[ … ]]` (or a quoted string), whitespace collapsed. */
export function parseNseDescription(code: string | null | undefined): string {
  if (!code) return "";
  const long = /^\s*description\s*=\s*\[(=*)\[([\s\S]*?)\]\1\]/m.exec(code);
  const quoted = long ? null : /^\s*description\s*=\s*(["'])((?:\\.|(?!\1).)*)\1/m.exec(code);
  const raw = long?.[2] ?? quoted?.[2] ?? "";
  return raw.replace(/\s+/g, " ").trim();
}

/** `author = "Name"` or `author = {"A", "B"}` → "Name" / "A, B". */
export function parseNseAuthor(code: string | null | undefined): string {
  if (!code) return "";
  const clean = stripLuaComments(code, true);
  const m = /^\s*author\s*=\s*/m.exec(clean);
  if (!m) return "";
  const rest = clean.slice(m.index + m[0].length);
  if (rest.startsWith("{")) {
    const body = balanced(rest, 0);
    if (body === null) return "";
    return Array.from(body.matchAll(/["']([^"']+)["']/g), (x) => x[1]!.trim())
      .filter(Boolean)
      .join(", ");
  }
  const s = /^(["'])((?:\\.|(?!\1).)*)\1/.exec(rest);
  return s ? s[2]!.trim() : "";
}

/** The scanner's stand-in description for repository scripts. */
export function isPlaceholderDescription(text: string | null | undefined): boolean {
  const t = (text ?? "").trim();
  return t === "" || /^NSE script for .* protocol$/i.test(t) || /^No description available\.?$/i.test(t);
}

/** The scanner's stand-in author for repository scripts. */
export function isPlaceholderAuthor(text: string | null | undefined): boolean {
  const t = (text ?? "").trim().toLowerCase();
  return t === "" || t === "system" || t === "unknown";
}

/* ------------------------------------------------------------------ */
/*  Port rule                                                          */
/* ------------------------------------------------------------------ */

const PORT_FNS = ["port_or_service", "version_port_or_service", "portnumber"] as const;
const SERVICE_FNS = ["service"] as const;
/** shortport predicates that stand for a service family. */
const SERVICE_PREDICATES: Record<string, string> = { http: "http", ssl: "ssl", ssh: "ssh" };

interface RuleCall {
  fn: string;
  args: string[];
}

/** shortport calls (and bare predicates) in a region, in source order. */
function findRuleCalls(region: string): RuleCall[] {
  const calls: RuleCall[] = [];
  const re = /(?:shortport|"shortport"\s*\)?)\s*\.\s*([a-z_]+)\b/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(region))) {
    const fn = m[1]!;
    let i = m.index + m[0].length;
    while (i < region.length && /\s/.test(region[i]!)) i++;
    if (region[i] === "(") {
      const body = balanced(region, i);
      calls.push({ fn, args: body === null ? [] : splitArgs(body) });
    } else {
      calls.push({ fn, args: [] });
    }
  }
  return calls;
}

/** The portrule's right-hand side: a function body or one expression. */
function portRuleRegion(clean: string): string | null {
  const m = /^\s*portrule\s*=\s*/m.exec(clean);
  if (!m) return null;
  const start = m.index + m[0].length;
  const rest = clean.slice(start);
  if (/^function\b/.test(rest)) {
    const end = /^end\b/m.exec(rest);
    return end ? rest.slice(0, end.index) : rest;
  }
  // One expression: up to the end of its first call, else the line.
  const eol = rest.indexOf("\n");
  const line = eol === -1 ? rest : rest.slice(0, eol);
  const paren = line.indexOf("(");
  if (paren !== -1) {
    const body = balanced(rest, paren);
    if (body !== null) return rest.slice(0, paren + body.length + 2);
  }
  return line;
}

const EMPTY_RULE = (kind: NseRuleKind): NsePortRule => ({ kind, ports: [], protocols: [], services: [] });

/** Reads where a script runs from its rules. */
export function parseNsePortRule(code: string | null | undefined): NsePortRule {
  if (!code) return EMPTY_RULE("unknown");
  const clean = stripLuaComments(code, true);
  const region = portRuleRegion(clean);

  if (region !== null) {
    const calls = findRuleCalls(region);

    // 1. A call with literal ports.
    for (const call of calls) {
      if (!(PORT_FNS as readonly string[]).includes(call.fn)) continue;
      const ports = literalPorts(call.args[0]);
      if (!ports || ports.length === 0) continue;
      const protoArg = call.fn === "portnumber" ? call.args[1] : call.args[2];
      const services = call.fn === "portnumber" ? [] : literalStrings(call.args[1]) ?? [];
      const protocols = literalStrings(protoArg) ?? ["tcp"];
      return {
        kind: "ports",
        ports: unique(ports),
        protocols: unique(protocols.map((p) => p.toLowerCase())),
        services: unique(services),
      };
    }

    // 2. A service match.
    for (const call of calls) {
      const predicate = SERVICE_PREDICATES[call.fn];
      if (predicate) return { ...EMPTY_RULE("service"), services: [predicate] };
      const isServiceFn = (SERVICE_FNS as readonly string[]).includes(call.fn);
      const isPortFn = (PORT_FNS as readonly string[]).includes(call.fn);
      if (!isServiceFn && !isPortFn) continue;
      const services = literalStrings(isServiceFn ? call.args[0] : call.args[1]);
      if (!services || services.length === 0) continue;
      const protocols = literalStrings(isServiceFn ? call.args[1] : call.args[2]) ?? [];
      return {
        kind: "service",
        ports: [],
        protocols: unique(protocols.map((p) => p.toLowerCase())),
        services: unique(services),
      };
    }

    // 3. Hand-written checks: port.number == 3306, port.protocol == "tcp".
    //    Their port.service checks are often negative ("unknown"), so
    //    services are not reported for these.
    const numbers = unique(Array.from(region.matchAll(/port\.number\s*==\s*(\d+)/g), (x) => x[1]!));
    const protocols = unique(
      Array.from(region.matchAll(/port\.protocol\s*==\s*["'](\w+)["']/g), (x) => x[1]!.toLowerCase()),
    );
    if (numbers.length > 0) {
      return { kind: "ports", ports: numbers, protocols: protocols.length ? protocols : ["tcp"], services: [] };
    }

    // 4. A library's own port rule, e.g. irc.portrule.
    const lib = /^([a-z][a-z0-9_]*)\.portrule\b/.exec(region.trim());
    if (lib && lib[1] !== "shortport") return { ...EMPTY_RULE("service"), services: [lib[1]!] };

    if (protocols.length > 0) return { ...EMPTY_RULE("any"), protocols };
    return EMPTY_RULE("unknown");
  }

  if (/^\s*hostrule\s*=/m.test(clean)) return EMPTY_RULE("host");
  if (/^\s*prerule\s*=/m.test(clean)) return EMPTY_RULE("prerule");
  if (/^\s*postrule\s*=/m.test(clean)) return EMPTY_RULE("postrule");
  return EMPTY_RULE("unknown");
}

/** Text for the Port column and its hover title. */
export function formatNsePortRule(rule: NsePortRule): NsePortLabel {
  switch (rule.kind) {
    case "ports": {
      const entries: string[] = [];
      for (const port of rule.ports) {
        for (const proto of rule.protocols) entries.push(`${port}/${proto}`);
      }
      const shown = entries.slice(0, 2).join(", ");
      const more = entries.length - 2;
      const services = rule.services.length > 0 ? `, or any port running ${rule.services.join(" or ")}` : "";
      return {
        label: more > 0 ? `${shown} +${more}` : shown,
        title: `Default ${entries.length === 1 ? "port" : "ports"} ${entries.join(", ")}${services}`,
        isPort: true,
      };
    }
    case "service": {
      const shown = rule.services.slice(0, 2).join(", ");
      const more = rule.services.length - 2;
      const on = rule.protocols.length > 0 ? ` over ${rule.protocols.join(" or ")}` : "";
      return {
        label: more > 0 ? `${shown} +${more}` : shown,
        title: `Any port running ${rule.services.join(" or ")}${on}`,
        isPort: true,
      };
    }
    case "any":
      return {
        label: `Any ${rule.protocols.join("/")} port`,
        title: `Any open ${rule.protocols.join(" or ")} port`,
        isPort: false,
      };
    case "host":
      return { label: "Per host", title: "Runs once for each host, not per port", isPort: false };
    case "prerule":
      return { label: "Before scan", title: "Runs once before the scan starts", isPort: false };
    case "postrule":
      return { label: "After scan", title: "Runs once after the scan ends", isPort: false };
    default:
      return { label: "—", title: "The script decides in code which ports it runs on", isPort: false };
  }
}

/** Every string a library search should match for this rule. */
export function portRuleSearchTerms(rule: NsePortRule): string[] {
  const terms: string[] = [...rule.services];
  for (const port of rule.ports) {
    terms.push(port);
    for (const proto of rule.protocols) terms.push(`${port}/${proto}`);
  }
  terms.push(...rule.protocols);
  return terms;
}
