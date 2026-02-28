import { AssemblyError } from "src/errors/base";

export class AssemblyServerError extends AssemblyError {
  constructor(messageOverride?: string, details?: unknown) {
    super(
      messageOverride ?? "An unexpected error occurred on the Assembly server",
      500,
      details
    );
    this.name = "AssemblyServerError";
  }
}
