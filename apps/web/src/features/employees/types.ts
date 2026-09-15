/**
 * Shapes verified against gasa-api's source, not a spec doc:
 * App\Domains\Company\Http\Resources\EmployeeResource, the
 * Store/Update/IndexEmployeesRequest FormRequests, and EmployeeController.
 */

export type EmployeeStatus = "active" | "inactive";

export const EMPLOYEE_STATUS_VALUES: EmployeeStatus[] = ["active", "inactive"];

/** One row of GET /company/employees (EmployeeResource); flat on show/store/update. */
export interface Employee {
  id: number;
  employee_no: string | null;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  mobile: string | null;
  department: string | null;
  job_title: string | null;
  /** YYYY-MM-DD, never a datetime. */
  hired_at: string | null;
  status: EmployeeStatus;
  /** False for every employee until the invite phase links a portal account. */
  has_account: boolean;
  created_at: string;
  updated_at: string;
}

/** Laravel's paginator meta; `links` is on the wire too but the UI never reads it. */
export interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
}

/** GET /company/employees: always { data, links, meta } (README § Response shapes). */
export interface EmployeesResponse {
  data: Employee[];
  meta: PaginationMeta;
}

/** The query string GET /company/employees accepts (IndexEmployeesRequest). */
export interface EmployeesFilters {
  status?: EmployeeStatus;
  search?: string;
  page: number;
  /** Capped at 100 by the backend. */
  per_page?: number;
}

/** POST /company/employees (StoreEmployeeRequest). `status` is not accepted: a new employee is always active. */
export interface CreateEmployeeRequest {
  first_name: string;
  last_name: string;
  email: string;
  employee_no?: string | null;
  mobile?: string | null;
  department?: string | null;
  job_title?: string | null;
  hired_at?: string | null;
}

/** PATCH /company/employees/{id} (UpdateEmployeeRequest): every field optional, absent means unchanged. */
export interface UpdateEmployeeRequest extends Partial<CreateEmployeeRequest> {
  status?: EmployeeStatus;
}

/** DELETE /company/employees/{id}: a small 200 body, never a bare 204. */
export interface RemoveEmployeeResponse {
  message: string;
  code: string;
}
