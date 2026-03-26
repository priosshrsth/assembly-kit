import type { AssemblyAPI } from "@assembly-js/node-sdk";

/**
 * Mapped type that converts every method on `AssemblyAPI` from
 * `CancelablePromise<T>` to standard `Promise<T>`.
 */
export type AssemblyClient = {
  [K in keyof AssemblyAPI]: AssemblyAPI[K] extends (
    ...args: infer A
  ) => Promise<infer R>
    ? (...args: A) => Promise<R>
    : AssemblyAPI[K];
};

/**
 * Wraps every function property on the SDK instance with a retry function
 * using a Proxy. Non-function properties are passed through as-is.
 */
export const wrapSdk = (
  sdk: AssemblyAPI,
  retryFn: <T>(fn: () => Promise<T>) => Promise<T>
): AssemblyClient =>
  new Proxy(sdk, {
    get(target, prop, receiver) {
      const value = Reflect.get(target, prop, receiver);
      if (typeof value === "function") {
        return (...args: unknown[]) => retryFn(() => value.apply(target, args));
      }
      return value;
    },
  }) as unknown as AssemblyClient;
