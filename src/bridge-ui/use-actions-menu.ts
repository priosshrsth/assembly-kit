import { useEffect } from "react";
import { sendToParent } from "src/app-bridge/send";
import type {
  ActionItem,
  ActionsMenuPayload,
  BridgeOpts,
} from "src/app-bridge/types";

/**
 * Registers an actions menu in the Assembly dashboard header.
 *
 * Sends a `header.actionsMenu` postMessage to the parent frame with the
 * provided menu items. Each item's `onClick` is a string event type identifier
 * that the dashboard uses internally to handle clicks — the hook does not
 * listen for inbound click events. When the component unmounts or the page
 * unloads, the menu is automatically cleared.
 *
 * @param {ActionItem[]} items - Array of menu items with labels, icons, and click event types.
 * @param {BridgeOpts} [opts] - Optional portal URL and visibility toggle.
 */
export const useActionsMenu = (
  items: ActionItem[],
  opts?: BridgeOpts
): void => {
  const { portalUrl, show = true } = opts ?? {};

  useEffect(() => {
    const payload: ActionsMenuPayload = {
      items: show ? items : [],
      type: "header.actionsMenu",
    };

    sendToParent(payload, portalUrl);
  }, [items, portalUrl, show]);

  useEffect(() => {
    const handleUnload = (): void => {
      sendToParent({ items: [], type: "header.actionsMenu" }, portalUrl);
    };

    addEventListener("beforeunload", handleUnload);

    return () => {
      removeEventListener("beforeunload", handleUnload);
    };
  }, [portalUrl]);
};
