export enum Icons {
  Archive = "Archive",
  Plus = "Plus",
  Templates = "Templates",
  Trash = "Trash",
  Download = "Download",
  Disconnect = "Disconnect",
}

export interface ActionItem {
  label: string;
  /** Event type identifier sent back from the dashboard on click. */
  onClick: string;
  icon?: Icons;
  color?: string;
}

export interface PrimaryCtaPayload {
  type: "header.primaryCta";
  icon?: Icons;
  label?: string;
  /** Event type the dashboard will emit when the CTA is clicked. */
  onClick?: string;
}

export interface SecondaryCtaPayload {
  type: "header.secondaryCta";
  icon?: Icons;
  label?: string;
  onClick?: string;
}

export interface ActionsMenuPayload {
  type: "header.actionsMenu";
  items: ActionItem[];
}

/** Discriminated union of all supported postMessage payload types. */
export type AppBridgePayload =
  | PrimaryCtaPayload
  | SecondaryCtaPayload
  | ActionsMenuPayload;

/** Configuration for a CTA button (used by React hooks). */
export interface CtaConfig {
  label?: string;
  icon?: Icons;
  /** Called when the dashboard emits a click event for this CTA. */
  onClick?: () => void;
  color?: string;
}

/** Options shared across all app-bridge hooks. */
export interface BridgeOpts {
  /** When provided, restricts postMessage to this exact origin. */
  portalUrl?: string;
  /** When false, clears the slot in the dashboard header. Defaults to true. */
  show?: boolean;
}
