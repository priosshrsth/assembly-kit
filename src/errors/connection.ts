import { AssemblyError } from "@/errors/base.ts";

export class AssemblyConnectionError extends AssemblyError {
  constructor(messageOverride?: string, details?: unknown) {
    super(
      messageOverride ??
        "A network error occurred while connecting to the Assembly API",
      503,
      details
    );
    this.name = "AssemblyConnectionError";
  }
}
