import { screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { registerTokenGetter } from "@/lib/api/client"
import { saveBlob } from "@/lib/download"
import { finance, jose, maria, operations } from "@/test/fixtures"
import { jsonResponse, mockApi, paginated } from "@/test/mock-api"
import { renderPage } from "@/test/render"
import { EmployeesPage } from "./employees-page"

// The real saveBlob clicks a download link, which jsdom can't follow.
vi.mock("@/lib/download", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/download")>()),
  saveBlob: vi.fn(),
}))

const URL = "/app/employees"
const departments = { data: [finance, operations] }

describe("EmployeesPage", () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    vi.mocked(saveBlob).mockClear()
    registerTokenGetter(() => "test-token")
  })

  it("lists the roster with department, status and a total, linking each name to its page", async () => {
    mockApi({
      "GET /company/employees": paginated([maria, jose]),
      "GET /company/departments": departments,
    })

    renderPage(<EmployeesPage />, { url: URL })

    expect(await screen.findByRole("link", { name: "Maria Santos" })).toHaveAttribute("href", "/app/employees/1")
    expect(screen.getByText("jose.reyes@companyone.test")).toBeInTheDocument()

    const mariaRow = screen.getByText("Maria Santos").closest("tr")!
    expect(within(mariaRow).getByText("Finance")).toBeInTheDocument()
    expect(within(mariaRow).getByText("Regular")).toBeInTheDocument()
    expect(within(mariaRow).getByText("Active")).toBeInTheDocument()

    const joseRow = screen.getByText("Jose Reyes").closest("tr")!
    expect(within(joseRow).getByText("Part-time")).toBeInTheDocument()
    expect(within(joseRow).getByText("Inactive")).toBeInTheDocument()

    expect(screen.getByText("2 employees")).toBeInTheDocument()
  })

  it("puts every filter in the URL on the request", async () => {
    const api = mockApi({
      "GET /company/employees": paginated([jose]),
      "GET /company/departments": departments,
    })

    renderPage(<EmployeesPage />, {
      url: `${URL}?status=inactive&employment_type=part_time&department_id=3&search=reyes&page=2`,
    })

    expect(await screen.findByText("Jose Reyes")).toBeInTheDocument()
    expect(api.callsTo("GET /company/employees")[0]?.search).toBe(
      "?status=inactive&employment_type=part_time&department_id=3&search=reyes&page=2",
    )
    expect(screen.getByRole("button", { name: "Clear filters" })).toBeInTheDocument()
  })

  it("ignores filter values it doesn't recognise rather than sending them", async () => {
    const api = mockApi({
      "GET /company/employees": paginated([maria]),
      "GET /company/departments": departments,
    })

    renderPage(<EmployeesPage />, { url: `${URL}?status=retired&department_id=abc` })

    await screen.findByText("Maria Santos")
    expect(api.callsTo("GET /company/employees")[0]?.search).toBe("")
  })

  it("shows the empty state, offering the import as well as the form", async () => {
    mockApi({
      "GET /company/employees": paginated([]),
      "GET /company/departments": departments,
    })

    renderPage(<EmployeesPage />, { url: URL })

    expect(await screen.findByText("No employees yet")).toBeInTheDocument()
    expect(screen.getByText(/import your whole roster from a CSV file/)).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Import" })).toHaveAttribute("href", "/app/employees/import")
    expect(screen.getByRole("link", { name: "Departments" })).toHaveAttribute("href", "/app/employees/departments")
  })

  it("shows the error state with a retry when the request fails", async () => {
    mockApi({
      "GET /company/employees": () => jsonResponse(500, { message: "Server error.", code: "server_error" }),
      "GET /company/departments": departments,
    })

    renderPage(<EmployeesPage />, { url: URL })

    expect(await screen.findByText("Server error.")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Retry" })).toBeInTheDocument()
  })

  it("exports exactly what the filters match, not the current page", async () => {
    const api = mockApi({
      "GET /company/employees": paginated([maria], { current_page: 2, last_page: 3 }),
      "GET /company/departments": departments,
      "GET /company/employees/export": () =>
        new Response("employee_no\r\n", { status: 200, headers: { "Content-Type": "text/csv" } }),
    })
    const user = userEvent.setup()

    renderPage(<EmployeesPage />, { url: `${URL}?status=active&page=2` })
    await screen.findByText("Maria Santos")

    await user.click(screen.getByRole("button", { name: "Export" }))

    await vi.waitFor(() => expect(saveBlob).toHaveBeenCalledOnce())
    expect(api.callsTo("GET /company/employees/export")[0]?.search).toBe("?status=active")
    expect(vi.mocked(saveBlob).mock.calls[0]?.[1]).toMatch(/^employees-\d{4}-\d{2}-\d{2}\.csv$/)
  })

  it("adds an employee with the department and type chosen in the form", async () => {
    const api = mockApi({
      "GET /company/employees": paginated([maria]),
      "GET /company/departments": departments,
      "POST /company/employees": ({ body }) => jsonResponse(201, { ...jose, ...(body as object), id: 9 }),
    })
    const user = userEvent.setup()

    renderPage(<EmployeesPage />, { url: URL })
    await screen.findByText("Maria Santos")

    await user.click(screen.getByRole("button", { name: "Add employee" }))
    const dialog = await screen.findByRole("dialog")

    // Status only exists on an existing employee; a new one is always active.
    expect(dialog.querySelector("#employee-status")).toBeNull()

    await user.type(within(dialog).getByLabelText("First name"), "Ana")
    await user.type(within(dialog).getByLabelText("Last name"), "Cruz")
    await user.type(within(dialog).getByLabelText("Email"), "ana.cruz@companyone.test")
    await user.type(within(dialog).getByLabelText("Mobile"), "0917 123 4567")
    await user.click(within(dialog).getByRole("button", { name: "Add employee" }))

    await vi.waitFor(() => expect(api.callsTo("POST /company/employees")).toHaveLength(1))
    expect(api.callsTo("POST /company/employees")[0]?.body).toEqual({
      first_name: "Ana",
      middle_name: null,
      last_name: "Cruz",
      suffix: null,
      email: "ana.cruz@companyone.test",
      employee_no: null,
      // Sent as typed; the API is the one place that normalizes it.
      mobile: "0917 123 4567",
      birthdate: null,
      department_id: null,
      job_title: null,
      employment_type: "regular",
      hired_at: null,
    })
  })

  it("puts the API's field errors on the inputs they belong to", async () => {
    mockApi({
      "GET /company/employees": paginated([maria]),
      "GET /company/departments": departments,
      "POST /company/employees": () =>
        jsonResponse(422, {
          message: "An employee with this email address already exists.",
          code: "employee_email_taken",
          errors: { email: ["An employee with this email address already exists."] },
        }),
    })
    const user = userEvent.setup()

    renderPage(<EmployeesPage />, { url: URL })
    await screen.findByText("Maria Santos")

    await user.click(screen.getByRole("button", { name: "Add employee" }))
    const dialog = await screen.findByRole("dialog")
    await user.type(within(dialog).getByLabelText("First name"), "Maria")
    await user.type(within(dialog).getByLabelText("Last name"), "Santos")
    await user.type(within(dialog).getByLabelText("Email"), "maria.santos@companyone.test")
    await user.click(within(dialog).getByRole("button", { name: "Add employee" }))

    expect(await within(dialog).findByText("An employee with this email address already exists.")).toBeInTheDocument()
    expect(within(dialog).getByLabelText("Email")).toHaveAttribute("aria-invalid", "true")
  })

  it("opens the edit dialog pre-filled, with status and the employee's department", async () => {
    mockApi({
      "GET /company/employees": paginated([maria]),
      "GET /company/departments": departments,
    })
    const user = userEvent.setup()

    renderPage(<EmployeesPage />, { url: URL })
    await screen.findByText("Maria Santos")

    await user.click(screen.getByRole("button", { name: "Edit Maria Santos" }))
    const dialog = await screen.findByRole("dialog")

    expect(within(dialog).getByRole("heading", { name: "Edit Maria Santos" })).toBeInTheDocument()
    expect(within(dialog).getByLabelText("First name")).toHaveValue("Maria")
    expect(within(dialog).getByLabelText("Middle name")).toHaveValue("Reyes")
    expect(within(dialog).getByLabelText("Employee number")).toHaveValue("EMP-0001")
    expect(within(dialog).getByLabelText("Date hired")).toHaveValue("2024-03-01")
    expect(within(dialog).getByLabelText("Birthdate")).toHaveValue("1992-05-14")
    expect(dialog.querySelector("#employee-department")).toHaveTextContent("Finance")
    expect(dialog.querySelector("#employee-status")).toHaveTextContent("Active")
  })
})
