"use client";

import { useMemo, useState } from "react";
import { Clock, History, Play, ReceiptText, RotateCcw, Square, Trash2, UtensilsCrossed } from "lucide-react";
import { toast } from "sonner";
import {
  computeCharge,
  formatDuration,
  formatINR,
  formatMinutes,
  formatTimeOfDay,
  tableTier,
  type ChargeConfig,
  type TableTier,
} from "@/lib/charge";
import type { Table } from "@/lib/staff-storage";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const TIER_STYLES: Record<
  TableTier,
  { dot: string; label: string; pulse: boolean; text: string; ring: string }
> = {
  free: { dot: "bg-emerald-500", label: "Free", pulse: false, text: "text-emerald-400", ring: "border-white/10" },
  safe: { dot: "bg-gold-400", label: "Seated", pulse: false, text: "text-gold-400", ring: "border-white/10" },
  approaching: {
    dot: "bg-amber-400",
    label: "Approaching charge",
    pulse: true,
    text: "text-amber-300",
    ring: "border-amber-400/30",
  },
  "charge-active": {
    dot: "bg-coral-500",
    label: "Charge active",
    pulse: true,
    text: "text-coral-500",
    ring: "border-coral-500/30",
  },
};

const ICON_BTN =
  "inline-flex size-9 items-center justify-center rounded-lg border border-white/10 bg-plum-950/50 text-cream-100/60 transition hover:border-brand-500/40 hover:text-gold-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500";

const INPUT_CLS =
  "[color-scheme:dark] border-white/15 bg-plum-950/60 text-cream-100 placeholder:text-cream-100/30 focus-visible:ring-brand-500/40";

interface TableCardProps {
  table: Table;
  /** Live epoch ms from useTick — 0 means "not mounted yet" (hydration-safe placeholder). */
  now: number;
  config: ChargeConfig;
  onStart: (id: string, customerName?: string) => void;
  onStartAt: (id: string, epochMs: number, customerName?: string) => void;
  onOpenOrder: (id: string) => void;
  onStop: (id: string) => void;
  onLogDuration: (id: string, durationMs: number) => void;
  onReset: (id: string) => void;
  onRemove: (id: string) => void;
}

