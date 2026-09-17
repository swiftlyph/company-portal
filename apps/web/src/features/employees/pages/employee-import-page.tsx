import { useRef, useState, type ChangeEvent } from "react"
import { Link } from "react-router-dom"
import { toast } from "sonner"
import { ArrowLeftIcon, DownloadIcon } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@workspace/ui/components/alert"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { Input } from "@workspace/ui/components/input"
import { Skeleton } from "@workspace/ui/components/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import { saveText } from "@/lib/download"
import { describeEmployeeError } from "../errors"
import { EMPTY_VALUE } from "../format"
import {
  IMPORT_OPTIONAL_COLUMNS,
  IMPORT_REQUIRED_COLUMNS,
  IMPORT_TEMPLATE,
  IMPORT_TEMPLATE_FILENAME,
} from "../import-template"
import type { ImportReport, ImportRow, ImportRowAction } from "../types"
import { useImportEmployees } from "../use-employee-mutations"

const ACTION_LABEL: Record<ImportRowAction, string> = {
  create: "New",
  update: "Update",
  unchanged: "No change",
  invalid: "Problem",
}

const ACTION_VARIANT: Record<ImportRowAction, "secondary" | "outline" | "ghost" | "destructive"> = {
  create: "secondary",
  update: "outline",
  unchanged: "ghost",
  invalid: "destructive",
}

/**
 * `/app/employees/import`. Choosing a file immediately PREVIEWS it: the
 * API runs the real import in a transaction and rolls it back, so the
 * table below is exactly what "Import" will then do, row by row. Nothing
 * is written until that button is pressed, and rows with problems are
 * skipped rather than blocking the rest.
 */
