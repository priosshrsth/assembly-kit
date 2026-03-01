export interface AssemblyErrorOptions {
  message?: string;
  cause?: unknown;
  details?: unknown;
}

interface AssemblyBaseErrorInit extends AssemblyErrorOptions {
  message: string;
  statusCode: number;
}

export class AssemblyError extends Error {
  readonly statusCode: number;
  readonly details?: unknown;

  constructor({ message, statusCode, cause, details }: AssemblyBaseErrorInit) {
    super(message, { cause });
    this.name = "AssemblyError";
    this.statusCode = statusCode;
    this.details = details;
    // Maintains proper prototype chain in environments that transpile to ES5
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
