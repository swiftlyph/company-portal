import { beforeEach, describe, expect, it, vi } from "vitest"

const TOKEN_KEY = "gasa_company_auth_token"
const user = {
  id: 1,
  name: "Company Admin",
  email: "company@gasa.test",
  roles: ["company_admin"],
  company: { id: 1, name: "Company One", status: "active" as const },
}

describe("auth store", () => {
  beforeEach(() => {
    localStorage.clear()
    vi.resetModules()
  })

  it("starts as guest when no token is stored", async () => {
    const { useAuthStore } = await import("./store")
    expect(useAuthStore.getState().status).toBe("guest")
    expect(useAuthStore.getState().token).toBeNull()
  })

  it("starts as booting when a token is already in storage", async () => {
    localStorage.setItem(TOKEN_KEY, "existing-token")
    const { useAuthStore } = await import("./store")
    expect(useAuthStore.getState().status).toBe("booting")
    expect(useAuthStore.getState().token).toBe("existing-token")
  })

  it("setAuthed persists the token but never the user", async () => {
    const { useAuthStore } = await import("./store")
    useAuthStore.getState().setAuthed("new-token", user)

    expect(localStorage.getItem(TOKEN_KEY)).toBe("new-token")
    expect(useAuthStore.getState().status).toBe("authed")
    expect(useAuthStore.getState().user).toEqual(user)

    // A fresh boot only ever has the token to go on, never a cached user.
    vi.resetModules()
    const { useAuthStore: rehydrated } = await import("./store")
    expect(rehydrated.getState().token).toBe("new-token")
    expect(rehydrated.getState().user).toBeNull()
  })

  it("clear removes the persisted token and drops back to guest", async () => {
    const { useAuthStore } = await import("./store")
    useAuthStore.getState().setAuthed("tok", user)

    useAuthStore.getState().clear()

    expect(localStorage.getItem(TOKEN_KEY)).toBeNull()
    expect(useAuthStore.getState().status).toBe("guest")
    expect(useAuthStore.getState().token).toBeNull()
    expect(useAuthStore.getState().user).toBeNull()
  })

  it("setUser replaces the user without touching status or token", async () => {
    const { useAuthStore } = await import("./store")
    useAuthStore.getState().setAuthed("tok", user)

    const suspended = { ...user, company: { ...user.company, status: "suspended" as const } }
    useAuthStore.getState().setUser(suspended)

    expect(useAuthStore.getState().user).toEqual(suspended)
    expect(useAuthStore.getState().status).toBe("authed")
    expect(useAuthStore.getState().token).toBe("tok")
  })

  describe("selectIsCompanyActive", () => {
    it("is true only when the company status is active", async () => {
      const { useAuthStore, selectIsCompanyActive } = await import("./store")
      useAuthStore.getState().setAuthed("tok", user)
      expect(selectIsCompanyActive(useAuthStore.getState())).toBe(true)
    })

    it("is false for a suspended or pending company", async () => {
      const { useAuthStore, selectIsCompanyActive } = await import("./store")
      for (const status of ["suspended", "pending"] as const) {
        useAuthStore.getState().setAuthed("tok", { ...user, company: { ...user.company, status } })
        expect(selectIsCompanyActive(useAuthStore.getState())).toBe(false)
      }
    })

    it("is false when there is no company at all", async () => {
      const { useAuthStore, selectIsCompanyActive } = await import("./store")
      useAuthStore.getState().setAuthed("tok", { ...user, company: null })
      expect(selectIsCompanyActive(useAuthStore.getState())).toBe(false)
    })

    it("is false for a guest with no user", async () => {
      const { useAuthStore, selectIsCompanyActive } = await import("./store")
      expect(selectIsCompanyActive(useAuthStore.getState())).toBe(false)
    })
  })
})
