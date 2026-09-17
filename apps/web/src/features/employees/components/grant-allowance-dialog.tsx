import { useState } from "react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { describeEmployeeError } from "../errors"
import { formatAllowance } from "../format"
import type { Employee } from "../types"
import { useGrantEmployeeAllowance } from "../use-employee-mutations"

export function GrantAllowanceDialog({
  employee,
  open,
  onOpenChange,
}: {
  employee: Employee
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const grant = useGrantEmployeeAllowance()
  const [amount, setAmount] = useState("")
  const [reason, setReason] = useState("")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  function close(next: boolean) {
    if (!grant.isPending) onOpenChange(next)
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage(null)

    const pesos = Number(amount)
    if (!Number.isFinite(pesos) || pesos <= 0 || Math.round(pesos * 100) !== pesos * 100) {
      setErrorMessage("Enter a positive amount with no more than two decimal places.")
      return
    }
    if (!reason.trim()) {
      setErrorMessage("Enter a reason for this grant.")
      return
    }

    try {
      await grant.mutateAsync({
        id: employee.id,
        request: {
          amount_cents: Math.round(pesos * 100),
          reason: reason.trim(),
          idempotency_key: globalThis.crypto.randomUUID(),
        },
      })
      toast.success(`${formatAllowance(Math.round(pesos * 100))} granted to ${employee.full_name}.`)
      setAmount("")
      setReason("")
      onOpenChange(false)
    } catch (error) {
      setErrorMessage(describeEmployeeError(error, "Couldn't grant the allowance."))
    }
  }

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Grant allowance</DialogTitle>
          <DialogDescription>
            Add entitlement to {employee.full_name}'s allowance account. This creates a permanent ledger entry.
          </DialogDescription>
        </DialogHeader>

        <form className="flex flex-col gap-4" onSubmit={(event) => void submit(event)}>
          <div className="flex flex-col gap-2">
            <Label htmlFor="allowance-amount">Amount (PHP)</Label>
            <Input
              id="allowance-amount"
              type="number"
              min="0.01"
              step="0.01"
              inputMode="decimal"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="1500.00"
              required
              autoFocus
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="allowance-reason">Reason</Label>
            <Input
              id="allowance-reason"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Monthly allowance"
              maxLength={255}
              required
            />
          </div>

          {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => close(false)} disabled={grant.isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={grant.isPending}>
              {grant.isPending ? "Granting…" : "Grant allowance"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
