import { AssemblyError } from "src/errors/base";
import type { AssemblyErrorOptions } from "src/errors/base";

export class AssemblyServerError extends AssemblyError {
  constructor({ message, ...rest }: AssemblyErrorOptions = {}) {
    super({
      message: message ?? "An unexpected error occurred on the Assembly server",
      statusCode: 500,
      ...rest,
    });
    this.name = "AssemblyServerError";
  }
}
