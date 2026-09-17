import { screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { registerTokenGetter } from "@/lib/api/client"
import { finance, operations } from "@/test/fixtures"
import { jsonResponse, mockApi } from "@/test/mock-api"
import { renderPage } from "@/test/render"
import { DepartmentsPage } from "./departments-page"

const URL = "/app/employees/departments"

describe("DepartmentsPage", () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    registerTokenGetter(() => "test-token")
  })

  it("lists departments with head counts, linking a count to the filtered roster", async () => {
    mockApi({ "GET /company/departments": { data: [finance, operations] } })

    renderPage(<DepartmentsPage />, { url: URL })

    expect(await screen.findByText("Finance")).toBeInTheDocument()
    expect(screen.getByText("Operations")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "2" })).toHaveAttribute("href", "/app/employees?department_id=3")
    // An empty department has nothing to link to.
    expect(screen.queryByRole("link", { name: "0" })).not.toBeInTheDocument()
  })

  it("shows the empty state, pointing at the import as the quick way in", async () => {
    mockApi({ "GET /company/departments": { data: [] } })

    renderPage(<DepartmentsPage />, { url: URL })

    expect(await screen.findByText("No departments yet")).toBeInTheDocument()
    expect(screen.getByText(/departments named in the file are created for you/)).toBeInTheDocument()
  })

  it("adds a department and refreshes the list", async () => {
    const departments = [finance]
    const api = mockApi({
      "GET /company/departments": () => ({ data: departments }),
      "POST /company/departments": ({ body }) => {
        const created = { ...operations, name: (body as { name: string }).name }
        departments.push(created)
        return jsonResponse(201, created)
      },
    })
    const user = userEvent.setup()

    renderPage(<DepartmentsPage />, { url: URL })
    await screen.findByText("Finance")

    await user.click(screen.getByRole("button", { name: "Add department" }))
    const dialog = await screen.findByRole("dialog")
    await user.type(within(dialog).getByLabelText("Name"), "  Operations ")
    await user.click(within(dialog).getByRole("button", { name: "Add department" }))

    expect(await screen.findByText("Operations")).toBeInTheDocument()
    // Trimmed before it is sent.
    expect(api.callsTo("POST /company/departments")[0]?.body).toEqual({ name: "Operations" })
    expect(api.callsTo("GET /company/departments").length).toBeGreaterThan(1)
  })

  it("puts a name collision on the field, in plain words", async () => {
    mockApi({
      "GET /company/departments": { data: [finance] },
      "POST /company/departments": () =>
        jsonResponse(422, {
          message: "A department with this name already exists.",
          code: "department_name_taken",
          errors: { name: ["A department with this name already exists."] },
        }),
    })
    const user = userEvent.setup()

    renderPage(<DepartmentsPage />, { url: URL })
    await screen.findByText("Finance")

    await user.click(screen.getByRole("button", { name: "Add department" }))
    const dialog = await screen.findByRole("dialog")
    await user.type(within(dialog).getByLabelText("Name"), "finance")
    await user.click(within(dialog).getByRole("button", { name: "Add department" }))

    expect(await within(dialog).findByText("You already have a department with this name.")).toBeInTheDocument()
  })

  it("renames a department", async () => {
    const api = mockApi({
      "GET /company/departments": { data: [finance] },
      "PATCH /company/departments/3": ({ body }) => ({ ...finance, name: (body as { name: string }).name }),
    })
    const user = userEvent.setup()

    renderPage(<DepartmentsPage />, { url: URL })
    await screen.findByText("Finance")

    await user.click(screen.getByRole("button", { name: "Rename Finance" }))
    const dialog = await screen.findByRole("dialog")
    const input = within(dialog).getByLabelText("Name")
    expect(input).toHaveValue("Finance")

    await user.clear(input)
    await user.type(input, "Treasury")
    await user.click(within(dialog).getByRole("button", { name: "Rename" }))

    expect(api.callsTo("PATCH /company/departments/3")[0]?.body).toEqual({ name: "Treasury" })
  })

  it("explains why a department with employees can't be deleted, instead of offering it", async () => {
    const api = mockApi({ "GET /company/departments": { data: [finance, operations] } })
    const user = userEvent.setup()

    renderPage(<DepartmentsPage />, { url: URL })
    await screen.findByText("Finance")

    await user.click(screen.getByRole("button", { name: "Delete Finance" }))
    const dialog = await screen.findByRole("alertdialog")

    expect(within(dialog).getByText("Finance still has employees")).toBeInTheDocument()
    expect(within(dialog).getByText(/2 employees are still assigned to it/)).toBeInTheDocument()
    expect(within(dialog).queryByRole("button", { name: "Delete" })).not.toBeInTheDocument()
    expect(api.callsTo("DELETE /company/departments/3")).toHaveLength(0)
  })

  it("deletes an empty department after confirming", async () => {
    const api = mockApi({
      "GET /company/departments": { data: [finance, operations] },
      "DELETE /company/departments/4": { message: "Department deleted.", code: "department_deleted" },
    })
    const user = userEvent.setup()

    renderPage(<DepartmentsPage />, { url: URL })
    await screen.findByText("Operations")

    await user.click(screen.getByRole("button", { name: "Delete Operations" }))
    const dialog = await screen.findByRole("alertdialog")
    await user.click(within(dialog).getByRole("button", { name: "Delete" }))

    await vi.waitFor(() => expect(api.callsTo("DELETE /company/departments/4")).toHaveLength(1))
  })
})
