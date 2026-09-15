interface PlaceholderPageProps {
  title: string
  /** One line on what the section will do, so a dead link still tells the reader something. */
  description?: string
}

/**
 * Stand-in content for a nav destination that doesn't have a real page yet.
 * Swap out per-route once each section is built.
 */
export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <div className="flex h-full min-h-[60vh] flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border px-6 text-center">
      <h1 className="text-2xl font-bold">{title}</h1>
      {description && <p className="max-w-md text-muted-foreground">{description}</p>}
      <p className="text-sm text-muted-foreground">This section is coming soon.</p>
    </div>
  )
}
