import type { ZodError } from "zod";

import { AssemblyError } from "@/errors/base.ts";

export class AssemblyResponseParseError extends AssemblyError {
  readonly zodError: ZodError;

  constructor(zodError: ZodError, messageOverride?: string) {
    super(
      messageOverride ??
        "Assembly API response did not match the expected schema",
      500,
      zodError
    );
    this.name = "AssemblyResponseParseError";
    this.zodError = zodError;
  }
}
