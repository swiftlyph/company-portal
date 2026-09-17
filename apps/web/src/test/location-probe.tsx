import { useLocation } from "react-router-dom"

/**
 * Rendered for any route a test didn't mount, so a test can assert that a
 * navigation happened ("Navigated to /app/employees") without pulling in
 * the real destination page.
 */
export function LocationProbe() {
  const location = useLocation()

  return (
    <p>
      Navigated to {location.pathname}
      {location.search}
    </p>
  )
}
