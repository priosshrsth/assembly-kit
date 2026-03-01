import { AssemblyError } from "src/errors/base";
import type { AssemblyErrorOptions } from "src/errors/base";

export class AssemblyNotFoundError extends AssemblyError {
  constructor({ message, ...rest }: AssemblyErrorOptions = {}) {
    super({
      message: message ?? "The requested resource was not found",
      statusCode: 404,
      ...rest,
    });
    this.name = "AssemblyNotFoundError";
  }
}
