import { AssemblyError } from "@/errors/base.ts";

export class AssemblyValidationError extends AssemblyError {
  constructor(messageOverride?: string, details?: unknown) {
    super(
      messageOverride ?? "The request payload was rejected by the Assembly API",
      422,
      details
    );
    this.name = "AssemblyValidationError";
  }
}
