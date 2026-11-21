export type CbAccess = "open" | "auth";

/** Same-origin path; each host's Apache (or the Vite dev proxy) forwards it. */
export const getQueryEndpoint = (access: CbAccess = "open"): string =>
  `/api/cb/${access}/query`;
