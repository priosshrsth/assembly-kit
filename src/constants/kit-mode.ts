/**
 * App mode for `createAssemblyKit()`.
 *
 * - `"local"` — regular custom apps built for specific workspaces. `workspaceId` is required, `token` is optional.
 * - `"marketplace"` — marketplace apps installable by any consumer. Either `token` or `workspaceId` is required.
 */
export const KitMode = {
  Local: "local",
  Marketplace: "marketplace",
} as const;

export type KitMode = (typeof KitMode)[keyof typeof KitMode];
