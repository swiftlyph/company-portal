import { Navigate } from "react-router-dom"
import { Button } from "@workspace/ui/components/button"
import type { CompanySummary } from "@/lib/api/types"
import { selectIsCompanyActive, useAuthStore } from "../store"
import { useLogout } from "../use-logout"

/**
 * /auth/me distinguishes three reasons a company admin can land here, and
 * they read very differently: no company at all, a company still awaiting
 * platform approval, or one that has been suspended.
 */
function inactiveCopyFor(company: CompanySummary | null): string {
  if (company === null) {
    return "This account isn't linked to a company yet. If you think this is a mistake, contact GASA support."
  }
  if (company.status === "pending") {
    return "Your company is awaiting approval. You'll be able to get started once it's approved."
  }
  return "Your company account is currently inactive."
}

/**
 * A calm, solid-surface full-page state, no shell. Self-guards like
 * LoginPage does: a guest lands here only via a stale link, and an active
 * company only via the mid-session refresh in company-guard.ts flipping
 * them back, so both redirect away rather than showing a stale state.
 */
export function InactivePage() {
  const status = useAuthStore((s) => s.status)
  const user = useAuthStore((s) => s.user)
  const isActive = useAuthStore(selectIsCompanyActive)
  const logout = useLogout()

  if (status === "guest") {
    return <Navigate to="/login" replace />
  }
  if (isActive) {
    return <Navigate to="/app" replace />
  }

  const company = user?.company ?? null

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background p-4 text-center">
      <h1 className="text-2xl font-bold">{company?.name ?? "Your company"}</h1>
      <p className="max-w-md text-muted-foreground">{inactiveCopyFor(company)}</p>
      <Button type="button" className="mt-2" onClick={() => logout.mutate()} disabled={logout.isPending}>
        Log out
      </Button>
    </div>
  )
}
