import { AssemblyBridge } from "@assembly-js/app-bridge";
import type { ActionMenuItem } from "@assembly-js/app-bridge";
import { useEffect } from "react";

/**
 * Registers an actions menu in the Assembly dashboard header.
 *
 * Uses `AssemblyBridge.header.setActionsMenu()` to set the menu items and
 * automatically clears them on unmount or page unload.
 *
 * @param items - Array of menu items with labels, icons, and click handlers.
 * @param show - Whether the menu is visible. Defaults to true.
 */
export const useActionsMenu = (items: ActionMenuItem[], show = true): void => {
  useEffect(() => {
    AssemblyBridge.header.setActionsMenu(show ? items : []);

    return () => {
      AssemblyBridge.header.setActionsMenu([]);
    };
  }, [items, show]);

  useEffect(() => {
    const handleUnload = (): void => {
      AssemblyBridge.header.setActionsMenu([]);
    };

    addEventListener("beforeunload", handleUnload);

    return () => {
      removeEventListener("beforeunload", handleUnload);
    };
  }, []);
};
