import { useEffect } from "react";
import { sendToParent } from "src/app-bridge/send";
import type {
  BridgeOpts,
  CtaConfig,
  SecondaryCtaPayload,
} from "src/app-bridge/types";

/**
 * Registers a secondary CTA button in the Assembly dashboard header.
 *
 * Sends a `header.secondaryCta` postMessage to the parent frame and listens
 * for click events. When the component unmounts or the page unloads, the
 * slot is automatically cleared.
 *
 * @param {CtaConfig} cta - Label, icon, and click handler for the secondary CTA.
 * @param {BridgeOpts} [opts] - Optional portal URL and visibility toggle.
 */
export const useSecondaryCta = (cta: CtaConfig, opts?: BridgeOpts): void => {
  useEffect(() => {
    const show = opts?.show ?? true;

    const payload: SecondaryCtaPayload = {
      icon: show ? cta.icon : undefined,
      label: show ? cta.label : undefined,
      onClick: show ? "header.secondaryCta.onClick" : undefined,
      type: "header.secondaryCta",
    };

    sendToParent(payload, opts?.portalUrl);

    const handleMessage = (event: MessageEvent): void => {
      if (
        event.data.type === "header.secondaryCta.onClick" &&
        typeof event.data.id === "string" &&
        cta.onClick
      ) {
        cta.onClick();
      }
    };

    addEventListener("message", handleMessage);

    return () => {
      removeEventListener("message", handleMessage);
    };
  }, [cta, opts?.portalUrl, opts?.show]);

  useEffect(() => {
    const handleUnload = (): void => {
      sendToParent({ type: "header.secondaryCta" }, opts?.portalUrl);
    };

    addEventListener("beforeunload", handleUnload);

    return () => {
      removeEventListener("beforeunload", handleUnload);
    };
  }, [opts?.portalUrl]);
};
