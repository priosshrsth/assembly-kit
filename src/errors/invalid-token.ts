import { AssemblyError } from "src/errors/base";
import type { AssemblyErrorOptions } from "src/errors/base";

export class AssemblyInvalidTokenError extends AssemblyError {
  constructor({ message, ...rest }: AssemblyErrorOptions = {}) {
    super({
      message:
        message ??
        "The provided token could not be decrypted or has an invalid payload",
      statusCode: 401,
      ...rest,
    });
    this.name = "AssemblyInvalidTokenError";
  }
}
