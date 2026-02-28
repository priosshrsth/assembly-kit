import { AssemblyError } from "src/errors/base";

export class AssemblyUnauthorizedError extends AssemblyError {
  constructor(messageOverride?: string, details?: unknown) {
    super(
      messageOverride ?? "Unauthorized: the API key was rejected by Assembly",
      401,
      details
    );
    this.name = "AssemblyUnauthorizedError";
  }
}
