import { AssemblyError } from "src/errors/base";
import type { AssemblyErrorOptions } from "src/errors/base";

export interface AssemblyRateLimitErrorOptions extends AssemblyErrorOptions {
  retryAfter?: number;
}

export class AssemblyRateLimitError extends AssemblyError {
  readonly retryAfter?: number;

  constructor({
    message,
    retryAfter,
    ...rest
  }: AssemblyRateLimitErrorOptions = {}) {
    super({
      message: message ?? "Rate limit exceeded",
      statusCode: 429,
      ...rest,
    });
    this.name = "AssemblyRateLimitError";
    this.retryAfter = retryAfter;
  }
}
