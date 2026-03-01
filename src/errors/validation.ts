import { AssemblyError } from "src/errors/base";
import type { AssemblyErrorOptions } from "src/errors/base";

export class AssemblyValidationError extends AssemblyError {
  constructor({ message, ...rest }: AssemblyErrorOptions = {}) {
    super({
      message:
        message ?? "The request payload was rejected by the Assembly API",
      statusCode: 422,
      ...rest,
    });
    this.name = "AssemblyValidationError";
  }
}
