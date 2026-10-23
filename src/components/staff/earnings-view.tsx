"use client";

import { useMemo, useState } from "react";
import {
  Clock,
  Download,
  IndianRupee,
  MinusCircle,
  Plus,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { formatINR, formatMinutes } from "@/lib/charge";
import {
  PAYMENT_METHODS,
  exportVisitsToExcel,
  itemsSummary,
  normaliseItems,
  nowTimeValue,
  prettyDate,
  statsForDay,
  timeOnDate,
  todayKey,
  type PaymentMethod,
  type UseVisitsReturn,
  type VisitItem,
} from "@/lib/visits";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const INPUT_CLS =
  "[color-scheme:dark] border-white/15 bg-plum-950/60 text-cream-100 placeholder:text-cream-100/30 focus-visible:ring-brand-500/40";

/** Popular menu items for quick pick-up while typing (native datalist). */
const ITEM_SUGGESTIONS = [
  "Sweet Lassi",
  "Mango Lassi",
  "Royal Lassi",
  "Dry Fruit Lassi",
  "Chocolate Lassi",
  "Strawberry Lassi",
  "Classic Burger",
  "Veggie Loaded Pizza",
  "Sandwich",
  "Momos",
  "French Fries",
  "Brownie",
  "Ice Cream",
  "Cold Coffee",
  "Mojito",
];

function Chip({ label, value, dot, icon: Icon }: { label: string; value: string; dot?: string; icon?: typeof Users }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-plum-900/80 px-3.5 py-1.5 text-xs font-medium text-cream-100/80">
      {dot && <span className={cn("size-2 rounded-full", dot)} aria-hidden />}
      {Icon && <Icon className="size-3.5 text-gold-400" aria-hidden />}
      {label} <span className="font-semibold tabular-nums text-cream-100">{value}</span>
    </span>
  );
}

interface EarningsViewProps {
  now: number;
  /** Shared visits store from the overlay — one source of truth across tabs. */
  visitsApi: UseVisitsReturn;
}

