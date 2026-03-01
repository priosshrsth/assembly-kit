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
 * provided menu items, and listens for click events on each item. When the
 * component unmounts or the page unloads, the menu is automatically cleared.
 *
 * @param {ActionItem[]} items - Array of menu items with labels, icons, and click event types.
 * @param {BridgeOpts} [opts] - Optional portal URL and visibility toggle.
 */
export const useActionsMenu = (
  items: ActionItem[],
  opts?: BridgeOpts
): void => {
  useEffect(() => {
    const show = opts?.show ?? true;

    const payload: ActionsMenuPayload = {
      items: show ? items : [],
      type: "header.actionsMenu",
    };

    sendToParent(payload, opts?.portalUrl);
  }, [items, opts?.portalUrl, opts?.show]);

  useEffect(() => {
    const handleUnload = (): void => {
      sendToParent({ items: [], type: "header.actionsMenu" }, opts?.portalUrl);
    };

    addEventListener("beforeunload", handleUnload);

    return () => {
      removeEventListener("beforeunload", handleUnload);
    };
  }, [opts?.portalUrl]);
};
