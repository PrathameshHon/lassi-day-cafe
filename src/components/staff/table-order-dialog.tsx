"use client";

import { useMemo, useState } from "react";
import { Minus, Plus, ReceiptText, Search, Trash2, UtensilsCrossed, X } from "lucide-react";
import { computeCharge, formatDuration, formatINR, tableTier, type ChargeConfig } from "@/lib/charge";
import { PAYMENT_METHODS, type PaymentMethod } from "@/lib/visits";
import type { Table, TableOrderLine } from "@/lib/staff-storage";
import type { StaffMenuItem } from "@/lib/staff-menu";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const INPUT_CLS =
  "[color-scheme:dark] border-white/15 bg-plum-950/60 text-cream-100 placeholder:text-cream-100/30 focus-visible:ring-brand-500/40";

interface TableOrderDialogProps {
  table: Table;
  config: ChargeConfig;
  /** Live epoch ms from useTick (0 = not mounted yet). */
  now: number;
  menu: StaffMenuItem[];
  onUpdateOrder: (tableId: string, lines: TableOrderLine[]) => void;
  onFinalBill: (tableId: string, payment: PaymentMethod) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Occupied-table popup: browse the live staff menu, build the food order,
 * watch food + seating charges as a running total, then generate the final bill.
 */
export default function TableOrderDialog({
  table,
  config,
  now,
  menu,
  onUpdateOrder,
  onFinalBill,
  open,
  onOpenChange,
}: TableOrderDialogProps) {
  const [search, setSearch] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [payment, setPayment] = useState<PaymentMethod>("Cash");

  const order: TableOrderLine[] = table.order ?? [];
  const elapsed = table.startedAt !== null && now > 0 ? Math.max(0, now - table.startedAt) : 0;
  const charge = computeCharge(elapsed, config);
  const tier = tableTier("occupied", elapsed, config);
  const foodSubtotal = order.reduce((sum, l) => sum + l.price * l.qty, 0);
  const runningTotal = foodSubtotal + charge.charge;

  const grouped = useMemo(() => {
    const q = search.trim().toLowerCase();
    const groups = new Map<string, StaffMenuItem[]>();
    for (const item of menu) {
      if (q !== "" && !item.name.toLowerCase().includes(q) && !item.category.toLowerCase().includes(q)) continue;
      const list = groups.get(item.category) ?? [];
      list.push(item);
      groups.set(item.category, list);
    }
    return Array.from(groups.entries());
  }, [menu, search]);

  const addMenuItem = (item: StaffMenuItem) => {
    const existing = order.find((l) => l.name === item.name && l.price === item.price);
    const next = existing
      ? order.map((l) => (l === existing ? { ...l, qty: l.qty + 1 } : l))
      : [...order, { name: item.name, price: item.price, qty: 1 }];
    onUpdateOrder(table.id, next);
  };

  const changeQty = (idx: number, delta: number) => {
    const next = order
      .map((l, i) => (i === idx ? { ...l, qty: l.qty + delta } : l))
      .filter((l) => l.qty > 0);
    onUpdateOrder(table.id, next);
  };

  const removeLine = (idx: number) => {
    onUpdateOrder(table.id, order.filter((_, i) => i !== idx));
  };

  const confirmBill = () => {
    onFinalBill(table.id, payment);
    setConfirming(false);
  };

  const tierDot =
    tier === "charge-active" ? "bg-coral-500" : tier === "approaching" ? "bg-amber-400" : "bg-gold-400";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] overflow-y-auto rounded-2xl border-white/10 bg-plum-900 text-cream-100 sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex flex-wrap items-center gap-2 font-display">
            {table.name}
            {table.customerName && (
              <span className="rounded-full border border-gold-400/40 bg-gold-400/10 px-2.5 py-0.5 text-xs font-semibold text-gold-400">
                {table.customerName}
              </span>
            )}
            <span className="ml-auto flex items-center gap-1.5 text-xs font-medium tabular-nums text-cream-100/60">
              <span className={cn("size-2 rounded-full", tierDot, tier !== "safe" && "animate-pulse")} aria-hidden />
              {formatDuration(elapsed)}
            </span>
          </DialogTitle>
          <DialogDescription className="text-cream-100/60">
            Add food from the menu, adjust quantities, and close with the final bill when the guests leave.
          </DialogDescription>
        </DialogHeader>

        {/* ── Menu browser ── */}
        <section aria-label="Menu">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-cream-100/40" aria-hidden />
            <Input
              type="search"
              placeholder="Search the menu…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={cn(INPUT_CLS, "pl-9")}
              aria-label="Search menu items"
            />
          </div>

