import { AssemblyBridge } from "@assembly-js/app-bridge";
import type { CtaConfig } from "@assembly-js/app-bridge";
import { useEffect } from "react";

/**
 * Registers a primary CTA button in the Assembly dashboard header.
 *
 * Uses `AssemblyBridge.header.setPrimaryCta()` to set the button and
 * automatically clears it on unmount or page unload.
 *
 * @param cta - Label, icon, and click handler for the primary CTA.
 * @param show - Whether the CTA is visible. Defaults to true.
 */
export const usePrimaryCta = (cta: CtaConfig, show = true): void => {
  useEffect(() => {
    if (show) {
      AssemblyBridge.header.setPrimaryCta(cta);
    } else {
      AssemblyBridge.header.setPrimaryCta(null);
    }

    return () => {
      AssemblyBridge.header.setPrimaryCta(null);
    };
  }, [cta, show]);

  useEffect(() => {
    const handleUnload = (): void => {
      AssemblyBridge.header.setPrimaryCta(null);
    };

    addEventListener("beforeunload", handleUnload);

    return () => {
      removeEventListener("beforeunload", handleUnload);
    };
  }, []);
};
