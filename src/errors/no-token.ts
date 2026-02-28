import { AssemblyError } from "src/errors/base";

export class AssemblyNoTokenError extends AssemblyError {
  constructor(messageOverride?: string, details?: unknown) {
    super(
      messageOverride ??
        "A token is required for this operation but was not provided",
      400,
      details
    );
    this.name = "AssemblyNoTokenError";
  }
}