          <div className="scroll-area mt-3 max-h-56 space-y-3 overflow-y-auto rounded-xl border border-white/10 bg-plum-950/40 p-3">
            {grouped.length === 0 && (
              <p className="py-4 text-center text-sm text-cream-100/40">No menu items match “{search}”.</p>
            )}
            {grouped.map(([category, items]) => (
              <div key={category}>
                <h4 className="mb-1.5 text-[11px] font-semibold uppercase tracking-widest text-gold-400/80">{category}</h4>
                <ul className="flex flex-col gap-1">
                  {items.map((item) => {
                    const inOrder = order.find((l) => l.name === item.name && l.price === item.price);
                    return (
                      <li key={item.id}>
                        <button
                          type="button"
                          onClick={() => addMenuItem(item)}
                          className="flex w-full items-center justify-between gap-3 rounded-lg px-2.5 py-1.5 text-left transition hover:bg-brand-500/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                        >
                          <span className="min-w-0 flex-1 truncate text-sm text-cream-100">{item.name}</span>
                          <span className="flex shrink-0 items-center gap-2">
                            <span className="text-sm font-semibold tabular-nums text-cream-100/80">{formatINR(item.price)}</span>
                            {inOrder ? (
                              <span className="flex size-6 items-center justify-center rounded-md bg-brand-500 text-[11px] font-bold text-white">
                                {inOrder.qty}
                              </span>
                            ) : (
                              <Plus className="size-4 text-brand-400" aria-hidden />
                            )}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* ── Current order ── */}
        <section aria-label="Current order">
          <h4 className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-cream-100/50">
            <UtensilsCrossed className="size-3.5" aria-hidden /> Current order
          </h4>
          {order.length === 0 ? (
            <p className="rounded-xl border border-dashed border-white/10 px-3 py-4 text-center text-sm text-cream-100/40">
              No food added yet — tap menu items above to build the order.
            </p>
          ) : (
            <ul className="flex flex-col gap-1.5">
              {order.map((line, idx) => (
                <li key={`${line.name}-${line.price}`} className="flex items-center gap-2 rounded-lg bg-plum-950/50 px-2.5 py-1.5">
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm text-cream-100">{line.name}</span>
                    <span className="text-[11px] tabular-nums text-cream-100/45">
                      {formatINR(line.price)} × {line.qty}
                    </span>
                  </span>
                  <span className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => changeQty(idx, -1)}
                      aria-label={`Decrease ${line.name}`}
                      className="flex size-7 items-center justify-center rounded-md border border-white/10 text-cream-100/70 transition hover:border-white/25 hover:text-cream-100"
                    >
                      <Minus className="size-3.5" aria-hidden />
                    </button>
                    <span className="w-6 text-center text-sm font-semibold tabular-nums text-cream-100">{line.qty}</span>
                    <button
                      type="button"
                      onClick={() => changeQty(idx, +1)}
                      aria-label={`Increase ${line.name}`}
                      className="flex size-7 items-center justify-center rounded-md border border-white/10 text-cream-100/70 transition hover:border-brand-500/50 hover:text-gold-400"
                    >
                      <Plus className="size-3.5" aria-hidden />
                    </button>
                  </span>
                  <span className="w-16 text-right text-sm font-semibold tabular-nums text-cream-100">
                    {formatINR(line.price * line.qty)}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeLine(idx)}
                    aria-label={`Remove ${line.name} from order`}
                    className="flex size-7 items-center justify-center rounded-md text-cream-100/40 transition hover:bg-coral-500/10 hover:text-coral-500"
                  >
                    <X className="size-4" aria-hidden />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* ── Totals ── */}
        <section
          aria-label="Bill totals"
          className="rounded-xl border border-white/10 bg-plum-950/60 p-3.5"
        >
          <dl className="flex flex-col gap-1.5 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-cream-100/60">Food subtotal</dt>
              <dd className="font-semibold tabular-nums text-cream-100">{formatINR(foodSubtotal)}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-cream-100/60">
                Seating charge <span className="text-cream-100/35">({formatDuration(elapsed)})</span>
              </dt>
              <dd className={cn("font-semibold tabular-nums", charge.charge > 0 ? "text-coral-400" : "text-emerald-400")}>
                {formatINR(charge.charge)}
              </dd>
            </div>
            <div className="mt-1 flex items-center justify-between border-t border-white/10 pt-2">
              <dt className="font-display text-sm font-bold uppercase tracking-widest text-cream-100/80">Running total</dt>
              <dd className="font-display text-xl font-bold tabular-nums text-gold-400 text-glow-gold">
                {formatINR(runningTotal)}
              </dd>
            </div>
          </dl>
        </section>

        {/* ── Footer actions ── */}
        {confirming ? (
          <div className="rounded-xl border border-gold-400/30 bg-gold-400/5 p-3.5" aria-label="Confirm final bill">
            <p className="flex items-center gap-2 text-sm font-semibold text-cream-100">
              <ReceiptText className="size-4 text-gold-400" aria-hidden /> Final bill — {formatINR(runningTotal)}
            </p>
            <div className="mt-2.5 flex gap-2" role="group" aria-label="Payment method">
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
            <p className="mt-2 text-[11px] text-cream-100/50">
              Food {formatINR(foodSubtotal)} + seating {formatINR(charge.charge)} · saves to Earnings &amp; Excel, frees {table.name}.
            </p>
            <div className="mt-3 flex gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setConfirming(false)}
                className="flex-1 text-cream-100/70 hover:bg-white/10 hover:text-cream-100"
              >
                Back
              </Button>
              <Button
                type="button"
                onClick={confirmBill}
                className="flex-1 bg-brand-500 font-semibold text-white hover:bg-brand-600 focus-visible:ring-brand-500/40"
              >
                Confirm &amp; free table
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="flex-1 text-cream-100/70 hover:bg-white/10 hover:text-cream-100"
            >
              <Trash2 className="size-4" aria-hidden /> Done — keep table running
            </Button>
            <Button
              type="button"
              onClick={() => setConfirming(true)}
              className="flex-1 bg-brand-500 font-semibold tracking-wide text-white hover:bg-brand-600 focus-visible:ring-brand-500/40"
            >
              <ReceiptText className="size-4" aria-hidden /> Final bill &amp; close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
