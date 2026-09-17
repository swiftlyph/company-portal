import { vi } from "vitest"

export function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  })
}

/** Laravel's paginated envelope around a list of rows. */
export function paginated(data: unknown[], meta: Record<string, unknown> = {}) {
  return {
    data,
    links: {},
    meta: { current_page: 1, last_page: 1, per_page: 25, total: data.length, from: 1, to: data.length, ...meta },
  }
}

export interface MockedCall {
  method: string
  /** Path below the API base, e.g. "/company/employees/3". */
  path: string
  search: string
  /** Parsed JSON, the FormData itself, or undefined. */
  body: unknown
}

type Handler = (call: MockedCall) => unknown

/** A plain value a route can hold; it is sent back as 200 JSON. */
type JsonBody = Record<string, unknown> | unknown[] | string | number | boolean | null

/**
 * Spelled out rather than `unknown`, which would swallow the union and
 * leave an inline handler's `call` parameter untyped.
 */
type Route = Handler | JsonBody

/**
 * A URL-aware fetch mock: routes are keyed "METHOD /path" and hold either
 * a handler or a plain value (sent as 200 JSON). Pages here call several
 * endpoints at once (a list, its departments, a mutation), so a mock that
 * answers every request with the same body is no longer good enough.
 *
 * A fresh Response is built per call (a body can only be read once), and
 * an unrouted request is a loud 501 rather than a silent hang.
 */
export function mockApi(routes: Record<string, Route>) {
  const calls: MockedCall[] = []

  const spy = vi.spyOn(globalThis, "fetch").mockImplementation(async (input, init) => {
    const url = new URL(String(input), "http://localhost")
    const method = (init?.method ?? "GET").toUpperCase()
    // Everything from the portal's first path segment on, whatever the
    // configured API base is (or isn't, in CI).
    const path = /\/(?:company|auth)\/.*$/.exec(url.pathname)?.[0] ?? url.pathname

    let body: unknown = undefined
    if (init?.body instanceof FormData) {
      body = init.body
    } else if (typeof init?.body === "string") {
      body = JSON.parse(init.body)
    }

    const call: MockedCall = { method, path, search: url.search, body }
    calls.push(call)

    const route = routes[`${method} ${path}`]
    if (route === undefined) {
      return jsonResponse(501, { message: `No mock for ${method} ${path}`, code: "no_mock" })
    }

    const result = typeof route === "function" ? route(call) : route
    return result instanceof Response ? result : jsonResponse(200, result)
  })

  return {
    spy,
    calls,
    /** The calls made to one route, in order. */
    callsTo: (key: string) => calls.filter((call) => `${call.method} ${call.path}` === key),
  }
}
