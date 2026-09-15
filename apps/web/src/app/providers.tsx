import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { RouterProvider } from "react-router-dom"
import { TooltipProvider } from "@workspace/ui/components/tooltip"
import { FullScreenLoader } from "@/components/full-screen-loader"
import { Toaster } from "@/components/toaster"
import { useAuthStore } from "@/features/auth/store"
import { useAuthBoot } from "@/features/auth/use-auth-boot"
import { setQueryClientClear, setSessionNavigator } from "@/features/auth/session"
import { setCompanyGuardNavigator } from "@/features/auth/company-guard"
import { router } from "./router"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

// Wired once, at module load: session.ts's onUnauthorized handler and
// company-guard.ts's company_inactive handler need these but shouldn't
// otherwise depend on the router or query client.
setQueryClientClear(() => queryClient.clear())
setSessionNavigator((path) => void router.navigate(path))
setCompanyGuardNavigator((path) => void router.navigate(path))

/**
 * Gates the whole router behind the boot check: while status is "booting"
 * every route, guarded or not, renders a loader instead, so a refresh on
 * an authed session never flashes /login first.
 */
function AuthGate() {
  useAuthBoot()
  const status = useAuthStore((s) => s.status)

  if (status === "booting") {
    return <FullScreenLoader />
  }

  return <RouterProvider router={router} />
}

export function Providers() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthGate />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  )
}
