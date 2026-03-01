/** Ensures a URL uses HTTPS, upgrading HTTP if necessary. */
export const ensureHttps = (url: string): string => {
  if (url.startsWith("https://")) {
    return url;
  }
  return `https://${url.replace(/^http:\/\//, "")}`;
};
