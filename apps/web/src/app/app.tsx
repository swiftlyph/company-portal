import { ThemeProvider } from "@/components/theme-provider"
import { Providers } from "./providers"

export function App() {
  return (
    <ThemeProvider>
      <Providers />
    </ThemeProvider>
  )
}
