export class AssemblyError extends Error {
  readonly statusCode: number;
  readonly details?: unknown;

  constructor(message: string, statusCode: number, details?: unknown) {
    super(message);
    this.name = "AssemblyError";
    this.statusCode = statusCode;
    this.details = details;
    // Maintains proper prototype chain in environments that transpile to ES5
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
