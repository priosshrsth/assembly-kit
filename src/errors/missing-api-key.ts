import { AssemblyError } from "src/errors/base";
import type { AssemblyErrorOptions } from "src/errors/base";

export class AssemblyMissingApiKeyError extends AssemblyError {
  constructor({ message, ...rest }: AssemblyErrorOptions = {}) {
    super({
      message: message ?? "Assembly API key is missing or empty",
      statusCode: 400,
      ...rest,
    });
    this.name = "AssemblyMissingApiKeyError";
  }
}
