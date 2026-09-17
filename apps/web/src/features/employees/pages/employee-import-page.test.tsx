import { screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { registerTokenGetter } from "@/lib/api/client"
import { jsonResponse, mockApi } from "@/test/mock-api"
import { renderPage } from "@/test/render"
import { EmployeeImportPage } from "./employee-import-page"

const URL = "/app/employees/import"

const rows = [
  { line: 2, action: "create", employee_no: "EMP-0009", first_name: "Ana", last_name: "Cruz", email: "ana.cruz@companyone.test", errors: null },
  { line: 3, action: "update", employee_no: "EMP-0001", first_name: "Maria", last_name: "Santos", email: "maria.santos@companyone.test", errors: null },
  {
    line: 4,
    action: "invalid",
    employee_no: null,
    first_name: "Jo",
    last_name: null,
    email: "not-an-email",
    errors: {
      last_name: ["The last name field is required."],
      email: ["The email field must be a valid email address."],
    },
  },
]

function report(mode: "preview" | "commit") {
  return {
    mode,
    summary: { total: 3, create: 1, update: 1, unchanged: 0, invalid: 1 },
    ignored_columns: ["Notes"],
    rows,
  }
}

function csvFile() {
  return new File(["first_name,last_name,email\nAna,Cruz,ana.cruz@companyone.test\n"], "roster.csv", { type: "text/csv" })
}

describe("EmployeeImportPage", () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    registerTokenGetter(() => "test-token")
  })

  it("previews the chosen file first, then imports it on confirmation", async () => {
    const api = mockApi({
      "POST /company/employees/import": ({ body }) => report((body as FormData).get("mode") as "preview" | "commit"),
    })
    const user = userEvent.setup()

    renderPage(<EmployeeImportPage />, { url: URL })

    await user.upload(screen.getByLabelText("Roster file"), csvFile())

    // The preview: nothing saved yet, every row accounted for.
    expect(await screen.findByText("2. Check the preview")).toBeInTheDocument()
    expect(screen.getByText(/Nothing has been saved yet/)).toBeInTheDocument()
    expect(screen.getByText("1 new")).toBeInTheDocument()
    expect(screen.getByText("1 to update")).toBeInTheDocument()
    expect(screen.getByText("1 with problems")).toBeInTheDocument()
    expect(screen.getByText("Notes")).toBeInTheDocument()

    const problemRow = screen.getByText("not-an-email").closest("tr")!
    expect(within(problemRow).getByText("Problem")).toBeInTheDocument()
    expect(within(problemRow).getByText("The last name field is required.")).toBeInTheDocument()

    const upload = api.callsTo("POST /company/employees/import")[0]?.body as FormData
    expect(upload.get("mode")).toBe("preview")
    expect((upload.get("file") as File).name).toBe("roster.csv")

    // Only the rows that would be written are counted on the button.
    await user.click(screen.getByRole("button", { name: "Import 2 employees" }))

    expect(await screen.findByText("Import finished")).toBeInTheDocument()
    expect(screen.getByText(/1 added, 1 updated, 0 unchanged/)).toBeInTheDocument()
    expect(screen.getByText(/1 row was skipped/)).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "View employees" })).toHaveAttribute("href", "/app/employees")

    const commit = api.callsTo("POST /company/employees/import")[1]?.body as FormData
    expect(commit.get("mode")).toBe("commit")
    expect((commit.get("file") as File).name).toBe("roster.csv")
  })

  it("shows the API's reason when the file can't be read at all", async () => {
    mockApi({
      "POST /company/employees/import": () =>
        jsonResponse(422, {
          message: "The file is missing required columns: email.",
          code: "invalid_import_file",
          errors: { file: ["The file is missing required columns: email."] },
        }),
    })
    const user = userEvent.setup()

    renderPage(<EmployeeImportPage />, { url: URL })
    await user.upload(screen.getByLabelText("Roster file"), csvFile())

    expect(await screen.findByText("This file can't be imported")).toBeInTheDocument()
    expect(screen.getByText("The file is missing required columns: email.")).toBeInTheDocument()
    expect(screen.queryByText("2. Check the preview")).not.toBeInTheDocument()
  })

  it("has nothing to import when every row is unchanged or invalid", async () => {
    mockApi({
      "POST /company/employees/import": {
        mode: "preview",
        summary: { total: 1, create: 0, update: 0, unchanged: 1, invalid: 0 },
        ignored_columns: [],
        rows: [{ ...rows[1], action: "unchanged" }],
      },
    })
    const user = userEvent.setup()

    renderPage(<EmployeeImportPage />, { url: URL })
    await user.upload(screen.getByLabelText("Roster file"), csvFile())

    expect(await screen.findByRole("button", { name: "Nothing to import" })).toBeDisabled()
  })

  it("tells the person which columns a file needs", () => {
    mockApi({})

    renderPage(<EmployeeImportPage />, { url: URL })

    expect(screen.getByText("first_name, last_name, email")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Download template" })).toBeInTheDocument()
  })
})
