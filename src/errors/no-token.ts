import { AssemblyError } from "src/errors/base";
import type { AssemblyErrorOptions } from "src/errors/base";

export class AssemblyNoTokenError extends AssemblyError {
  constructor({ message, ...rest }: AssemblyErrorOptions = {}) {
    super({
      message:
        message ??
        "A token is required for this operation but was not provided",
      statusCode: 400,
      ...rest,
    });
    this.name = "AssemblyNoTokenError";
  }
}