export function EmployeeImportPage() {
  const importer = useImportEmployees()
  const inputRef = useRef<HTMLInputElement>(null)

  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<ImportReport | null>(null)
  const [result, setResult] = useState<ImportReport | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)

  function reset() {
    setFile(null)
    setPreview(null)
    setResult(null)
    setFileError(null)
    if (inputRef.current) inputRef.current.value = ""
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const chosen = event.target.files?.[0] ?? null

    setPreview(null)
    setResult(null)
    setFileError(null)
    setFile(chosen)

    if (!chosen) return

    importer.mutate(
      { file: chosen, mode: "preview" },
      {
        onSuccess: setPreview,
        onError: (error) => setFileError(describeEmployeeError(error, "Couldn't read that file.")),
      },
    )
  }

  function handleCommit() {
    if (!file) return

    importer.mutate(
      { file, mode: "commit" },
      {
        onSuccess: (report) => {
          setResult(report)
          setPreview(null)
          toast.success(
            `Imported: ${report.summary.create} added, ${report.summary.update} updated.`,
          )
        },
        onError: (error) => setFileError(describeEmployeeError(error, "Couldn't import that file.")),
      },
    )
  }

  const report = result ?? preview
  const toWrite = preview ? preview.summary.create + preview.summary.update : 0

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold">Import employees</h1>
          <p className="text-sm text-muted-foreground">
            Bring in your whole roster from a CSV file, or update it in bulk. You'll see exactly what
            will happen before anything is saved.
          </p>
        </div>
        <Button variant="outline" render={<Link to="/app/employees" />}>
          <ArrowLeftIcon data-icon="inline-start" />
          Back to employees
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>1. Choose a CSV file</CardTitle>
          <CardDescription>Up to 1,000 employees and 1 MB per file.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="import-file" className="text-xs text-muted-foreground">
                Roster file
              </label>
              <Input
                id="import-file"
                ref={inputRef}
                type="file"
                accept=".csv,text/csv"
                className="w-80"
                onChange={handleFileChange}
                disabled={importer.isPending}
              />
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => saveText(IMPORT_TEMPLATE, IMPORT_TEMPLATE_FILENAME)}
            >
              <DownloadIcon data-icon="inline-start" />
              Download template
            </Button>
          </div>

          <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            <li>
              Required columns: <code>{IMPORT_REQUIRED_COLUMNS.join(", ")}</code>. Optional:{" "}
              <code>{IMPORT_OPTIONAL_COLUMNS.join(", ")}</code>, in any order.
            </li>
            <li>
              Someone already on your roster (same employee number, or same email) is updated, not
              duplicated. An empty cell clears that field; a column you leave out is not touched.
            </li>
            <li>Departments are matched by name and created if you don't have them yet.</li>
            <li>Dates are YYYY-MM-DD. Status is never imported; change it per employee instead.</li>
          </ul>
        </CardContent>
      </Card>

      {fileError && (
        <Alert variant="destructive">
          <AlertTitle>This file can't be imported</AlertTitle>
          <AlertDescription>{fileError}</AlertDescription>
        </Alert>
      )}

      {importer.isPending && !report && (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      )}

      {result && (
        <Alert>
          <AlertTitle>Import finished</AlertTitle>
          <AlertDescription>
            {result.summary.create} added, {result.summary.update} updated, {result.summary.unchanged}{" "}
            unchanged.
            {result.summary.invalid > 0 &&
              ` ${result.summary.invalid} ${result.summary.invalid === 1 ? "row was" : "rows were"} skipped; fix them in your file and import it again.`}
          </AlertDescription>
        </Alert>
      )}

      {report && (
        <Card>
          <CardHeader>
            <CardTitle>{result ? "What was imported" : "2. Check the preview"}</CardTitle>
            <CardDescription>
              {result
                ? `From ${file?.name ?? "your file"}.`
                : `Nothing has been saved yet. This is what importing ${file?.name ?? "this file"} will do.`}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{report.summary.create} new</Badge>
              <Badge variant="outline">{report.summary.update} to update</Badge>
              <Badge variant="ghost">{report.summary.unchanged} unchanged</Badge>
              {report.summary.invalid > 0 && (
                <Badge variant="destructive">{report.summary.invalid} with problems</Badge>
              )}
            </div>

            {report.ignored_columns.length > 0 && (
              <p className="text-sm text-muted-foreground">
                Ignored columns: <code>{report.ignored_columns.join(", ")}</code>.
              </p>
            )}

            {report.rows.length === 0 ? (
              <p className="text-sm text-muted-foreground">The file has a header but no employees.</p>
            ) : (
              <ImportRowsTable rows={report.rows} />
            )}

            <div className="flex flex-wrap items-center justify-end gap-2">
              <Button type="button" variant="outline" onClick={reset} disabled={importer.isPending}>
                {result ? "Import another file" : "Choose another file"}
              </Button>
              {result ? (
                <Button render={<Link to="/app/employees" />}>View employees</Button>
              ) : (
                <Button type="button" onClick={handleCommit} disabled={importer.isPending || toWrite === 0}>
                  {importer.isPending
                    ? "Importing…"
                    : toWrite === 0
                      ? "Nothing to import"
                      : `Import ${toWrite} ${toWrite === 1 ? "employee" : "employees"}`}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function ImportRowsTable({ rows }: { rows: ImportRow[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-16">Line</TableHead>
          <TableHead className="w-28">Result</TableHead>
          <TableHead>Employee</TableHead>
          <TableHead className="hidden md:table-cell">Employee no.</TableHead>
          <TableHead>Details</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.line}>
            <TableCell className="text-muted-foreground">{row.line}</TableCell>
            <TableCell>
              <Badge variant={ACTION_VARIANT[row.action]}>{ACTION_LABEL[row.action]}</Badge>
            </TableCell>
            <TableCell>
              <div className="flex flex-col">
                <span className="font-medium">
                  {[row.first_name, row.last_name].filter(Boolean).join(" ") || EMPTY_VALUE}
                </span>
                <span className="text-xs text-muted-foreground">{row.email ?? EMPTY_VALUE}</span>
              </div>
            </TableCell>
            <TableCell className="hidden text-muted-foreground md:table-cell">
              {row.employee_no ?? EMPTY_VALUE}
            </TableCell>
            <TableCell className="whitespace-normal">
              {row.errors ? (
                <ul className="space-y-0.5 text-sm text-destructive">
                  {Object.entries(row.errors).map(([field, messages]) => (
                    <li key={field}>{messages.join(" ")}</li>
                  ))}
                </ul>
              ) : (
                <span className="text-muted-foreground">{EMPTY_VALUE}</span>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
