import { beforeEach, describe, expect, it, vi } from "vitest"
import {
  api,
  ApiError,
  registerOnCompanyInactive,
  registerOnUnauthorized,
  registerTokenGetter,
} from "./client"

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  })
}

describe("api client", () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    registerTokenGetter(() => null)
    registerOnUnauthorized(() => {})
    registerOnCompanyInactive(() => {})
  })

  it("returns parsed JSON on a 2xx response", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(jsonResponse(200, { id: 1, name: "Company One" }))

    const result = await api.get<{ id: number; name: string }>("/company/profile")

    expect(result).toEqual({ id: 1, name: "Company One" })
  })

  it("injects the bearer token from the registered getter", async () => {
    registerTokenGetter(() => "abc123")
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(jsonResponse(200, {}))

    await api.get("/company/profile")

    const [, init] = fetchSpy.mock.calls[0]!
    const headers = new Headers(init?.headers)
    expect(headers.get("Authorization")).toBe("Bearer abc123")
  })

  it("sends a plain body as JSON", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(jsonResponse(201, {}))

    await api.post("/company/departments", { name: "Finance" })

    const [, init] = fetchSpy.mock.calls[0]!
    expect(new Headers(init?.headers).get("Content-Type")).toBe("application/json")
    expect(init?.body).toBe('{"name":"Finance"}')
  })

  it("passes a FormData body through untouched, leaving Content-Type to the browser", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(jsonResponse(200, {}))
    const form = new FormData()
    form.append("mode", "preview")

    await api.post("/company/employees/import", form)

    const [, init] = fetchSpy.mock.calls[0]!
    // Setting it by hand would drop the multipart boundary.
    expect(new Headers(init?.headers).has("Content-Type")).toBe(false)
    expect(init?.body).toBe(form)
  })

  it("downloads a file response as a Blob, with the token attached", async () => {
    registerTokenGetter(() => "abc123")
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response("employee_no,first_name\r\n", { status: 200, headers: { "Content-Type": "text/csv" } }))

    const blob = await api.download("/company/employees/export?status=active")

    // Size, not text(): the test environment's Blob has no text() method.
    expect(blob.size).toBe("employee_no,first_name\r\n".length)
    const [url, init] = fetchSpy.mock.calls[0]!
    expect(String(url)).toMatch(/\/company\/employees\/export\?status=active$/)
    expect(new Headers(init?.headers).get("Authorization")).toBe("Bearer abc123")
  })

  it("still throws an ApiError when a download is refused", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      jsonResponse(403, { message: "Your company account is not active.", code: "company_inactive" }),
    )

    await expect(api.download("/company/employees/export")).rejects.toMatchObject({
      status: 403,
      code: "company_inactive",
    })
  })

  it("normalizes a 422 into an ApiError exposing the field errors map", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      jsonResponse(422, {
        message: "An employee with this email address already exists.",
        code: "employee_email_taken",
        errors: { email: ["An employee with this email address already exists."] },
      }),
    )

    await expect(api.post("/company/employees", {})).rejects.toMatchObject({
      status: 422,
      code: "employee_email_taken",
      errors: { email: ["An employee with this email address already exists."] },
    })
  })

  it("triggers the registered onUnauthorized callback on a 401", async () => {
    const onUnauthorized = vi.fn()
    registerOnUnauthorized(onUnauthorized)
    vi.spyOn(globalThis, "fetch").mockResolvedValue(jsonResponse(401, { message: "Unauthenticated." }))

    await expect(api.get("/company/profile")).rejects.toBeInstanceOf(ApiError)
    expect(onUnauthorized).toHaveBeenCalledOnce()
  })

  it("skips onUnauthorized when the call opted out", async () => {
    const onUnauthorized = vi.fn()
    registerOnUnauthorized(onUnauthorized)
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      jsonResponse(401, { message: "These credentials do not match our records.", code: "invalid_credentials" }),
    )

    await expect(api.post("/auth/login", {}, { suppressUnauthorized: true })).rejects.toMatchObject({
      code: "invalid_credentials",
    })
    expect(onUnauthorized).not.toHaveBeenCalled()
  })

  it("triggers the registered onCompanyInactive callback on a 403 company_inactive only", async () => {
    const onCompanyInactive = vi.fn()
    registerOnCompanyInactive(onCompanyInactive)
    const fetchSpy = vi.spyOn(globalThis, "fetch")

    fetchSpy.mockResolvedValueOnce(
      jsonResponse(403, { message: "Your company account is not active.", code: "company_inactive" }),
    )
    await expect(api.get("/company/employees")).rejects.toMatchObject({ code: "company_inactive" })
    expect(onCompanyInactive).toHaveBeenCalledOnce()

    fetchSpy.mockResolvedValueOnce(jsonResponse(403, { message: "This action is unauthorized.", code: "forbidden" }))
    await expect(api.get("/company/employees")).rejects.toMatchObject({ code: "forbidden" })
    expect(onCompanyInactive).toHaveBeenCalledOnce()
  })

  it("normalizes a network failure into an ApiError", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new TypeError("Failed to fetch"))

    const error = await api.get("/company/profile").catch((e: unknown) => e)

    expect(error).toBeInstanceOf(ApiError)
    expect((error as ApiError).status).toBe(0)
  })
})
