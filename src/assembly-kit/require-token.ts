import { AssemblyNoTokenError } from "src/errors/no-token";

/**
 * Guard that ensures a token is present. Throws `AssemblyNoTokenError` if absent.
 */
export const requireToken = (token: string | undefined): string => {
  if (!token) {
    throw new AssemblyNoTokenError();
  }
  return token;
};
