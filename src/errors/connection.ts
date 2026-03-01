import type { AssemblyErrorOptions } from "src/errors/base";
import { AssemblyError } from "src/errors/base";

export class AssemblyConnectionError extends AssemblyError {
  constructor({ message, ...rest }: AssemblyErrorOptions = {}) {
    super({
      message:
        message ??
        "A network error occurred while connecting to the Assembly API",
      statusCode: 503,
      ...rest,
    });
    this.name = "AssemblyConnectionError";
  }
}
