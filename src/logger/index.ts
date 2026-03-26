import { AsyncLocalStorage } from "node:async_hooks";

import pino from "pino";
import type { Logger, LoggerOptions } from "pino";

export type { Logger, LoggerOptions } from "pino";

const DEFAULT_OPTIONS: LoggerOptions = {
  level: process.env.LOG_LEVEL ?? "info",
  transport:
    process.env.NODE_ENV === "production"
      ? undefined
      : { options: { colorize: true }, target: "pino-pretty" },
};

const buildLogger = (options: LoggerOptions = {}): Logger =>
  pino({ ...DEFAULT_OPTIONS, ...options });

const store: AsyncLocalStorage<Logger> = new AsyncLocalStorage<Logger>();

/**
 * Get or create a request-scoped logger via `AsyncLocalStorage`.
 * Returns the existing instance if one exists. Pass options to customize
 * on first call; subsequent calls in the same async context return the
 * same instance.
 *
 * @example
 * ```ts
 * const logger = createLogger({ level: "debug" });
 * logger.info("hello");
 * logger.warn("careful");
 * logger.error("oops");
 *
 * // Later in the same async context:
 * const same = createLogger(); // returns the same instance
 * ```
 */
export const createLogger = (options: LoggerOptions = {}): Logger => {
  const existing = store.getStore();
  if (existing) {
    return existing;
  }
  const instance = buildLogger(options);
  store.enterWith(instance);
  return instance;
};

/** A default global logger instance for convenience. */
export const logger: Logger = buildLogger();