/** One table tile: live timer, tier badge, charge, progress bar and actions. */
export default function TableCard({
  table,
  now,
  config,
  onStart,
  onStartAt,
  onOpenOrder,
  onStop,
  onLogDuration,
  onReset,
  onRemove,
}: TableCardProps) {
  const [startOpen, setStartOpen] = useState(false);
  const [startTimeOpen, setStartTimeOpen] = useState(false);
  const [timeValue, setTimeValue] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [durationOpen, setDurationOpen] = useState(false);
  const [hours, setHours] = useState("1");
  const [minutes, setMinutes] = useState("0");
  const [confirmReset, setConfirmReset] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);

  const occupied = table.status === "occupied";
  const durationMs =
    occupied && table.startedAt !== null && now > 0 ? Math.max(0, now - table.startedAt) : null;
  const charge = durationMs !== null ? computeCharge(durationMs, config) : null;
  const tier: TableTier =
    durationMs !== null ? tableTier("occupied", durationMs, config) : occupied ? "safe" : "free";
  const tierStyle = TIER_STYLES[tier];

  const progressPct = useMemo(() => {
    if (!charge) return 0;
    if (charge.inFreeWindow) {
      const freeMs = config.freeMinutes * 60_000;
      return freeMs > 0 ? Math.min(100, Math.max(0, ((durationMs ?? 0) / freeMs) * 100)) : 100;
    }
    const intervalMs = Math.max(1, config.intervalMinutes) * 60_000;
    return Math.min(100, Math.max(0, (1 - charge.msToNextCharge / intervalMs) * 100));
  }, [charge, config, durationMs]);

  const durationMsDraft = Math.max(0, (Number(hours) || 0) * 3_600_000 + (Number(minutes) || 0) * 60_000);
  const draftCharge = computeCharge(durationMsDraft, config);

  const order = table.order ?? [];
  const foodSubtotal = order.reduce((sum, l) => sum + l.price * l.qty, 0);

  const openStartDialog = () => {
    setCustomerName("");
    setTimeValue("");
    setStartOpen(true);
  };

  const submitStartNow = () => {
    onStart(table.id, customerName.trim() || undefined);
    setStartOpen(false);
    toast.success(
      `${table.name} timer started${customerName.trim() ? ` — ${customerName.trim()} seated` : ""}`,
    );
  };

  const submitStartTime = () => {
    const match = /^(\d{1,2}):(\d{2})$/.exec(timeValue.trim());
    if (!match) {
      toast.error("Pick a valid start time first");
      return;
    }
    const h = Number(match[1]);
    const m = Number(match[2]);
    if (h > 23 || m > 59) {
      toast.error("That time does not look right");
      return;
    }
    const d = new Date();
    d.setHours(h, m, 0, 0);
    const epoch = d.getTime();
    if (epoch > Date.now() + 5 * 60_000) {
      toast.error("Start time cannot be in the future");
      return;
    }
    onStartAt(table.id, epoch, customerName.trim() || undefined);
    setStartTimeOpen(false);
    setTimeValue("");
    setCustomerName("");
    toast.success(
      `${table.name} timer started at ${formatTimeOfDay(epoch)}${customerName.trim() ? ` — ${customerName.trim()}` : ""}`,
    );
  };

  const submitDuration = () => {
    if (durationMsDraft <= 0) {
      toast.error("Enter a duration above zero");
      return;
    }
    onLogDuration(table.id, durationMsDraft);
    setDurationOpen(false);
  };

  return (
    <article
      className={cn(
        "relative flex min-h-[230px] flex-col rounded-2xl border bg-plum-900/80 p-5 transition-shadow hover:shadow-[0_0_28px_rgba(214,41,107,0.12)]",
        tierStyle.ring,
      )}
    >
      {/* Name + status badge */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <h3 className="font-display text-sm font-bold uppercase tracking-widest text-cream-100">{table.name}</h3>
          {occupied && table.customerName && (
            <span
              className="max-w-[55%] truncate rounded-full border border-gold-400/40 bg-gold-400/10 px-2 py-0.5 text-[10px] font-semibold text-gold-400"
              title={`Guest: ${table.customerName}`}
            >
              {table.customerName}
            </span>
          )}
        </div>
        <span
          className={cn(
            "inline-flex shrink-0 items-center gap-1.5 rounded-full border border-white/10 bg-plum-950/60 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest",
            tierStyle.text,
          )}
        >
          <span className={cn("size-2 rounded-full", tierStyle.dot, tierStyle.pulse && "animate-pulse")} aria-hidden />
          {tierStyle.label}
        </span>
      </div>

      {occupied ? (
        <div className="mt-4 flex flex-1 items-end justify-between gap-3">
          <div>
            <div className="text-3xl font-bold tabular-nums tracking-tight text-cream-100">
              {durationMs !== null ? formatDuration(durationMs) : "--:--:--"}
            </div>
            <div className="mt-1 text-xs text-cream-100/50">
              {table.startedAt !== null ? `Started ${formatTimeOfDay(table.startedAt)}` : "Start time not set"}
            </div>
          </div>
          <div className="text-right">
            <div className="font-display text-2xl font-bold tabular-nums text-gold-400">
              {charge ? formatINR(charge.charge) : "₹…"}
            </div>
            <div className="text-[10px] uppercase tracking-widest text-cream-100/40">seating charge</div>
          </div>
        </div>
      ) : (
        <div className="mt-4 flex flex-1 items-end">
          <div>
            <div className="text-3xl font-bold tabular-nums text-cream-100/25">--:--:--</div>
            <div className="mt-1 text-xs text-cream-100/40">Available</div>
          </div>
        </div>
      )}

      {/* Progress to next charge */}
      {occupied && charge && (
        <div className="mt-4">
          <div
            className="h-1.5 overflow-hidden rounded-full bg-white/10"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progressPct)}
            aria-label="Progress to next seating charge"
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand-500 to-gold-400 transition-[width] duration-1000 ease-linear"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <div className="mt-1.5 text-[11px] text-cream-100/45">
            {charge.inFreeWindow ? "Free window" : `+${formatINR(config.intervalCharge)} per ${config.intervalMinutes} min`} — next
            charge in {formatMinutes(charge.msToNextCharge)}
          </div>
        </div>
      )}

      {/* Live order summary */}
      {occupied && order.length > 0 && (
        <div
          className="mt-3 flex items-center justify-between gap-2 rounded-xl border border-white/10 bg-plum-950/60 px-3 py-2 text-xs"
          aria-label="Live order summary"
        >
          <span className="min-w-0 truncate text-cream-100/60">
            <UtensilsCrossed className="mr-1 inline size-3.5 text-brand-400" aria-hidden />
            {order.reduce((n, l) => n + l.qty, 0)} items · food {formatINR(foodSubtotal)}
          </span>
          <span className="shrink-0 font-semibold tabular-nums text-gold-400">
            Total {formatINR(foodSubtotal + (charge?.charge ?? 0))}
          </span>
        </div>
      )}

      {/* Actions */}
      <div className="mt-4">
        {occupied ? (
          <div className="flex gap-2">
            <Button
              type="button"
              onClick={() => onOpenOrder(table.id)}
              className="flex-1 bg-brand-500 font-semibold tracking-widest text-white hover:bg-brand-600 focus-visible:ring-brand-500/40"
            >
              <ReceiptText className="size-4" aria-hidden /> ORDER &amp; BILL
            </Button>
            <Button
              type="button"
              onClick={() => onStop(table.id)}
              className="flex-1 bg-coral-500 font-semibold tracking-widest text-white hover:bg-coral-500/90 focus-visible:ring-coral-500/40"
            >
              <Square className="size-4" aria-hidden /> STOP
            </Button>
          </div>
        ) : (
          <Button
            type="button"
            onClick={openStartDialog}
            className="w-full bg-emerald-500 font-semibold tracking-widest text-white hover:bg-emerald-500/90 focus-visible:ring-emerald-500/40"
          >
            <Play className="size-4" aria-hidden /> START
          </Button>
        )}

        <div className="mt-2.5 flex items-center gap-1.5">
          <button
            type="button"
            className={ICON_BTN}
            title="Set start time"
            aria-label="Set start time"
            onClick={() => {
              setCustomerName("");
              setStartTimeOpen(true);
            }}
          >
            <Clock className="size-4" aria-hidden />
          </button>
          {occupied && (
            <button
              type="button"
              className={ICON_BTN}
              title="Enter total duration"
              aria-label="Enter total duration"
              onClick={() => setDurationOpen(true)}
            >
              <History className="size-4" aria-hidden />
            </button>
          )}
          {occupied && (
            <button
              type="button"
              className={ICON_BTN}
              title="Reset timer (no charge)"
              aria-label="Reset timer without charge"
              onClick={() => setConfirmReset(true)}
            >
              <RotateCcw className="size-4" aria-hidden />
            </button>
          )}
          {!occupied && (
            <button
              type="button"
              className={cn(ICON_BTN, "hover:border-coral-500/40 hover:text-coral-500")}
              title="Remove table"
              aria-label="Remove table"
              onClick={() => setConfirmRemove(true)}
            >
              <Trash2 className="size-4" aria-hidden />
            </button>
          )}
        </div>
      </div>

      {/* Start with guest name dialog */}
      <Dialog open={startOpen} onOpenChange={setStartOpen}>
        <DialogContent className="rounded-2xl border-white/10 bg-plum-900 text-cream-100">
          <DialogHeader>
            <DialogTitle className="font-display">Seat a guest — {table.name}</DialogTitle>
            <DialogDescription className="text-cream-100/60">
              The timer starts now. Give the guest a name so it shows on the table — leave blank to skip.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2">
            <Label htmlFor={`start-name-${table.id}`} className="text-cream-100/80">
              Customer name (optional)
            </Label>
            <Input
              id={`start-name-${table.id}`}
              placeholder="e.g. Ramesh"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitStartNow()}
              className={INPUT_CLS}
            />
          </div>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setStartOpen(false)}
              className="text-cream-100/70 hover:bg-white/10 hover:text-cream-100"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={submitStartNow}
              className="bg-emerald-500 text-white hover:bg-emerald-500/90 focus-visible:ring-emerald-500/40"
            >
              <Play className="size-4" aria-hidden /> Start timer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Set start time dialog (backdate + guest name) */}
      <Dialog
        open={startTimeOpen}
        onOpenChange={(o) => {
          setStartTimeOpen(o);
          if (o) setTimeValue("");
        }}
      >
        <DialogContent className="rounded-2xl border-white/10 bg-plum-900 text-cream-100">
          <DialogHeader>
            <DialogTitle className="font-display">Set start time — {table.name}</DialogTitle>
            <DialogDescription className="text-cream-100/60">
              Backdate or correct when the guests sat down. Today only.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <div className="grid gap-2">
              <Label htmlFor={`start-time-${table.id}`} className="text-cream-100/80">
                Started at
              </Label>
              <Input
                id={`start-time-${table.id}`}
                type="time"
                value={timeValue}
                onChange={(e) => setTimeValue(e.target.value)}
                className={INPUT_CLS}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor={`back-name-${table.id}`} className="text-cream-100/80">
                Customer name (optional)
              </Label>
              <Input
                id={`back-name-${table.id}`}
                placeholder="e.g. Ramesh"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className={INPUT_CLS}
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setStartTimeOpen(false)}
              className="text-cream-100/70 hover:bg-white/10 hover:text-cream-100"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={submitStartTime}
              className="bg-brand-500 text-white hover:bg-brand-600 focus-visible:ring-brand-500/40"
            >
              Start timer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Enter total duration dialog */}
      <Dialog open={durationOpen} onOpenChange={setDurationOpen}>
        <DialogContent className="rounded-2xl border-white/10 bg-plum-900 text-cream-100">
          <DialogHeader>
            <DialogTitle className="font-display">Total duration — {table.name}</DialogTitle>
            <DialogDescription className="text-cream-100/60">
              Guests already left? Log how long they stayed and close the table.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label htmlFor={`dur-h-${table.id}`} className="text-cream-100/80">
                Hours
              </Label>
              <Input
                id={`dur-h-${table.id}`}
                type="number"
                min={0}
                max={72}
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                className={INPUT_CLS}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor={`dur-m-${table.id}`} className="text-cream-100/80">
                Minutes
              </Label>
              <Input
                id={`dur-m-${table.id}`}
                type="number"
                min={0}
                max={59}
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
                className={INPUT_CLS}
              />
            </div>
          </div>
          <div className="rounded-xl border border-white/10 bg-plum-950/60 p-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-cream-100/60">{formatMinutes(durationMsDraft)} stay</span>
              <span className="font-display text-lg font-bold tabular-nums text-gold-400">
                {formatINR(draftCharge.charge)}
              </span>
            </div>
            {durationMsDraft > 0 && now > 0 && (
              <p className="mt-1 text-xs text-cream-100/45">≈ sat down at {formatTimeOfDay(now - durationMsDraft)}</p>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setDurationOpen(false)}
              className="text-cream-100/70 hover:bg-white/10 hover:text-cream-100"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={submitDuration}
              disabled={durationMsDraft <= 0}
              className="bg-brand-500 text-white hover:bg-brand-600 focus-visible:ring-brand-500/40"
            >
              Log &amp; close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset confirm (no charge / no log) */}
      <AlertDialog open={confirmReset} onOpenChange={setConfirmReset}>
        <AlertDialogContent className="rounded-2xl border-white/10 bg-plum-900 text-cream-100">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">Reset {table.name}?</AlertDialogTitle>
            <AlertDialogDescription className="text-cream-100/60">
              The running timer is cleared and the table goes back to FREE. No charge is logged.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-white/15 bg-transparent text-cream-100 hover:bg-white/10 hover:text-cream-100">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => onReset(table.id)}
              className="bg-coral-500 text-white hover:bg-coral-500/90 focus-visible:ring-coral-500/40"
            >
              Reset table
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Remove confirm (free tables only) */}
      <AlertDialog open={confirmRemove} onOpenChange={setConfirmRemove}>
        <AlertDialogContent className="rounded-2xl border-white/10 bg-plum-900 text-cream-100">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">Remove {table.name}?</AlertDialogTitle>
            <AlertDialogDescription className="text-cream-100/60">
              The table disappears from the floor plan. You can add it back anytime with the ADD TABLE card.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-white/15 bg-transparent text-cream-100 hover:bg-white/10 hover:text-cream-100">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => onRemove(table.id)}
              className="bg-coral-500 text-white hover:bg-coral-500/90 focus-visible:ring-coral-500/40"
            >
              Remove table
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </article>
  );
}
