/**
 * API-shaped fixtures (what gasa-api actually sends), kept in one place so
 * every test describes the same two employees and the same departments.
 */

export const finance = { id: 3, name: "Finance", employees_count: 2, created_at: "", updated_at: "" }

export const operations = { id: 4, name: "Operations", employees_count: 0, created_at: "", updated_at: "" }

export const maria = {
  id: 1,
  employee_no: "EMP-0001",
  first_name: "Maria",
  middle_name: "Reyes",
  last_name: "Santos",
  suffix: null,
  full_name: "Maria Santos",
  email: "maria.santos@companyone.test",
  mobile: "+639170000001",
  birthdate: "1992-05-14",
  department_id: 3,
  department: { id: 3, name: "Finance" },
  job_title: "Accountant",
  employment_type: "regular",
  hired_at: "2024-03-01",
  status: "active",
  separated_at: null,
  has_account: false,
  created_at: "2026-09-16T00:00:00.000000Z",
  updated_at: "2026-09-16T00:00:00.000000Z",
}

export const jose = {
  ...maria,
  id: 2,
  employee_no: "EMP-0002",
  first_name: "Jose",
  middle_name: null,
  last_name: "Reyes",
  full_name: "Jose Reyes",
  email: "jose.reyes@companyone.test",
  mobile: null,
  birthdate: null,
  department_id: null,
  department: null,
  job_title: "Supervisor",
  employment_type: "part_time",
  status: "inactive",
}

export const separatedAna = {
  ...maria,
  id: 5,
  employee_no: "EMP-0005",
  first_name: "Ana",
  last_name: "Cruz",
  full_name: "Ana Cruz",
  email: "ana.cruz@companyone.test",
  status: "separated",
  separated_at: "2026-08-31",
}

export const mariaAllowance = {
  employee_id: 1,
  purse: "allowance",
  balance_cents: 150000,
  transactions: [
    {
      id: 1,
      type: "grant",
      amount_cents: 150000,
      balance_after_cents: 150000,
      reason: "Monthly allowance",
      created_at: "2026-09-18T00:00:00.000000Z",
    },
  ],
}
