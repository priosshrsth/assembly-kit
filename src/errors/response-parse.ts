import { AssemblyError } from "src/errors/base";
import type { AssemblyErrorOptions } from "src/errors/base";
import { z } from "zod";
import type { ZodError } from "zod";

export interface AssemblyResponseParseErrorOptions extends Omit<
  AssemblyErrorOptions,
  "cause"
> {
  cause: ZodError;
}

export class AssemblyResponseParseError extends AssemblyError {
  readonly validationErrors: string;

  constructor({ message, cause, details }: AssemblyResponseParseErrorOptions) {
    super({
      cause,
      details,
      message:
        message ?? "Assembly API response did not match the expected schema",
      statusCode: 500,
    });
    this.name = "AssemblyResponseParseError";
    this.validationErrors = z.prettifyError(cause);
  }

  // Narrows the inherited Error.cause to ZodError — safe because the
  // constructor enforces cause: ZodError at the call site.
  override get cause(): ZodError {
    return super.cause as ZodError;
  }
}
