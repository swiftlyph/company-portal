import { ApiError } from "@/lib/api/client";

/**
 * department_in_use already says how many employees are in the way, so
 * the API's own message is the best one to show; the name collision gets
 * wording that tells the person what to do next.
 */
export function describeDepartmentError(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
    if (error.code === "department_name_taken") {
      return "You already have a department with this name.";
    }
    if (error.code === "company_inactive") {
      return "Your company account is not active.";
    }
    return error.message || fallback;
  }
  return error instanceof Error ? error.message : fallback;
}
