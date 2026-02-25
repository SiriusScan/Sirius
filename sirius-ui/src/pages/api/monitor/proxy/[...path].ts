import type { NextApiRequest, NextApiResponse } from "next";
import { env } from "~/env.mjs";
import { getServerAuthSession } from "~/server/auth";

const ALLOWED_PREFIXES = [
  "/api/v1/system/",
  "/api/v1/logs",
  "/api/v1/admin/command",
  "/api/v1/performance/metrics",
];

function isAllowedPath(pathname: string): boolean {
  return ALLOWED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerAuthSession({ req, res });
  if (!session?.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const segments = req.query.path;
  const pathSegments = Array.isArray(segments) ? segments : [];
  const pathname = `/${pathSegments.join("/")}`;

  if (!isAllowedPath(pathname)) {
    return res.status(403).json({ error: "Forbidden path" });
  }

  const upstreamBase = env.SIRIUS_API_URL || "http://sirius-api:9001";
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(req.query)) {
    if (key === "path") continue;
    if (Array.isArray(value)) {
      for (const v of value) query.append(key, v);
    } else if (typeof value === "string") {
      query.append(key, value);
    }
  }

  const upstreamUrl =
    query.toString().length > 0
      ? `${upstreamBase}${pathname}?${query.toString()}`
      : `${upstreamBase}${pathname}`;

  const headers: Record<string, string> = {
    "X-API-Key": env.SIRIUS_API_KEY,
  };

  if (req.headers["content-type"]) {
    headers["Content-Type"] = req.headers["content-type"];
  } else {
    headers["Content-Type"] = "application/json";
  }

  const method = req.method || "GET";
  const hasBody = !["GET", "HEAD"].includes(method.toUpperCase());

  try {
    const upstreamResponse = await fetch(upstreamUrl, {
      method,
      headers,
      body: hasBody ? JSON.stringify(req.body ?? {}) : undefined,
    });

    const responseText = await upstreamResponse.text();
    const contentType = upstreamResponse.headers.get("content-type");
    if (contentType) {
      res.setHeader("Content-Type", contentType);
    }

    return res.status(upstreamResponse.status).send(responseText);
  } catch (error) {
    console.error("Monitor proxy request failed:", error);
    return res.status(502).json({ error: "Upstream monitor API unavailable" });
  }
}
