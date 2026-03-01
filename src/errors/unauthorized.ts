import { AssemblyError } from "src/errors/base";
import type { AssemblyErrorOptions } from "src/errors/base";

export class AssemblyUnauthorizedError extends AssemblyError {
  constructor({ message, ...rest }: AssemblyErrorOptions = {}) {
    super({
      message: message ?? "Unauthorized: the API key was rejected by Assembly",
      statusCode: 401,
      ...rest,
    });
    this.name = "AssemblyUnauthorizedError";
  }
}
