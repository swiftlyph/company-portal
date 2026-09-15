export type CompanyStatus = "pending" | "active" | "suspended";

/** The compact company block on /auth/me and login (CompanySummaryResource). */
export interface CompanySummary {
  id: number;
  name: string;
  status: CompanyStatus;
}

/**
 * The flat user object returned by /auth/login and /auth/me (UserResource).
 * `merchant` and `permissions` are also on the wire for merchant accounts;
 * this portal never reads them, so they are left off the type rather than
 * typed-and-ignored.
 */
export interface AuthUser {
  id: number;
  name: string;
  email: string;
  roles: string[];
  company: CompanySummary | null;
}

/** Field name -> list of validation messages, as returned on 422 responses. */
export type ApiFieldErrors = Record<string, string[]>;

/** Shape of every error response from the backend: { message, code, errors? }. */
export interface ApiErrorShape {
  message: string;
  code?: string;
  errors?: ApiFieldErrors;
}

/** Thrown by the api client for any non-2xx response, and for network failures. */
export class ApiError extends Error {
  readonly status: number;
  readonly code?: string;
  readonly errors?: ApiFieldErrors;

  constructor({
    status,
    message,
    code,
    errors,
  }: {
    status: number;
    message: string;
    code?: string;
    errors?: ApiFieldErrors;
  }) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.errors = errors;
  }
}
