import { AssemblyBridge } from "@assembly-js/app-bridge";
import type { CtaConfig } from "@assembly-js/app-bridge";
import { useEffect } from "react";

/**
 * Registers a secondary CTA button in the Assembly dashboard header.
 *
 * Uses `AssemblyBridge.header.setSecondaryCta()` to set the button and
 * automatically clears it on unmount or page unload.
 *
 * @param cta - Label, icon, and click handler for the secondary CTA.
 * @param show - Whether the CTA is visible. Defaults to true.
 */
export const useSecondaryCta = (cta: CtaConfig, show = true): void => {
  useEffect(() => {
    if (show) {
      AssemblyBridge.header.setSecondaryCta(cta);
    } else {
      AssemblyBridge.header.setSecondaryCta(null);
    }

    return () => {
      AssemblyBridge.header.setSecondaryCta(null);
    };
  }, [cta, show]);

  useEffect(() => {
    const handleUnload = (): void => {
      AssemblyBridge.header.setSecondaryCta(null);
    };

    addEventListener("beforeunload", handleUnload);

    return () => {
      removeEventListener("beforeunload", handleUnload);
    };
  }, []);
};
