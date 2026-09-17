import type { EmployeeStatus, EmploymentType } from "./types";

export const EMPLOYEE_STATUS_LABEL: Record<EmployeeStatus, string> = {
  active: "Active",
  inactive: "Inactive",
  separated: "Separated",
};

export const EMPLOYMENT_TYPE_LABEL: Record<EmploymentType, string> = {
  regular: "Regular",
  probationary: "Probationary",
  contractual: "Contractual",
  part_time: "Part-time",
  intern: "Intern",
};

/** Shown in place of an empty optional value in tables and detail views. */
export const EMPTY_VALUE = "—";

const dateFormatter = new Intl.DateTimeFormat("en-PH", {
  year: "numeric",
  month: "short",
  day: "numeric",
});

const dateTimeFormatter = new Intl.DateTimeFormat("en-PH", {
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

const allowanceFormatter = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
});

/**
 * The API's dates (hired_at, birthdate, separated_at) are plain YYYY-MM-DD.
 * Parsed by parts rather than `new Date(string)`, which would read them as
 * UTC midnight and shift the day for viewers west of Greenwich.
 */
export function formatDate(value: string | null): string {
  if (!value) return EMPTY_VALUE;

  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return value;

  return dateFormatter.format(new Date(year, month - 1, day));
}

/** +639171234567 -> +63 917 123 4567. Anything else is shown as stored. */
export function formatMobile(value: string | null): string {
  if (!value) return EMPTY_VALUE;

  const match = /^\+63(\d{3})(\d{3})(\d{4})$/.exec(value);
  return match ? `+63 ${match[1]} ${match[2]} ${match[3]}` : value;
}

export function formatAllowance(cents: number): string {
  return allowanceFormatter.format(cents / 100);
}

export function formatDateTime(value: string): string {
  if (!value) return EMPTY_VALUE;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : dateTimeFormatter.format(date);
}
