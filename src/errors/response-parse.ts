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
  declare readonly cause: ZodError;
  readonly validationErrors: string;

  constructor({ message, ...rest }: AssemblyResponseParseErrorOptions) {
    super({
      message:
        message ?? "Assembly API response did not match the expected schema",
      statusCode: 500,
      ...rest,
    });
    this.name = "AssemblyResponseParseError";
    this.validationErrors = z.prettifyError(rest.cause);
  }
}
