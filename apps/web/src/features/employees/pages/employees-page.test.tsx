import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter } from "react-router-dom"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { registerTokenGetter } from "@/lib/api/client"
import { EmployeesPage } from "./employees-page"

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  })
}

const maria = {
  id: 1,
  employee_no: "EMP-0001",
  first_name: "Maria",
  last_name: "Santos",
  full_name: "Maria Santos",
  email: "maria.santos@companyone.test",
  mobile: null,
  department: "Finance",
  job_title: "Accountant",
  hired_at: "2024-03-01",
  status: "active",
  has_account: false,
  created_at: "2026-09-16T00:00:00.000000Z",
  updated_at: "2026-09-16T00:00:00.000000Z",
}

const jose = {
  ...maria,
  id: 2,
  employee_no: "EMP-0002",
  first_name: "Jose",
  last_name: "Reyes",
  full_name: "Jose Reyes",
  email: "jose.reyes@companyone.test",
  department: "Operations",
  job_title: "Supervisor",
  status: "inactive",
}

/**
 * A Response body can only be read once, so every fetch call gets a fresh
 * one: the list is fetched again after a mutation, and TanStack Query may
 * refetch on its own.
 */
function mockList(data: unknown[], overrides: Record<string, unknown> = {}) {
  return vi.spyOn(globalThis, "fetch").mockImplementation(async () =>
    jsonResponse(200, {
      data,
      links: {},
      meta: { current_page: 1, last_page: 1, per_page: 25, total: data.length, from: 1, to: data.length, ...overrides },
    }),
  )
}

function renderPage(url = "/app/employees") {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[url]}>
        <EmployeesPage />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe("EmployeesPage", () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    registerTokenGetter(() => "test-token")
  })

  it("lists the roster from the API with status badges and a total", async () => {
    mockList([maria, jose])

    renderPage()

    expect(await screen.findByText("Maria Santos")).toBeInTheDocument()
    expect(screen.getByText("Jose Reyes")).toBeInTheDocument()
    expect(screen.getByText("jose.reyes@companyone.test")).toBeInTheDocument()
    expect(screen.getByText("Active")).toBeInTheDocument()
    expect(screen.getByText("Inactive")).toBeInTheDocument()
    expect(screen.getByText("2 employees")).toBeInTheDocument()
  })

  it("puts the URL's filters on the request", async () => {
    const fetchSpy = mockList([jose])

    renderPage("/app/employees?status=inactive&search=reyes&page=2")

    expect(await screen.findByText("Jose Reyes")).toBeInTheDocument()
    const [url] = fetchSpy.mock.calls[0]!
    expect(String(url)).toMatch(/\/company\/employees\?status=inactive&search=reyes&page=2$/)
    expect(screen.getByRole("button", { name: "Clear filters" })).toBeInTheDocument()
  })

  it("shows the empty state with a call to action when the roster is empty", async () => {
    mockList([])

    renderPage()

    expect(await screen.findByText("No employees yet")).toBeInTheDocument()
    expect(screen.getByText("Add your first employee to get started.")).toBeInTheDocument()
  })

  it("shows the error state with a retry when the request fails", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(async () =>
      jsonResponse(500, { message: "Server error.", code: "server_error" }),
    )

    renderPage()

    expect(await screen.findByText("Server error.")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Retry" })).toBeInTheDocument()
  })

  it("opens the add-employee dialog", async () => {
    mockList([maria])
    const user = userEvent.setup()

    renderPage()
    await screen.findByText("Maria Santos")

    await user.click(screen.getByRole("button", { name: "Add employee" }))

    expect(await screen.findByRole("heading", { name: "Add employee" })).toBeInTheDocument()
    expect(screen.getByLabelText("First name")).toBeInTheDocument()
    expect(screen.getByLabelText("Email")).toBeInTheDocument()
    // Status is only editable on an existing employee; a new one is always
    // active. Checked by id: the page's status FILTER is also labelled
    // "Status", so a label query would find that instead.
    expect(document.getElementById("employee-status")).toBeNull()
  })

  it("opens the edit dialog pre-filled for a row", async () => {
    mockList([maria])
    const user = userEvent.setup()

    renderPage()
    await screen.findByText("Maria Santos")

    await user.click(screen.getByRole("button", { name: "Edit Maria Santos" }))

    expect(await screen.findByRole("heading", { name: "Edit Maria Santos" })).toBeInTheDocument()
    expect(screen.getByLabelText("First name")).toHaveValue("Maria")
    expect(screen.getByLabelText("Employee number")).toHaveValue("EMP-0001")
    expect(screen.getByLabelText("Date hired")).toHaveValue("2024-03-01")
  })
})
