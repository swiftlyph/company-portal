import { api, type RequestOptions } from "@/lib/api/client";
import type {
  DeleteDepartmentResponse,
  Department,
  DepartmentsResponse,
  SaveDepartmentRequest,
} from "./types";

function normalizeDepartment(raw: Partial<Department> | null | undefined): Department {
  return {
    id: raw?.id ?? 0,
    name: raw?.name ?? "",
    employees_count: raw?.employees_count ?? 0,
    created_at: raw?.created_at ?? "",
    updated_at: raw?.updated_at ?? "",
  };
}

export async function fetchDepartments(options?: RequestOptions): Promise<DepartmentsResponse> {
  const raw = await api.get<Partial<DepartmentsResponse>>("/company/departments", options);

  return { data: Array.isArray(raw.data) ? raw.data.map(normalizeDepartment) : [] };
}

export function createDepartment(request: SaveDepartmentRequest): Promise<Department> {
  return api.post<Partial<Department>>("/company/departments", request).then(normalizeDepartment);
}

export function renameDepartment(id: number, request: SaveDepartmentRequest): Promise<Department> {
  return api
    .patch<Partial<Department>>(`/company/departments/${id}`, request)
    .then(normalizeDepartment);
}

export function deleteDepartment(id: number): Promise<DeleteDepartmentResponse> {
  return api.delete<DeleteDepartmentResponse>(`/company/departments/${id}`);
}
