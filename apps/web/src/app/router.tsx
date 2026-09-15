import { createBrowserRouter, Navigate } from "react-router-dom"
import { DashboardLayout } from "@/app/dashboard-layout"
import { PlaceholderPage } from "@/components/placeholder-page"
import { LoginPage } from "@/features/auth/pages/login-page"
import { InactivePage } from "@/features/auth/pages/inactive-page"
import { RequireActiveCompany } from "@/features/auth/require-active-company"
import { DashboardPage } from "@/features/dashboard/pages/dashboard-page"
import { EmployeesPage } from "@/features/employees/pages/employees-page"
import { NotFound } from "@/pages/not-found"

export const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/login" replace /> },
  { path: "/login", element: <LoginPage /> },
  { path: "/inactive", element: <InactivePage /> },
  {
    path: "/app",
    element: (
      <RequireActiveCompany>
        <DashboardLayout />
      </RequireActiveCompany>
    ),
    children: [
      { index: true, element: <Navigate to="/app/dashboard" replace /> },
      { path: "dashboard", element: <DashboardPage />, handle: { title: "Dashboard" } },
      { path: "employees", element: <EmployeesPage />, handle: { title: "Employees" } },

      // The other board cards (Merchants, Starter HRIS, Audit Trail) are
      // not built yet. They get real routes with placeholder content so
      // the nav is complete and a shared link lands somewhere sensible
      // rather than on a 404; swap each element for the real page when
      // its card starts.
      {
        path: "merchants",
        element: (
          <PlaceholderPage
            title="Merchants"
            description="Choose which merchants your employees can spend their allowance at."
          />
        ),
        handle: { title: "Merchants" },
      },
      {
        path: "hris",
        element: (
          <PlaceholderPage
            title="Starter HRIS"
            description="Basic payroll and HR records, built on top of the employee roster."
          />
        ),
        handle: { title: "Starter HRIS" },
      },
      {
        path: "audit-trail",
        element: (
          <PlaceholderPage
            title="Audit Trail"
            description="Who changed what, and when, across your company portal."
          />
        ),
        handle: { title: "Audit Trail" },
      },
    ],
  },
  { path: "*", element: <NotFound /> },
])
