import { api, type RequestOptions } from "@/lib/api/client";
import type {
  CreateEmployeeRequest,
  Employee,
  EmployeesFilters,
  EmployeesResponse,
  PaginationMeta,
  RemoveEmployeeResponse,
  UpdateEmployeeRequest,
} from "./types";

/**
 * Parsers stay additive-tolerant, following merchant-portal's convention:
 * extra keys the backend adds later pass through untouched, and fields that
 * would otherwise crash a render if missing/malformed are normalized here.
 */

function normalizeEmployee(raw: Partial<Employee> | null | undefined): Employee {
  const firstName = raw?.first_name ?? "";
  const lastName = raw?.last_name ?? "";

  return {
    id: raw?.id ?? 0,
    employee_no: raw?.employee_no ?? null,
    first_name: firstName,
    last_name: lastName,
    full_name: raw?.full_name ?? `${firstName} ${lastName}`.trim(),
    email: raw?.email ?? "",
    mobile: raw?.mobile ?? null,
    department: raw?.department ?? null,
    job_title: raw?.job_title ?? null,
    hired_at: raw?.hired_at ?? null,
    status: raw?.status ?? "active",
    has_account: raw?.has_account ?? false,
    created_at: raw?.created_at ?? "",
    updated_at: raw?.updated_at ?? "",
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

/** Only non-default filters go on the wire, so a shared link stays short. */
export function employeesQueryString(filters: EmployeesFilters): string {
  const params = new URLSearchParams();
  if (filters.status) params.set("status", filters.status);
  if (filters.search) params.set("search", filters.search);
  if (filters.page > 1) params.set("page", String(filters.page));
  if (filters.per_page) params.set("per_page", String(filters.per_page));

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
