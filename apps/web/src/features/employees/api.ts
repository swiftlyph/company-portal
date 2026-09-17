import { api, type RequestOptions } from "@/lib/api/client";
import type {
  CreateEmployeeRequest,
  Employee,
  EmployeeDepartment,
  EmployeeAllowance,
  AllowanceTransaction,
  EmployeesFilters,
  EmployeesResponse,
  ImportMode,
  ImportReport,
  ImportRow,
  PaginationMeta,
  RemoveEmployeeResponse,
  UpdateEmployeeRequest,
  GrantAllowanceRequest,
} from "./types";

/**
 * Parsers stay additive-tolerant, following merchant-portal's convention:
 * extra keys the backend adds later pass through untouched, and fields that
 * would otherwise crash a render if missing/malformed are normalized here.
 */

function normalizeDepartment(raw: Partial<EmployeeDepartment> | null | undefined): EmployeeDepartment | null {
  if (!raw || typeof raw !== "object" || typeof raw.id !== "number") {
    return null;
  }
  return { id: raw.id, name: raw.name ?? "" };
}

function normalizeEmployee(raw: Partial<Employee> | null | undefined): Employee {
  const firstName = raw?.first_name ?? "";
  const lastName = raw?.last_name ?? "";

  return {
    id: raw?.id ?? 0,
    employee_no: raw?.employee_no ?? null,
    first_name: firstName,
    middle_name: raw?.middle_name ?? null,
    last_name: lastName,
    suffix: raw?.suffix ?? null,
    full_name: raw?.full_name ?? `${firstName} ${lastName}`.trim(),
    email: raw?.email ?? "",
    mobile: raw?.mobile ?? null,
    birthdate: raw?.birthdate ?? null,
    department_id: raw?.department_id ?? null,
    department: normalizeDepartment(raw?.department),
    job_title: raw?.job_title ?? null,
    employment_type: raw?.employment_type ?? "regular",
    hired_at: raw?.hired_at ?? null,
    status: raw?.status ?? "active",
    separated_at: raw?.separated_at ?? null,
    has_account: raw?.has_account ?? false,
    created_at: raw?.created_at ?? "",
    updated_at: raw?.updated_at ?? "",
  };
}

function normalizeAllowanceTransaction(raw: Partial<AllowanceTransaction> | null | undefined): AllowanceTransaction {
  return {
    id: raw?.id ?? 0,
    type: raw?.type ?? "grant",
    amount_cents: raw?.amount_cents ?? 0,
    balance_after_cents: raw?.balance_after_cents ?? 0,
    reason: raw?.reason ?? null,
    created_at: raw?.created_at ?? "",
  };
}

function normalizeAllowance(raw: Partial<EmployeeAllowance> | null | undefined): EmployeeAllowance {
  return {
    employee_id: raw?.employee_id ?? 0,
    purse: "allowance",
    balance_cents: raw?.balance_cents ?? 0,
    transactions: Array.isArray(raw?.transactions)
      ? raw.transactions.map(normalizeAllowanceTransaction)
      : [],
  };
}

function normalizeMeta(raw: Partial<PaginationMeta> | null | undefined): PaginationMeta {
  return {
    current_page: raw?.current_page ?? 1,
    last_page: raw?.last_page ?? 1,
    per_page: raw?.per_page ?? 25,
    total: raw?.total ?? 0,
    from: raw?.from ?? null,
    to: raw?.to ?? null,
  };
}

function normalizeImportRow(raw: Partial<ImportRow> | null | undefined): ImportRow {
  // A row with no problems carries `errors: null`; an empty PHP array would
  // arrive as [] rather than {}, so anything that isn't a plain object is
  // treated as "no errors".
  const errors =
    raw?.errors && typeof raw.errors === "object" && !Array.isArray(raw.errors) ? raw.errors : null;

  return {
    line: raw?.line ?? 0,
    action: raw?.action ?? "invalid",
    employee_no: raw?.employee_no ?? null,
    first_name: raw?.first_name ?? null,
    last_name: raw?.last_name ?? null,
    email: raw?.email ?? null,
    errors,
  };
}

