import { z } from "zod";

/** Membership type shared across message channels, file channels, and app connections. */
export type MembershipType = "company" | "group" | "individual";

export const MembershipTypeSchema: z.ZodType<MembershipType> = z.enum([
  "individual",
  "group",
  "company",
]);
