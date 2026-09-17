/**
 * The CSV a company downloads to fill in. The header is exactly the
 * import's column list (ImportEmployeesAction::COLUMNS), in the order the
 * export writes them, and the one example row shows each format the API
 * expects: ISO dates, an employment type from the catalog, a department by
 * name.
 */
export const IMPORT_TEMPLATE_FILENAME = "employees-template.csv"

const HEADER = [
  "employee_no",
  "first_name",
  "middle_name",
  "last_name",
  "suffix",
  "email",
  "mobile",
  "department",
  "job_title",
  "employment_type",
  "hired_at",
  "birthdate",
]

const EXAMPLE = [
  "EMP-0001",
  "Maria",
  "Reyes",
  "Santos",
  "",
  "maria.santos@yourcompany.com",
  "0917 123 4567",
  "Finance",
  "Accountant",
  "regular",
  "2024-03-01",
  "1992-05-14",
]

export const IMPORT_TEMPLATE = `${HEADER.join(",")}\r\n${EXAMPLE.join(",")}\r\n`

export const IMPORT_REQUIRED_COLUMNS = ["first_name", "last_name", "email"]

export const IMPORT_OPTIONAL_COLUMNS = HEADER.filter((column) => !IMPORT_REQUIRED_COLUMNS.includes(column))
