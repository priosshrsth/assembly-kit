import { DASHBOARD_DOMAINS } from "src/app-bridge/constants";
import { ensureHttps } from "src/app-bridge/ensure-https";

/**
 * Checks whether a postMessage event origin is from an allowed Assembly domain.
 *
 * When `portalUrl` is provided, only that exact origin (after HTTPS upgrade) is
 * allowed. Otherwise, the origin must match one of the known `DASHBOARD_DOMAINS`.
 *
 * @param {string} origin - The origin from the MessageEvent.
 * @param {string} [portalUrl] - Optional portal URL to restrict allowed origins.
 * @returns {boolean} Whether the origin is trusted.
 */
export const isAllowedOrigin = (
  origin: string,
  portalUrl?: string
): boolean => {
  if (portalUrl) {
    return origin === ensureHttps(portalUrl);
  }

  return (DASHBOARD_DOMAINS as readonly string[]).includes(origin);
};
