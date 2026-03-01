import { useEffect } from "react";
import { sendToParent } from "src/app-bridge/send";
import type {
  BridgeOpts,
  CtaConfig,
  PrimaryCtaPayload,
} from "src/app-bridge/types";

/**
 * Registers a primary CTA button in the Assembly dashboard header.
 *
 * Sends a `header.primaryCta` postMessage to the parent frame and listens
 * for click events. When the component unmounts or the page unloads, the
 * slot is automatically cleared.
 *
 * @param {CtaConfig} cta - Label, icon, and click handler for the primary CTA.
 * @param {BridgeOpts} [opts] - Optional portal URL and visibility toggle.
 */
export const usePrimaryCta = (cta: CtaConfig, opts?: BridgeOpts): void => {
  useEffect(() => {
    const show = opts?.show ?? true;

    const payload: PrimaryCtaPayload = {
      icon: show ? cta.icon : undefined,
      label: show ? cta.label : undefined,
      onClick: show ? "header.primaryCta.onClick" : undefined,
      type: "header.primaryCta",
    };

    sendToParent(payload, opts?.portalUrl);

    const handleMessage = (event: MessageEvent): void => {
      if (
        event.data.type === "header.primaryCta.onClick" &&
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
      sendToParent({ type: "header.primaryCta" }, opts?.portalUrl);
    };

    addEventListener("beforeunload", handleUnload);

    return () => {
      removeEventListener("beforeunload", handleUnload);
    };
  }, [opts?.portalUrl]);
};
