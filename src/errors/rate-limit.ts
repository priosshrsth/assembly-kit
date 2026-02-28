import { AssemblyError } from "@/errors/base.ts";

export class AssemblyRateLimitError extends AssemblyError {
  readonly retryAfter?: number;

  constructor(
    messageOverride?: string,
    retryAfter?: number,
    details?: unknown
  ) {
    super(messageOverride ?? "Rate limit exceeded", 429, details);
    this.name = "AssemblyRateLimitError";
    this.retryAfter = retryAfter;
  }
}
