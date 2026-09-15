import { Link } from "react-router-dom"
import { Button } from "@workspace/ui/components/button"

export function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background text-center">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-muted-foreground">This page doesn&apos;t exist.</p>
      <Button render={<Link to="/login" />}>Back to login</Button>
    </div>
  )
}
