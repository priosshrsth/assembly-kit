export interface AssemblyErrorOptions {
  /**
   * Override the default message for this error class.
   * Each subclass provides a sensible default, so this is rarely needed.
   */
  message?: string;
  /** The original error that caused this one, forwarded to native Error.cause. */
  cause?: unknown;
  /** Arbitrary extra context (e.g. raw response body) for debugging. */
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
