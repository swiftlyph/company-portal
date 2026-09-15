import type { EmployeeStatus } from "./types";

export const EMPLOYEE_STATUS_LABEL: Record<EmployeeStatus, string> = {
  active: "Active",
  inactive: "Inactive",
};

/** Shown in place of an empty optional value in tables and detail views. */
export const EMPTY_VALUE = "—";

const dateFormatter = new Intl.DateTimeFormat("en-PH", {
  year: "numeric",
  month: "short",
  day: "numeric",
});

/**
 * hired_at is a plain YYYY-MM-DD from the backend. Parsed by parts rather
 * than `new Date(string)`, which would read it as UTC midnight and shift
 * the day for viewers west of Greenwich.
 */
export function formatDate(value: string | null): string {
  if (!value) return EMPTY_VALUE;

  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return value;

  return dateFormatter.format(new Date(year, month - 1, day));
}
