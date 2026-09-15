import "@testing-library/jest-dom/vitest"
import { cleanup } from "@testing-library/react"
import { afterEach } from "vitest"

// Testing Library only unmounts between tests on its own when `afterEach`
// is a global; this config keeps Vitest globals off (explicit imports, like
// merchant-portal), so register the cleanup here or every test's DOM
// piles up on the previous one's.
afterEach(() => {
  cleanup()
})

// jsdom doesn't implement matchMedia. ThemeProvider/ThemeToggle read it to
// resolve the "system" theme, and the sidebar's useIsMobile hook listens to
// it, so any test that renders those needs this stub.
if (!window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as unknown as MediaQueryList
}

// jsdom doesn't implement pointer capture or scrollIntoView. Base UI's
// Select and Dialog call these while opening/closing, so any test that
// interacts with them needs the stubs.
if (!Element.prototype.hasPointerCapture) {
  Element.prototype.hasPointerCapture = () => false
}
if (!Element.prototype.setPointerCapture) {
  Element.prototype.setPointerCapture = () => {}
}
if (!Element.prototype.releasePointerCapture) {
  Element.prototype.releasePointerCapture = () => {}
}
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {}
}

// jsdom doesn't implement ResizeObserver; Base UI's positioned popups
// (Select, Tooltip) construct one when they open.
if (!window.ResizeObserver) {
  window.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver
}
