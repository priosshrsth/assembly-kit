import { AssemblyError } from "src/errors/base";
import type { AssemblyErrorOptions } from "src/errors/base";

export class AssemblyForbiddenError extends AssemblyError {
  constructor({ message, ...rest }: AssemblyErrorOptions = {}) {
    super({
      message:
        message ??
        "Forbidden: the API key lacks permission to perform this action",
      statusCode: 403,
      ...rest,
    });
    this.name = "AssemblyForbiddenError";
  }
}