/** Only non-default filters go on the wire, so a shared link stays short. */
export function employeesQueryString(filters: EmployeesFilters, { paginate = true } = {}): string {
  const params = new URLSearchParams();
  if (filters.status) params.set("status", filters.status);
  if (filters.employment_type) params.set("employment_type", filters.employment_type);
  if (filters.department_id) params.set("department_id", String(filters.department_id));
  if (filters.search) params.set("search", filters.search);
  if (paginate && filters.page > 1) params.set("page", String(filters.page));
  if (paginate && filters.per_page) params.set("per_page", String(filters.per_page));

  const query = params.toString();
  return query ? `?${query}` : "";
}

export async function fetchEmployees(
  filters: EmployeesFilters,
  options?: RequestOptions,
): Promise<EmployeesResponse> {
  const raw = await api.get<Partial<EmployeesResponse>>(
    `/company/employees${employeesQueryString(filters)}`,
    options,
  );

  return {
    data: Array.isArray(raw.data) ? raw.data.map(normalizeEmployee) : [],
    meta: normalizeMeta(raw.meta),
  };
}

export function fetchEmployee(id: number, options?: RequestOptions): Promise<Employee> {
  return api.get<Partial<Employee>>(`/company/employees/${id}`, options).then(normalizeEmployee);
}

export function fetchEmployeeAllowance(id: number, options?: RequestOptions): Promise<EmployeeAllowance> {
  return api
    .get<Partial<EmployeeAllowance>>(`/company/employees/${id}/allowance`, options)
    .then(normalizeAllowance);
}

export function grantEmployeeAllowance(id: number, request: GrantAllowanceRequest): Promise<EmployeeAllowance> {
  return api
    .post<Partial<EmployeeAllowance>>(`/company/employees/${id}/allowance/grants`, request)
    .then(normalizeAllowance);
}

export function createEmployee(request: CreateEmployeeRequest): Promise<Employee> {
  return api.post<Partial<Employee>>("/company/employees", request).then(normalizeEmployee);
}

export function updateEmployee(id: number, request: UpdateEmployeeRequest): Promise<Employee> {
  return api
    .patch<Partial<Employee>>(`/company/employees/${id}`, request)
    .then(normalizeEmployee);
}

export function removeEmployee(id: number): Promise<RemoveEmployeeResponse> {
  return api.delete<RemoveEmployeeResponse>(`/company/employees/${id}`);
}

/**
 * The roster as CSV, for exactly the filters the list is showing (the API
 * takes the same query string for both). Pagination doesn't apply: an
 * export is every matching employee, not the current page.
 */
export function exportEmployees(filters: EmployeesFilters): Promise<Blob> {
  return api.download(`/company/employees/export${employeesQueryString(filters, { paginate: false })}`);
}

/**
 * Uploads a roster CSV. Both modes run the same code server-side (preview
 * rolls its transaction back), so what a preview reports is what a commit
 * of the same file will do.
 */
export async function importEmployees(file: File, mode: ImportMode): Promise<ImportReport> {
  const form = new FormData();
  form.append("file", file);
  form.append("mode", mode);

  const raw = await api.post<Partial<ImportReport>>("/company/employees/import", form);

  return {
    mode: raw.mode ?? mode,
    summary: {
      total: raw.summary?.total ?? 0,
      create: raw.summary?.create ?? 0,
      update: raw.summary?.update ?? 0,
      unchanged: raw.summary?.unchanged ?? 0,
      invalid: raw.summary?.invalid ?? 0,
    },
    ignored_columns: Array.isArray(raw.ignored_columns) ? raw.ignored_columns : [],
    rows: Array.isArray(raw.rows) ? raw.rows.map(normalizeImportRow) : [],
  };
}
