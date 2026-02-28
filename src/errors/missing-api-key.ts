import { AssemblyError } from "src/errors/base";

export class AssemblyMissingApiKeyError extends AssemblyError {
  constructor(messageOverride?: string, details?: unknown) {
    super(
      messageOverride ?? "Assembly API key is missing or empty",
      400,
      details
    );
    this.name = "AssemblyMissingApiKeyError";
  }
}
