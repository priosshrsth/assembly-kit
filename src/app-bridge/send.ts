import { DASHBOARD_DOMAINS } from "src/app-bridge/constants";
import { ensureHttps } from "src/app-bridge/ensure-https";
import type { AppBridgePayload } from "src/app-bridge/types";

/**
 * Sends a postMessage payload to the Assembly dashboard parent frame.
 *
 * - If `portalUrl` is provided, posts only to that exact origin.
 * - Otherwise, fans out to all known `DASHBOARD_DOMAINS`.
 * - Safe to call server-side — no-op when `window` is undefined (SSR/edge).
 *
 * @param {AppBridgePayload} payload - The typed app-bridge message to send.
 * @param {string} [portalUrl] - Optional specific origin to target instead of all dashboard domains.
 */
export const sendToParent = (
  payload: AppBridgePayload,
  portalUrl?: string
): void => {
  if (typeof window === "undefined") {
    return;
  }

  if (portalUrl) {
    window.parent.postMessage(payload, ensureHttps(portalUrl));
    return;
  }

  for (const domain of DASHBOARD_DOMAINS) {
    window.parent.postMessage(payload, domain);
  }
};
