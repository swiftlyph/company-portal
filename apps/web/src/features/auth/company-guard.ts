import { registerOnCompanyInactive } from "@/lib/api/client";
import { fetchMe } from "./api";
import { useAuthStore } from "./store";

type Navigate = (path: string) => void;

let navigate: Navigate = () => {};

/** Wired once from providers.tsx, where the router lives. */
export function setCompanyGuardNavigator(fn: Navigate): void {
  navigate = fn;
}

let refreshing = false;

// Registered once, at module load. A 403 company_inactive mid-session means
// the company was suspended after login. /auth/me still works for that
// account and carries the new status, so re-derive the user from it and
// send them to /inactive rather than logging them out: the token is fine,
// the company isn't.
registerOnCompanyInactive(() => {
  if (refreshing) return;
  refreshing = true;

  fetchMe()
    .then((user) => {
      useAuthStore.getState().setUser(user);
      navigate("/inactive");
    })
    .catch(() => {
      // A 401 here is handled by session.ts; anything else leaves the
      // current screen in place and the next request will try again.
    })
    .finally(() => {
      refreshing = false;
    });
});
