import { AssemblyError } from "src/errors/base";

export class AssemblyInvalidTokenError extends AssemblyError {
  constructor(messageOverride?: string, details?: unknown) {
    super(
      messageOverride ??
        "The provided token could not be decrypted or has an invalid payload",
      401,
      details
    );
    this.name = "AssemblyInvalidTokenError";
  }
}
