import { ApiError } from "@/lib/api/client";
import type { ApiFieldErrors } from "@/lib/api/types";

/**
 * Employee error codes get plain-language messages. The two *_taken codes
 * are safe to spell out: the roster is the caller's own company, so
 * naming the collision helps rather than leaks (unlike the merchant
 * portal's email_unavailable, which must stay vague).
 */
export function describeEmployeeError(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
    if (error.code === "employee_email_taken") {
      return "An employee with this email address already exists.";
    }
    if (error.code === "employee_number_taken") {
      return "An employee with this employee number already exists.";
    }
    if (error.code === "invalid_department") {
      return "That department no longer exists. Pick another one.";
    }
    if (error.code === "company_inactive") {
      return "Your company account is not active.";
    }
    return error.message || fallback;
  }
  return error instanceof Error ? error.message : fallback;
}

/**
 * Per-field messages from a 422. validation_failed, the two *_taken codes
 * and invalid_department all name the field in `errors`, so a form can
 * attach the message to the right input and skip the banner.
 */
export function fieldErrorsFrom(error: unknown): ApiFieldErrors | null {
  if (error instanceof ApiError && error.status === 422 && error.errors) {
    return error.errors;
  }
  return null;
}
