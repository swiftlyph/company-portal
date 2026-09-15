import type { PropsWithChildren } from "react";
import { Navigate } from "react-router-dom";
import { RequireAuth } from "./require-auth";
import { selectIsCompanyActive, useAuthStore } from "./store";

/**
 * Wraps RequireAuth (guest -> /login) with the company-status check: an
 * authed user whose company is missing or not active is sent to /inactive
 * instead of the protected content. Mirrors the backend exactly: the
 * company.api group's EnsureCompanyActive 403s the same set of users.
 */
export function RequireActiveCompany({ children }: PropsWithChildren) {
  return (
    <RequireAuth>
      <ActiveCompanyGate>{children}</ActiveCompanyGate>
    </RequireAuth>
  );
}

function ActiveCompanyGate({ children }: PropsWithChildren) {
  const isActive = useAuthStore(selectIsCompanyActive);

  if (!isActive) {
    return <Navigate to="/inactive" replace />;
  }

  return <>{children}</>;
}
