import type { LocationRewrite } from "@tanstack/react-router";

/**
 * Path-based preview hosts serve the dev server under `/{port_id}/` and strip
 * that prefix before forwarding, so SSR sees `/` while the browser URL keeps the
 * prefix. TanStack Start resets `basepath` on hydration, so a `rewrite` keeps
 * client routing and generated links aligned with the public URL.
 */
const PATH_BASED_PREVIEW_HOSTS = new Set([
  "preview.grok.genai.mil",
  "preview.grok.mil",
  "preview.grokgsac.com",
]);

const PORT_ID_PREFIX = /^\/hds-[a-z0-9]+-\d+-[a-z0-9]+(?=\/|$)/i;

// GitHub Pages project sites live under /<repo>/ on <user>.github.io, so the
// first path segment is the subpath prefix, same as the preview hosts above.
const GITHUB_PAGES_SEGMENT = /^\/[A-Za-z0-9_.-]+(?=\/|$)/;

export function previewPathPrefix(hostname: string, pathname: string): string | undefined {
  if (hostname.toLowerCase().endsWith(".github.io")) {
    return GITHUB_PAGES_SEGMENT.exec(pathname)?.[0];
  }
  if (!PATH_BASED_PREVIEW_HOSTS.has(hostname.toLowerCase())) return undefined;
  return PORT_ID_PREFIX.exec(pathname)?.[0];
}

export function prefixRewrite(prefix: string): LocationRewrite {
  return {
    input: ({ url }) => {
      if (url.pathname === prefix) url.pathname = "/";
      else if (url.pathname.startsWith(`${prefix}/`))
        url.pathname = url.pathname.slice(prefix.length);
      return url;
    },
    output: ({ url }) => {
      // TanStack Start also sets the router basepath from Vite's base, so
      // the prefix may already be on the URL (e.g. on GitHub Pages). Only
      // add it when it is missing, or the address bar doubles the prefix.
      if (url.pathname !== prefix && !url.pathname.startsWith(`${prefix}/`)) {
        url.pathname = `${prefix}${url.pathname}`;
      }
      return url;
    },
  };
}

export function previewPathRewrite(): LocationRewrite | undefined {
  if (typeof window === "undefined") return undefined;
  const prefix = previewPathPrefix(window.location.hostname, window.location.pathname);
  return prefix ? prefixRewrite(prefix) : undefined;
}
