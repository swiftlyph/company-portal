/**
 * Shapes verified against gasa-api's DepartmentResource and
 * DepartmentController.
 */

/** One row of GET /company/departments. */
export interface Department {
  id: number;
  name: string;
  /** Non-removed employees in it. Only the list carries it; 0 elsewhere. */
  employees_count: number;
  created_at: string;
  updated_at: string;
}

/** GET /company/departments: unpaginated, so { data } with no links/meta. */
export interface DepartmentsResponse {
  data: Department[];
}

/** POST and PATCH both take just the name. */
export interface SaveDepartmentRequest {
  name: string;
}

export interface DeleteDepartmentResponse {
  message: string;
  code: string;
}
