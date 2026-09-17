/**
 * Shapes verified against gasa-api's source, not a spec doc:
 * App\Domains\Company\Http\Resources\EmployeeResource, EmployeeFieldRules,
 * IndexEmployeesRequest, ImportEmployeesAction and EmployeeController.
 */

/** `inactive` is a pause; `separated` means the employee has left (and always carries a date). */
export type EmployeeStatus = "active" | "inactive" | "separated";

export const EMPLOYEE_STATUS_VALUES: EmployeeStatus[] = ["active", "inactive", "separated"];

export type EmploymentType = "regular" | "probationary" | "contractual" | "part_time" | "intern";

export const EMPLOYMENT_TYPE_VALUES: EmploymentType[] = [
  "regular",
  "probationary",
  "contractual",
  "part_time",
  "intern",
];

/** The compact department block on an employee. */
export interface EmployeeDepartment {
  id: number;
  name: string;
}

/** One row of GET /company/employees (EmployeeResource); flat on show/store/update. */
export interface Employee {
  id: number;
  employee_no: string | null;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  suffix: string | null;
  /** Given name, surname, suffix. The middle name is for the ID, not everyday display. */
  full_name: string;
  email: string;
  /** E.164 (+639171234567); the API normalizes whatever was typed. */
  mobile: string | null;
  /** YYYY-MM-DD, never a datetime. Same for hired_at and separated_at. */
  birthdate: string | null;
  department_id: number | null;
  department: EmployeeDepartment | null;
  job_title: string | null;
  employment_type: EmploymentType;
  hired_at: string | null;
  status: EmployeeStatus;
  /** Set if, and only if, status is "separated". */
  separated_at: string | null;
  /** False for every employee until the invite phase links a portal account. */
  has_account: boolean;
  created_at: string;
  updated_at: string;
}

export type AllowanceLedgerEntryType = "grant" | "consumption" | "reversal" | "expiry" | "adjustment";

export interface AllowanceTransaction {
  id: number;
  type: AllowanceLedgerEntryType;
  amount_cents: number;
  balance_after_cents: number;
  reason: string | null;
  created_at: string;
}

/** GET /company/employees/{id}/allowance. */
export interface EmployeeAllowance {
  employee_id: number;
  purse: "allowance";
  balance_cents: number;
  transactions: AllowanceTransaction[];
}

/** POST /company/employees/{id}/allowance/grants. */
export interface GrantAllowanceRequest {
  amount_cents: number;
  reason: string;
  idempotency_key: string;
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

/** The query string GET /company/employees and its CSV export accept (IndexEmployeesRequest). */
export interface EmployeesFilters {
  status?: EmployeeStatus;
  employment_type?: EmploymentType;
  department_id?: number;
  search?: string;
  page: number;
  /** Capped at 100 by the backend. */
  per_page?: number;
}

/** POST /company/employees. `status` is not accepted: a new employee is always active. */
export interface CreateEmployeeRequest {
  first_name: string;
  last_name: string;
  email: string;
  employee_no?: string | null;
  middle_name?: string | null;
  suffix?: string | null;
  mobile?: string | null;
  birthdate?: string | null;
  department_id?: number | null;
  job_title?: string | null;
  employment_type?: EmploymentType;
  hired_at?: string | null;
}

/**
 * PATCH /company/employees/{id}: every field optional, absent means
 * unchanged. The API keeps status and separated_at in step: separating
 * without a date stamps today, and any other status clears the date.
 */
export interface UpdateEmployeeRequest extends Partial<CreateEmployeeRequest> {
  status?: EmployeeStatus;
  separated_at?: string | null;
}

/** DELETE /company/employees/{id}: a small 200 body, never a bare 204. */
export interface RemoveEmployeeResponse {
  message: string;
  code: string;
}

/** `preview` reports what would happen and writes nothing; `commit` does it. */
export type ImportMode = "preview" | "commit";

export type ImportRowAction = "create" | "update" | "unchanged" | "invalid";

/** One CSV row of the import report. `line` is the line in the uploaded file. */
export interface ImportRow {
  line: number;
  action: ImportRowAction;
  employee_no: string | null;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  /** Field name -> messages, only on an `invalid` row. */
  errors: Record<string, string[]> | null;
}

/** POST /company/employees/import: always a 200 report, in both modes. */
export interface ImportReport {
  mode: ImportMode;
  summary: {
    total: number;
    create: number;
    update: number;
    unchanged: number;
    invalid: number;
  };
  /** Header names the file had that the import doesn't understand. */
  ignored_columns: string[];
  rows: ImportRow[];
}
