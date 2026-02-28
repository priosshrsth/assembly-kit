import { AssemblyError } from "src/errors/base";

export class AssemblyNotFoundError extends AssemblyError {
  constructor(messageOverride?: string, details?: unknown) {
    super(
      messageOverride ?? "The requested resource was not found",
      404,
      details
    );
    this.name = "AssemblyNotFoundError";
  }
}
