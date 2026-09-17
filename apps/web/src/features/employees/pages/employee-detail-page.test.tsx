import { screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { registerTokenGetter } from "@/lib/api/client"
import { maria, mariaAllowance, separatedAna } from "@/test/fixtures"
import { jsonResponse, mockApi } from "@/test/mock-api"
import { renderPage } from "@/test/render"
import { EmployeeDetailPage } from "./employee-detail-page"

const PATH = "/app/employees/:id"

describe("EmployeeDetailPage", () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    registerTokenGetter(() => "test-token")
  })

  it("shows the whole record, formatted for reading", async () => {
    mockApi({ "GET /company/employees/1": maria, "GET /company/employees/1/allowance": mariaAllowance })

    renderPage(<EmployeeDetailPage />, { url: "/app/employees/1", path: PATH })

    expect(await screen.findByRole("heading", { name: "Maria Santos" })).toBeInTheDocument()
    expect(screen.getByText("Accountant · Finance")).toBeInTheDocument()
    expect(screen.getByText("Reyes")).toBeInTheDocument()
    expect(screen.getByText("+63 917 000 0001")).toBeInTheDocument()
    expect(screen.getByText("May 14, 1992")).toBeInTheDocument()
    expect(screen.getByText("Mar 1, 2024")).toBeInTheDocument()
    expect(screen.getByText("Regular")).toBeInTheDocument()
    expect(screen.getByText("EMP-0001")).toBeInTheDocument()
    // Not separated, so no separation date row.
    expect(screen.queryByText("Separated on")).not.toBeInTheDocument()
    expect(screen.getByText("₱1,500.00")).toBeInTheDocument()
    expect(screen.getByText("Monthly allowance")).toBeInTheDocument()
  })

  it("pauses an active employee with one click", async () => {
    const api = mockApi({
      "GET /company/employees/1": maria,
      "GET /company/employees/1/allowance": mariaAllowance,
      "PATCH /company/employees/1": { ...maria, status: "inactive" },
    })
    const user = userEvent.setup()

    renderPage(<EmployeeDetailPage />, { url: "/app/employees/1", path: PATH })

    await user.click(await screen.findByRole("button", { name: "Set inactive" }))

    await vi.waitFor(() =>
      expect(api.callsTo("PATCH /company/employees/1")[0]?.body).toEqual({ status: "inactive" }),
    )
  })

  it("asks for the date before marking someone as separated", async () => {
    const api = mockApi({
      "GET /company/employees/1": maria,
      "GET /company/employees/1/allowance": mariaAllowance,
      "PATCH /company/employees/1": { ...maria, status: "separated", separated_at: "2026-08-31" },
    })
    const user = userEvent.setup()

    renderPage(<EmployeeDetailPage />, { url: "/app/employees/1", path: PATH })

    await user.click(await screen.findByRole("button", { name: "Mark as separated" }))
    const dialog = await screen.findByRole("dialog")

    const date = within(dialog).getByLabelText("Separation date")
    await user.clear(date)
    await user.type(date, "2026-08-31")
    await user.click(within(dialog).getByRole("button", { name: "Mark as separated" }))

    await vi.waitFor(() =>
      expect(api.callsTo("PATCH /company/employees/1")[0]?.body).toEqual({
        status: "separated",
        separated_at: "2026-08-31",
      }),
    )
  })

  it("shows when a separated employee left, and offers to reinstate rather than separate again", async () => {
    mockApi({ "GET /company/employees/5": separatedAna, "GET /company/employees/5/allowance": { employee_id: 5, balance_cents: 0, transactions: [] } })

    renderPage(<EmployeeDetailPage />, { url: "/app/employees/5", path: PATH })

    expect(await screen.findByRole("heading", { name: "Ana Cruz" })).toBeInTheDocument()
    expect(screen.getByText("Separated")).toBeInTheDocument()
    expect(screen.getByText("Separated on")).toBeInTheDocument()
    expect(screen.getByText("Aug 31, 2026")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Reinstate" })).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Mark as separated" })).not.toBeInTheDocument()
  })

  it("says so plainly when the employee doesn't exist (or isn't this company's)", async () => {
    mockApi({
      "GET /company/employees/99": () => jsonResponse(404, { message: "Resource not found.", code: "not_found" }),
    })

    renderPage(<EmployeeDetailPage />, { url: "/app/employees/99", path: PATH })

    expect(await screen.findByText("Employee not found")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Back to employees" })).toHaveAttribute("href", "/app/employees")
  })

  it("grants allowance to an active employee", async () => {
    const api = mockApi({
      "GET /company/employees/1": maria,
      "GET /company/employees/1/allowance": mariaAllowance,
      "POST /company/employees/1/allowance/grants": { ...mariaAllowance, balance_cents: 175000 },
    })
    const user = userEvent.setup()

    renderPage(<EmployeeDetailPage />, { url: "/app/employees/1", path: PATH })

    await user.click(await screen.findByRole("button", { name: "Grant" }))
    const dialog = await screen.findByRole("dialog")
    await user.type(within(dialog).getByLabelText("Amount (PHP)"), "250.00")
    await user.type(within(dialog).getByLabelText("Reason"), "Performance award")
    await user.click(within(dialog).getByRole("button", { name: "Grant allowance" }))

    await vi.waitFor(() =>
      expect(api.callsTo("POST /company/employees/1/allowance/grants")[0]?.body).toMatchObject({
        amount_cents: 25000,
        reason: "Performance award",
      }),
    )
  })

  it("treats a non-numeric id as not found without calling the API", () => {
    const api = mockApi({})

    renderPage(<EmployeeDetailPage />, { url: "/app/employees/abc", path: PATH })

    expect(screen.getByText("Employee not found")).toBeInTheDocument()
    expect(api.calls).toHaveLength(0)
  })
})
