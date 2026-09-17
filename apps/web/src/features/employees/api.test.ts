import { beforeEach, describe, expect, it, vi } from "vitest"
import { registerTokenGetter } from "@/lib/api/client"
import { maria } from "@/test/fixtures"
import { mockApi, paginated } from "@/test/mock-api"
import {
  employeesQueryString,
  exportEmployees,
  fetchEmployeeAllowance,
  fetchEmployees,
  grantEmployeeAllowance,
  importEmployees,
} from "./api"

describe("employeesQueryString", () => {
  it("is empty for the default view", () => {
    expect(employeesQueryString({ page: 1 })).toBe("")
  })

  it("only puts non-default filters on the wire", () => {
    expect(
      employeesQueryString({
        page: 3,
        status: "separated",
        employment_type: "part_time",
        department_id: 7,
        search: "san tos",
        per_page: 50,
      }),
    ).toBe("?status=separated&employment_type=part_time&department_id=7&search=san+tos&page=3&per_page=50")
  })

  it("drops pagination for an export: it is every match, not the current page", () => {
    expect(employeesQueryString({ page: 3, per_page: 50, status: "active" }, { paginate: false })).toBe(
      "?status=active",
    )
  })
})

describe("employees api", () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    registerTokenGetter(() => null)
  })

  it("requests the filtered list and normalizes rows and pagination meta", async () => {
    const api = mockApi({
      "GET /company/employees": paginated(
        // An additive key the backend may grow later must pass through harmlessly.
        [{ ...maria, allowance_balance_cents: 1500 }],
        { current_page: 2, last_page: 4, total: 90, from: 26, to: 50 },
      ),
    })

    const result = await fetchEmployees({ page: 2, search: "santos", department_id: 3 })

    expect(api.calls[0]?.search).toBe("?department_id=3&search=santos&page=2")
    expect(result.data).toHaveLength(1)
    expect(result.data[0]).toMatchObject({
      id: 1,
      full_name: "Maria Santos",
      department: { id: 3, name: "Finance" },
      employment_type: "regular",
      separated_at: null,
    })
    expect(result.meta).toEqual({ current_page: 2, last_page: 4, per_page: 25, total: 90, from: 26, to: 50 })
  })

  it("fills in whatever a sparse row leaves out, so a render never crashes", async () => {
    mockApi({ "GET /company/employees": { data: [{ id: 1, first_name: "Jose", last_name: "Reyes", department: "Finance" }] } })

    const result = await fetchEmployees({ page: 1 })

    expect(result.data[0]).toMatchObject({
      full_name: "Jose Reyes",
      // A department that isn't the { id, name } block (the old free-text shape) reads as none.
      department: null,
      department_id: null,
      employment_type: "regular",
      status: "active",
      mobile: null,
    })
    expect(result.meta).toEqual({ current_page: 1, last_page: 1, per_page: 25, total: 0, from: null, to: null })
  })

  it("exports with the list's filters but none of its pagination", async () => {
    const api = mockApi({
      "GET /company/employees/export": () => new Response("employee_no\r\n", { status: 200, headers: { "Content-Type": "text/csv" } }),
    })

    const blob = await exportEmployees({ page: 4, per_page: 25, status: "active", department_id: 3 })

    expect(api.calls[0]?.search).toBe("?status=active&department_id=3")
    // Size, not text(): the test environment's Blob has no text() method.
    expect(blob.size).toBe("employee_no\r\n".length)
  })

  it("uploads the file with its mode and normalizes the report", async () => {
    const api = mockApi({
      "POST /company/employees/import": {
        mode: "preview",
        summary: { total: 2, create: 1, invalid: 1 },
        rows: [
          // PHP sends an empty array, not an empty object, for "no errors".
          { line: 2, action: "create", first_name: "Ana", last_name: "Cruz", email: "ana@companyone.test", errors: [] },
          { line: 3, action: "invalid", email: "nope", errors: { email: ["The email field must be a valid email address."] } },
        ],
      },
    })
    const file = new File(["first_name,last_name,email\n"], "roster.csv", { type: "text/csv" })

    const report = await importEmployees(file, "preview")

    const form = api.calls[0]?.body as FormData
    expect(form.get("mode")).toBe("preview")
    expect((form.get("file") as File).name).toBe("roster.csv")

    expect(report.summary).toEqual({ total: 2, create: 1, update: 0, unchanged: 0, invalid: 1 })
    expect(report.ignored_columns).toEqual([])
    expect(report.rows[0]?.errors).toBeNull()
    expect(report.rows[1]).toMatchObject({
      action: "invalid",
      first_name: null,
      errors: { email: ["The email field must be a valid email address."] },
    })
  })

  it("reads and grants an employee allowance", async () => {
    const api = mockApi({
      "GET /company/employees/1/allowance": {
        employee_id: 1,
        balance_cents: 150000,
        transactions: [{ id: 1, type: "grant", amount_cents: 150000, balance_after_cents: 150000 }],
      },
      "POST /company/employees/1/allowance/grants": {
        employee_id: 1,
        balance_cents: 250000,
        transactions: [],
      },
    })

    const allowance = await fetchEmployeeAllowance(1)
    const granted = await grantEmployeeAllowance(1, {
      amount_cents: 100000,
      reason: "Monthly allowance",
      idempotency_key: "grant-1",
    })

    expect(allowance).toMatchObject({ employee_id: 1, balance_cents: 150000 })
    expect(granted.balance_cents).toBe(250000)
    expect(api.callsTo("POST /company/employees/1/allowance/grants")[0]?.body).toEqual({
      amount_cents: 100000,
      reason: "Monthly allowance",
      idempotency_key: "grant-1",
    })
  })
})
