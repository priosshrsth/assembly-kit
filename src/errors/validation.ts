import { AssemblyError } from "src/errors/base";

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