/** Staff → Earnings: daily customer visit records, totals and Excel export. */
export default function EarningsView({ now, visitsApi }: EarningsViewProps) {
  const { visits, ready, addVisit, removeVisit } = visitsApi;

  const [dateKey, setDateKey] = useState(todayKey);
  const [formOpen, setFormOpen] = useState(false);

  // Form state
  const [arrived, setArrived] = useState(nowTimeValue);
  const [departed, setDeparted] = useState(nowTimeValue);
  const [items, setItems] = useState<VisitItem[]>([{ name: "", qty: 1 }]);
  const [bill, setBill] = useState("");
  const [payment, setPayment] = useState<PaymentMethod>("Cash");
  const [note, setNote] = useState("");

  const dayVisits = useMemo(
    () => visits.filter((v) => v.date === dateKey).sort((a, b) => a.arrivedAt - b.arrivedAt),
    [visits, dateKey],
  );
  const stats = useMemo(() => statsForDay(dayVisits), [dayVisits]);

  // Live time-spent preview for the open form
  const arrivalEpoch = timeOnDate(dateKey, arrived);
  let departureEpoch = timeOnDate(dateKey, departed);
  if (arrivalEpoch !== null && departureEpoch !== null && departureEpoch < arrivalEpoch) {
    departureEpoch += 24 * 60 * 60_000; // guest stayed past midnight
  }
  const spentPreview =
    arrivalEpoch !== null && departureEpoch !== null ? formatMinutes(departureEpoch - arrivalEpoch) : "—";

  const openForm = () => {
    setArrived(nowTimeValue());
    setDeparted(nowTimeValue());
    setItems([{ name: "", qty: 1 }]);
    setBill("");
    setPayment("Cash");
    setNote("");
    setFormOpen(true);
  };

  const saveVisit = () => {
    if (arrivalEpoch === null || departureEpoch === null) {
      toast.error("Enter a valid arrival and departure time");
      return;
    }
    const amount = Number(bill);
    if (!Number.isFinite(amount) || amount < 0) {
      toast.error("Bill amount must be ₹0 or more");
      return;
    }
    addVisit({
      date: dateKey,
      arrivedAt: arrivalEpoch,
      departedAt: departureEpoch,
      items: normaliseItems(items),
      billAmount: Math.round(amount * 100) / 100,
      paymentMethod: payment,
      note: note.trim() !== "" ? note.trim() : undefined,
    });
    toast.success(`Visit recorded — ${formatINR(Math.round(amount * 100) / 100)} (${payment})`);
    setFormOpen(false);
  };

  const downloadExcel = () => {
    if (dayVisits.length === 0) {
      toast.error("No visits recorded for this day yet");
      return;
    }
    try {
      const filename = exportVisitsToExcel(dateKey, dayVisits);
      toast.success(`Downloaded ${filename}`);
    } catch {
      toast.error("Could not generate the Excel file");
    }
  };

  const setItem = (idx: number, patch: Partial<VisitItem>) => {
    setItems((list) => list.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Date + export bar */}
      <section
        aria-label="Daily earnings summary"
        className="rounded-2xl border border-white/10 bg-plum-900/80 p-5 sm:p-6"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="grid gap-1.5">
            <Label htmlFor="earn-date" className="text-cream-100/80">
              Day
            </Label>
            <Input
              id="earn-date"
              type="date"
              value={dateKey}
              onChange={(e) => setDateKey(e.target.value || todayKey())}
              className={cn(INPUT_CLS, "w-full sm:w-44")}
            />
          </div>
          <Button
            type="button"
            onClick={downloadExcel}
            disabled={dayVisits.length === 0}
            className="bg-brand-500 text-white hover:bg-brand-600 focus-visible:ring-brand-500/40 disabled:opacity-40"
          >
            <Download className="size-4" aria-hidden /> Download Excel
          </Button>
        </div>

        <p className="mt-2 text-xs text-cream-100/45">
          {prettyDate(dateKey)} — records for this day are saved on this device and included in the export.
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Chip icon={Users} label="Customers" value={String(stats.customers)} />
          <Chip icon={IndianRupee} label="Earnings" value={formatINR(stats.earnings)} />
          <Chip icon={Clock} label="Avg / customer" value={formatINR(Math.round(stats.avgSpend))} />
          {stats.customers > 0 && (
            <>
              <Chip dot="bg-emerald-500" label="Cash" value={formatINR(stats.byPayment.Cash)} />
              <Chip dot="bg-gold-400" label="UPI" value={formatINR(stats.byPayment.UPI)} />
              <Chip dot="bg-brand-400" label="Card" value={formatINR(stats.byPayment.Card)} />
            </>
          )}
        </div>
      </section>

      {/* Add-visit form */}
      {formOpen ? (
        <section aria-label="Record a customer visit" className="rounded-2xl border border-brand-500/30 bg-plum-900/80 p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-base font-bold text-cream-100">Record customer visit</h2>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Cancel entry"
              onClick={() => setFormOpen(false)}
              className="text-cream-100/60 hover:bg-white/10 hover:text-cream-100"
            >
              <X className="size-5" aria-hidden />
            </Button>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="grid gap-1.5">
              <Label htmlFor="visit-arrived" className="text-cream-100/80">
                Arrived at
              </Label>
              <Input
                id="visit-arrived"
                type="time"
                value={arrived}
                onChange={(e) => setArrived(e.target.value)}
                className={INPUT_CLS}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="visit-departed" className="text-cream-100/80">
                Departed at
              </Label>
              <Input
                id="visit-departed"
                type="time"
                value={departed}
                onChange={(e) => setDeparted(e.target.value)}
                className={INPUT_CLS}
              />
            </div>
            <div className="grid gap-1.5">
              <Label className="text-cream-100/80">Time spent</Label>
              <div className="flex h-9 items-center rounded-md border border-gold-400/25 bg-gold-400/5 px-3 text-sm font-semibold tabular-nums text-gold-400">
                {spentPreview}
              </div>
            </div>
          </div>

          {/* Items + quantities */}
          <div className="mt-4">
            <Label className="text-cream-100/80">Food items &amp; quantities</Label>
            <datalist id="visit-item-suggestions">
              {ITEM_SUGGESTIONS.map((name) => (
                <option key={name} value={name} />
              ))}
            </datalist>
            <div className="mt-2 flex flex-col gap-2">
              {items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Input
                    aria-label={`Item ${idx + 1} name`}
                    placeholder="e.g. Mango Lassi"
                    list="visit-item-suggestions"
                    value={item.name}
                    onChange={(e) => setItem(idx, { name: e.target.value })}
                    className={INPUT_CLS}
                  />
                  <Input
                    aria-label={`Item ${idx + 1} quantity`}
                    type="number"
                    min={1}
                    step={1}
                    value={item.qty}
                    onChange={(e) => setItem(idx, { qty: Number(e.target.value) || 1 })}
                    className={cn(INPUT_CLS, "w-20 shrink-0 text-center")}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={`Remove item ${idx + 1}`}
                    onClick={() => setItems((list) => (list.length > 1 ? list.filter((_, i) => i !== idx) : list))}
                    className="shrink-0 text-cream-100/50 hover:bg-white/10 hover:text-coral-500"
                  >
                    <MinusCircle className="size-4" aria-hidden />
                  </Button>
                </div>
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setItems((list) => [...list, { name: "", qty: 1 }])}
              className="mt-2 border-white/15 bg-plum-950/60 text-cream-100/80 hover:bg-plum-800 hover:text-gold-400"
            >
              <Plus className="size-4" aria-hidden /> Add item
            </Button>
          </div>

          {/* Bill + payment */}
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="visit-bill" className="text-cream-100/80">
                Bill amount (₹)
              </Label>
              <Input
                id="visit-bill"
                type="number"
                min={0}
                step="any"
                inputMode="decimal"
                placeholder="e.g. 450"
                value={bill}
                onChange={(e) => setBill(e.target.value)}
                className={INPUT_CLS}
              />
            </div>
            <div className="grid gap-1.5">
              <Label className="text-cream-100/80">Payment method</Label>
              <div className="flex gap-2" role="group" aria-label="Payment method">
                {PAYMENT_METHODS.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setPayment(m)}
                    aria-pressed={payment === m}
                    className={cn(
                      "h-9 flex-1 rounded-lg border text-xs font-bold uppercase tracking-wider transition",
                      payment === m
                        ? "border-brand-500 bg-brand-500 text-white"
                        : "border-white/15 bg-plum-950/60 text-cream-100/60 hover:border-brand-500/40 hover:text-cream-100",
                    )}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-3 grid gap-1.5">
            <Label htmlFor="visit-note" className="text-cream-100/80">
              Note (optional)
            </Label>
            <Input
              id="visit-note"
              placeholder="e.g. Table 3 — birthday group"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className={INPUT_CLS}
            />
          </div>

          <div className="mt-5">
            <Button
              type="button"
              onClick={saveVisit}
              className="bg-brand-500 text-white hover:bg-brand-600 focus-visible:ring-brand-500/40"
            >
              <Plus className="size-4" aria-hidden /> Save visit
            </Button>
          </div>
        </section>
      ) : (
        <button
          type="button"
          onClick={openForm}
          aria-label="Record a new customer visit"
          className="flex min-h-[92px] w-full flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed border-white/15 text-cream-100/50 transition hover:border-brand-500/50 hover:text-gold-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        >
          <Plus className="size-6" aria-hidden />
          <span className="font-display text-sm font-bold tracking-widest">RECORD CUSTOMER VISIT</span>
        </button>
      )}

      {/* Day list */}
      <section aria-label="Visits for the selected day" className="rounded-2xl border border-white/10 bg-plum-900/80 p-5">
        <h2 className="mb-3 font-display text-sm font-bold uppercase tracking-widest text-cream-100/80">
          {prettyDate(dateKey)} — {dayVisits.length} {dayVisits.length === 1 ? "visit" : "visits"}
        </h2>

        {!ready ? (
          <p className="text-sm text-cream-100/40">Loading records…</p>
        ) : dayVisits.length === 0 ? (
          <p className="text-sm text-cream-100/40">
            No visits recorded for this day. Tap “Record customer visit” to add one.
          </p>
        ) : (
          <ul className="scroll-area flex max-h-96 flex-col gap-2 overflow-y-auto pr-1">
            {dayVisits.map((v) => {
              const duration = Math.max(0, v.departedAt - v.arrivedAt);
              return (
                <li
                  key={v.id}
                  className="rounded-xl bg-plum-950/50 px-4 py-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                    <span className="text-sm font-semibold tabular-nums text-cream-100">
                      {formatMinutes(duration)} · {formatTimeLabel(v.arrivedAt)} → {formatTimeLabel(v.departedAt)}
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="rounded-full border border-white/10 bg-plum-900 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-cream-100/70">
                        {v.paymentMethod}
                      </span>
                      <span className="font-display text-base font-bold tabular-nums text-gold-400">
                        {formatINR(v.billAmount)}
                      </span>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label={`Delete visit at ${formatTimeLabel(v.arrivedAt)}`}
                            className="size-8 text-cream-100/40 hover:bg-coral-500/10 hover:text-coral-500"
                          >
                            <Trash2 className="size-4" aria-hidden />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="rounded-2xl border-white/10 bg-plum-900 text-cream-100">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="font-display">Delete this visit?</AlertDialogTitle>
                            <AlertDialogDescription className="text-cream-100/60">
                              {formatTimeLabel(v.arrivedAt)} → {formatTimeLabel(v.departedAt)} · {formatINR(v.billAmount)}{" "}
                              ({v.paymentMethod}). This cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="border-white/15 bg-transparent text-cream-100 hover:bg-white/10 hover:text-cream-100">
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => {
                                removeVisit(v.id);
                                toast.success("Visit deleted");
                              }}
                              className="bg-coral-500 text-white hover:bg-coral-500/90 focus-visible:ring-coral-500/40"
                            >
                              Yes, delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-cream-100/55">
                    {itemsSummary(v.items) || "No items recorded"}
                    {v.note ? <span className="text-cream-100/40"> · {v.note}</span> : null}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

/** "2:15 PM" — local 12-hour label. */
function formatTimeLabel(epochMs: number): string {
  return new Date(epochMs).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true });
}
