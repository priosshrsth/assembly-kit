import { AssemblyError } from "src/errors/base";

export class AssemblyForbiddenError extends AssemblyError {
  constructor(messageOverride?: string, details?: unknown) {
    super(
      messageOverride ??
        "Forbidden: the API key lacks permission to perform this action",
      403,
      details
    );
    this.name = "AssemblyForbiddenError";
  }
}
