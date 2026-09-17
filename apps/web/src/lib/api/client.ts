import { ApiError, type ApiErrorShape } from "./types";

/**
 * Ported from merchant-portal's src/lib/api/client.ts so both portals talk
 * to gasa-api the same way: a thin fetch wrapper, bearer token from a
 * pluggable getter, every error normalized to ApiError, and a couple of
 * app-level hooks for responses that must change routing wherever they
 * happen. The merchant-only hooks (merchant_inactive, permission_denied)
 * are replaced by the company equivalent.
 *
 * Two additions over the original, both needed by the employee roster: a
 * FormData body passes through untouched (CSV upload), and `api.download`
 * returns a Blob (CSV export). A bearer-token API can't be reached with a
 * plain <a href>, so downloads have to come through here too.
 */

const BASE_URL = import.meta.env.VITE_API_URL as string;

type TokenGetter = () => string | null;

/** Pluggable so the auth store can wire in real token storage without this file changing. */
let getToken: TokenGetter = () => null;

export function registerTokenGetter(getter: TokenGetter): void {
  getToken = getter;
}

type UnauthorizedCallback = () => void;

let onUnauthorized: UnauthorizedCallback | null = null;

/** The auth session wires this to logout so any 401, anywhere, ends the session. */
export function registerOnUnauthorized(cb: UnauthorizedCallback): void {
  onUnauthorized = cb;
}

type CompanyInactiveCallback = () => void;

let onCompanyInactive: CompanyInactiveCallback | null = null;

/**
 * Fires on a 403 "company_inactive" from any /company/* request: a company
 * suspended mid-session, not an expired token. Wired to re-derive routing
 * (see features/auth/company-guard.ts) without logging the user out.
 */
export function registerOnCompanyInactive(cb: CompanyInactiveCallback): void {
  onCompanyInactive = cb;
}

export interface RequestOptions extends Omit<RequestInit, "body"> {
  /** A plain value is sent as JSON; a FormData is sent as multipart, untouched. */
  body?: unknown;
  /**
   * Skip the registered onUnauthorized callback for this call even on a 401.
   * For requests where a 401 is an expected, in-band outcome rather than an
   * expired session, e.g. login rejecting bad credentials.
   */
  suppressUnauthorized?: boolean;
}

const FALLBACK_MESSAGE = "Something went wrong. Please try again.";
const NETWORK_ERROR_MESSAGE =
  "Unable to reach the server. Check your connection and try again.";

async function parseErrorBody(response: Response): Promise<ApiErrorShape> {
  try {
    const data = (await response.json()) as Partial<ApiErrorShape>;
    return {
      message: data.message ?? FALLBACK_MESSAGE,
      code: data.code,
      errors: data.errors,
    };
  } catch {
    return { message: FALLBACK_MESSAGE };
  }
}

/** Sends the request and returns the OK response; everything else throws an ApiError. */
async function send(path: string, options: RequestOptions): Promise<Response> {
  const { body, headers, suppressUnauthorized, ...rest } = options;

  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;

  const finalHeaders = new Headers(headers);
  finalHeaders.set("Accept", "application/json");
  // Never set for FormData: the browser adds the multipart boundary itself,
  // and a hand-written Content-Type would leave it out.
  if (body !== undefined && !isFormData) {
    finalHeaders.set("Content-Type", "application/json");
  }
  const token = getToken();
  if (token) {
    finalHeaders.set("Authorization", `Bearer ${token}`);
  }

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      ...rest,
      headers: finalHeaders,
      body: body === undefined ? undefined : isFormData ? body : JSON.stringify(body),
    });
  } catch (error) {
    // An aborted request (TanStack Query cancelling a stale list fetch) is
    // not a network failure; rethrow so the caller can ignore it.
    if (error instanceof DOMException && error.name === "AbortError") {
      throw error;
    }
    throw new ApiError({ status: 0, message: NETWORK_ERROR_MESSAGE });
  }

  if (!response.ok) {
    const { message, code, errors } = await parseErrorBody(response);
    const error = new ApiError({ status: response.status, message, code, errors });
    if (response.status === 401 && !suppressUnauthorized) {
      onUnauthorized?.();
    }
    if (response.status === 403 && code === "company_inactive") {
      onCompanyInactive?.();
    }
    throw error;
  }

  return response;
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const response = await send(path, options);

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export const api = {
  get: <T>(path: string, options?: RequestOptions) =>
    apiRequest<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    apiRequest<T>(path, { ...options, method: "POST", body }),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    apiRequest<T>(path, { ...options, method: "PUT", body }),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    apiRequest<T>(path, { ...options, method: "PATCH", body }),
  delete: <T>(path: string, options?: RequestOptions) =>
    apiRequest<T>(path, { ...options, method: "DELETE" }),
  /** A file response (the CSV export). Errors still arrive as JSON and throw ApiError. */
  download: async (path: string, options?: RequestOptions): Promise<Blob> => {
    const response = await send(path, { ...options, method: "GET" });
    return response.blob();
  },
};

export { ApiError };
