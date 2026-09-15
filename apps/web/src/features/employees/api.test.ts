import { beforeEach, describe, expect, it, vi } from "vitest"
import { registerTokenGetter } from "@/lib/api/client"
import { employeesQueryString, fetchEmployees } from "./api"

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  })
}

describe("employeesQueryString", () => {
  it("is empty for the default view", () => {
    expect(employeesQueryString({ page: 1 })).toBe("")
  })

  it("only puts non-default filters on the wire", () => {
    expect(employeesQueryString({ page: 3, status: "inactive", search: "san tos", per_page: 50 })).toBe(
      "?status=inactive&search=san+tos&page=3&per_page=50",
    )
  })
})

describe("fetchEmployees", () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    registerTokenGetter(() => null)
  })

  it("requests the filtered list and normalizes rows and pagination meta", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      jsonResponse(200, {
        data: [
          {
            id: 7,
            employee_no: "EMP-0001",
            first_name: "Maria",
            last_name: "Santos",
            full_name: "Maria Santos",
            email: "maria.santos@companyone.test",
            status: "active",
            has_account: false,
            // An additive key the backend may grow later must pass through harmlessly.
            wallet_balance_cents: 1500,
          },
        ],
        links: {},
        meta: { current_page: 2, last_page: 4, per_page: 25, total: 90, from: 26, to: 50 },
      }),
    )

    const result = await fetchEmployees({ page: 2, search: "santos" })

    const [url] = fetchSpy.mock.calls[0]!
    expect(String(url)).toMatch(/\/company\/employees\?search=santos&page=2$/)

    expect(result.data).toHaveLength(1)
    expect(result.data[0]).toMatchObject({
      id: 7,
      full_name: "Maria Santos",
      mobile: null,
      department: null,
      hired_at: null,
      status: "active",
    })
    expect(result.meta).toEqual({ current_page: 2, last_page: 4, per_page: 25, total: 90, from: 26, to: 50 })
  })

  it("derives full_name when the backend omits it and tolerates a missing meta block", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      jsonResponse(200, { data: [{ id: 1, first_name: "Jose", last_name: "Reyes" }] }),
    )

    const result = await fetchEmployees({ page: 1 })

    expect(result.data[0]?.full_name).toBe("Jose Reyes")
    expect(result.meta).toEqual({ current_page: 1, last_page: 1, per_page: 25, total: 0, from: null, to: null })
  })
})
