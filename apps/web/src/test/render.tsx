import type { ReactElement } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { render } from "@testing-library/react"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { LocationProbe } from "./location-probe"

interface RenderOptions {
  /** The URL the page is opened at. */
  url: string
  /** The route pattern the page is mounted on, when it reads params (e.g. "/app/employees/:id"). */
  path?: string
}

/**
 * Renders a page the way the app does: inside a QueryClient (no retries,
 * so an error state shows at once) and a router positioned at `url`. Any
 * other location renders the LocationProbe.
 */
export function renderPage(page: ReactElement, { url, path }: RenderOptions) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[url]}>
        <Routes>
          <Route path={path ?? url.split("?")[0]} element={page} />
          <Route path="*" element={<LocationProbe />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}
