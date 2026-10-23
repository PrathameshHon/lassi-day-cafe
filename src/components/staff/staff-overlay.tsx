"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Armchair, Calculator, Coins, Plus, Settings2, UtensilsCrossed, Wallet, X } from "lucide-react";
import { toast } from "sonner";
import { computeCharge, formatINR, formatTimeOfDay } from "@/lib/charge";
import { useTick } from "@/hooks/use-tick";
import { MAX_TABLES, resetEverything, useChargeConfig, useTables, type TableOrderLine } from "@/lib/staff-storage";
import { useStaffStore } from "@/lib/store/staff";
import { dateKeyOf, useVisits, type PaymentMethod } from "@/lib/visits";
import { useMenu } from "@/lib/staff-menu";
import PinGate from "@/components/staff/pin-gate";
import TableCard from "@/components/staff/table-card";
import CalculatorView from "@/components/staff/calculator-view";
import EarningsView from "@/components/staff/earnings-view";
import MenuManageView from "@/components/staff/menu-manage-view";
import TableOrderDialog from "@/components/staff/table-order-dialog";
import SettingsView from "@/components/staff/settings-view";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

function Chip({ label, dot }: { label: string; dot: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-plum-900/80 px-3.5 py-1.5 text-xs font-medium text-cream-100/80">
      <span className={cn("size-2 rounded-full", dot)} aria-hidden />
      {label}
    </span>
  );
}

const TRIGGER_CLS =
  "h-8 flex-1 rounded-lg px-3 text-cream-100/60 data-[state=active]:bg-brand-500 data-[state=active]:text-white data-[state=active]:shadow-none sm:px-4";

/**
 * Hidden full-screen Staff Area (opened via the footer "Staff" link).
 * PIN gate → table-timer dashboard, calculator and settings.
 * 100% client-side; persists via localStorage (staff-storage.ts).
 */
export default function StaffOverlay() {
  const open = useStaffStore((s) => s.open);
  const setOpen = useStaffStore((s) => s.setOpen);

  const [unlocked, setUnlocked] = useState(false);
  const [logoOk, setLogoOk] = useState(true);

  const now = useTick(1000);
  const {
    tables,
    log,
    ready,
    addTable,
    removeTable,
    startTable,
    startTableAt,
    updateOrder,
    stopTable,
    closeWithDuration,
    resetTable,
    resetAll,
    clearLog,
    reload,
  } = useTables();
  const { config, setConfig, reload: reloadConfig } = useChargeConfig();
  // Single source of truth for both hooks — shared with child tabs so edits
  // in Menu Management / Earnings are instantly visible everywhere.
  const visitsApi = useVisits();
  const menuApi = useMenu();
  const { addVisit } = visitsApi;
  const { menu } = menuApi;

  const [orderTableId, setOrderTableId] = useState<string | null>(null);
  const orderTable = orderTableId !== null ? (tables.find((t) => t.id === orderTableId) ?? null) : null;

  // Single close path: reset the PIN session AND close the overlay.
  const close = useCallback(() => {
    setUnlocked(false);
    setOrderTableId(null);
    setOpen(false);
  }, [setOpen]);

  // Escape closes the overlay — unless an inner Radix dialog/alert-dialog is open
  // (those handle their own Escape), or the table order popup is open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (orderTableId !== null) return; // order popup handles its own Escape
      const innerDialog = document.querySelector('[role="dialog"][data-state="open"], [role="alertdialog"][data-state="open"]');
      if (innerDialog) return;
      close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close, orderTableId]);

  // Lock body scroll while the takeover is open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const handleStop = useCallback(
    (id: string) => {
      const target = tables.find((t) => t.id === id);
      if (target && (target.order?.length ?? 0) > 0) {
        toast.warning("Order discarded — use ORDER & BILL to save food charges first");
      }
      const entry = stopTable(id);
      if (entry) toast.success(`Table closed — ${formatINR(entry.charge)} seating charge`);
    },
    [tables, stopTable],
  );

  /** Final bill: stop timer, snapshot the order + prices, save to Earnings/Excel, free the table. */
  const handleFinalBill = useCallback(
    (id: string, payment: PaymentMethod) => {
      const table = tables.find((t) => t.id === id);
      if (!table || table.status !== "occupied") return;
      const orderSnapshot: TableOrderLine[] = (table.order ?? []).filter((l) => l.qty > 0);
      const entry = stopTable(id);
      if (!entry) return;
      const foodSubtotal = orderSnapshot.reduce((sum, l) => sum + l.price * l.qty, 0);
      const total = foodSubtotal + entry.charge;
      addVisit({
        date: dateKeyOf(entry.endedAt),
        arrivedAt: entry.startedAt,
        departedAt: entry.endedAt,
        items: orderSnapshot.map(({ name, qty, price }) => ({ name, qty, price })),
        billAmount: total,
        paymentMethod: payment,
        foodSubtotal,
        seatingCharge: entry.charge,
        note: `${table.name}${table.customerName ? ` — ${table.customerName}` : ""} (food ${formatINR(foodSubtotal)} + seating ${formatINR(entry.charge)})`,
      });
      setOrderTableId(null);
      toast.success(`Final bill ${formatINR(total)} (${payment}) — ${table.name} is free`);
    },
    [tables, stopTable, addVisit],
  );

  const handleLogDuration = useCallback(
    (id: string, durationMs: number) => {
      const entry = closeWithDuration(id, durationMs);
      if (entry) toast.success(`Table closed — ${formatINR(entry.charge)} seating charge`);
    },
    [closeWithDuration],
  );

  const handleAdd = useCallback(() => {
    if (!addTable()) toast.error(`Maximum of ${MAX_TABLES} tables reached`);
  }, [addTable]);

  const handleResetTables = useCallback(() => {
    resetAll();
    toast.success("All tables reset to FREE");
  }, [resetAll]);

  const handleResetTable = useCallback(
    (id: string) => {
      const target = tables.find((t) => t.id === id);
      if (target && (target.order?.length ?? 0) > 0) {
        toast.warning("Order discarded — table reset without a bill");
      }
      resetTable(id);
    },
    [tables, resetTable],
  );

  const handleResetEverything = useCallback(() => {
    resetEverything();
    reload();
    reloadConfig();
    toast.success("Staff data wiped — back to factory defaults");
  }, [reload, reloadConfig]);

  const handleClearLog = useCallback(() => {
    clearLog();
    toast.success("Shift log cleared");
  }, [clearLog]);

  const occupiedCount = tables.filter((t) => t.status === "occupied").length;
  const freeCount = tables.length - occupiedCount;
  const totalActiveCharge = tables.reduce((sum, t) => {
    if (t.status !== "occupied" || t.startedAt === null) return sum;
    return sum + computeCharge(Math.max(0, now - t.startedAt), config).charge;
  }, 0);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="staff-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          role="dialog"
          aria-modal="true"
          aria-label="Staff table control panel"
          className="fixed inset-0 z-[100] max-h-screen overflow-y-auto bg-plum-950/98 backdrop-blur-md"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(214,41,107,0.14),transparent_55%)]"
          />

          {!unlocked ? (
            <PinGate onUnlock={() => setUnlocked(true)} onBack={close} />
          ) : !ready ? (
            <div className="relative flex min-h-screen items-center justify-center">
              <p className="animate-pulse font-display text-sm tracking-[0.3em] text-cream-100/50">
                LOADING TABLES…
              </p>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="relative mx-auto w-full max-w-6xl px-4 pb-16 pt-6 sm:px-6 sm:pt-8"
            >
              {/* Header */}
              <header className="flex items-center gap-3">
                {logoOk ? (
                  <img
                    src="/images/logo.png"
                    alt="Lassi Day Cafe logo"
                    className="h-10 w-10 rounded-full border border-gold-400/40 object-cover"
                    onError={() => setLogoOk(false)}
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-gold-400/40 bg-plum-800 font-display text-xs font-bold text-gold-400">
                    LD
                  </div>
                )}
                <div>
                  <h1 className="font-display text-lg font-bold leading-tight tracking-wide text-gold-400 text-glow-gold">
                    LASSI DAY • KOPARGAON
                  </h1>
                  <p className="text-[11px] uppercase tracking-[0.25em] text-cream-100/50">Table Control</p>
                </div>
                <div className="ml-auto flex items-center gap-3">
                  <span className="hidden text-sm tabular-nums text-cream-100/70 sm:block" aria-label="Current time">
                    {now > 0 ? formatTimeOfDay(now) : "--:--"}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={close}
                    aria-label="Close staff panel"
                    className="text-cream-100/70 hover:bg-white/10 hover:text-cream-100 focus-visible:ring-brand-500/40"
                  >
                    <X className="size-5" aria-hidden />
                  </Button>
                </div>
              </header>

              {/* Gold thin separator */}
              <div
                className="mt-4 h-px w-full bg-gradient-to-r from-gold-400/50 via-brand-500/40 to-transparent"
                aria-hidden
              />

              <Tabs defaultValue="tables" className="mt-6 gap-6">
                <TabsList className="flex h-11 w-full justify-start overflow-x-auto rounded-xl border border-white/10 bg-plum-900/80 p-1 sm:w-auto">
                  <TabsTrigger value="tables" className={TRIGGER_CLS}>
                    <Armchair className="size-4" aria-hidden /> Tables
                  </TabsTrigger>
                  <TabsTrigger value="calculator" className={TRIGGER_CLS}>
                    <Calculator className="size-4" aria-hidden /> Calculator
                  </TabsTrigger>
                  <TabsTrigger value="earnings" className={TRIGGER_CLS}>
                    <Wallet className="size-4" aria-hidden /> Earnings
                  </TabsTrigger>
                  <TabsTrigger value="menu" className={TRIGGER_CLS}>
                    <UtensilsCrossed className="size-4" aria-hidden /> Menu
                  </TabsTrigger>
                  <TabsTrigger value="settings" className={TRIGGER_CLS}>
                    <Settings2 className="size-4" aria-hidden /> Settings
                  </TabsTrigger>
                </TabsList>

                {/* ─── Tables tab ─── */}
                <TabsContent value="tables" className="flex flex-col gap-5 outline-none">
                  <div className="flex flex-wrap items-center gap-2" aria-label="Floor summary">
                    <Chip label={`${freeCount} free`} dot="bg-emerald-500" />
                    <Chip label={`${occupiedCount} occupied`} dot="bg-gold-400" />
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-plum-900/80 px-3.5 py-1.5 text-xs font-medium text-gold-400">
                      <Coins className="size-3.5" aria-hidden />
                      Active charges <span className="tabular-nums">{formatINR(totalActiveCharge)}</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {tables.map((table) => (
                      <TableCard
                        key={table.id}
                        table={table}
                        now={now}
                        config={config}
                        onStart={startTable}
                        onStartAt={startTableAt}
                        onOpenOrder={setOrderTableId}
                        onStop={handleStop}
                        onLogDuration={handleLogDuration}
                        onReset={handleResetTable}
                        onRemove={removeTable}
                      />
                    ))}

                    <button
                      type="button"
                      onClick={handleAdd}
                      aria-label="Add a new table"
                      className="flex min-h-[230px] flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-white/15 text-cream-100/50 transition hover:border-brand-500/50 hover:text-gold-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                    >
                      <Plus className="size-7" aria-hidden />
                      <span className="font-display text-sm font-bold tracking-widest">ADD TABLE</span>
                    </button>
                  </div>

                  {/* Closed tables log */}
                  <section
                    aria-label="Closed tables log"
                    className="rounded-2xl border border-white/10 bg-plum-900/80 p-5"
                  >
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <h2 className="font-display text-sm font-bold uppercase tracking-widest text-cream-100/80">
                        Today&apos;s closed tables
                      </h2>
                      {log.length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleClearLog}
                          className="text-cream-100/50 hover:bg-white/5 hover:text-coral-500 focus-visible:ring-coral-500/40"
                        >
                          Clear log
                        </Button>
                      )}
                    </div>
                    {log.length === 0 ? (
                      <p className="text-sm text-cream-100/40">No tables closed yet this shift.</p>
                    ) : (
                      <ul className="scroll-area flex max-h-64 flex-col gap-1.5 overflow-y-auto">
                        {log.slice(0, 8).map((entry, i) => (
                          <li
                            key={`${entry.tableName}-${entry.startedAt}-${i}`}
                            className="flex flex-wrap items-center justify-between gap-x-3 gap-y-0.5 rounded-lg bg-plum-950/50 px-3 py-2 text-sm"
                          >
                            <span className="font-medium text-cream-100">{entry.tableName}</span>
                            <span className="text-xs tabular-nums text-cream-100/50">
                              {formatTimeOfDay(entry.startedAt)} → {formatTimeOfDay(entry.endedAt)}
                            </span>
                            <span className="font-semibold tabular-nums text-gold-400">
                              {formatINR(entry.charge)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </section>
                </TabsContent>

                {/* ─── Calculator tab ─── */}
                <TabsContent value="calculator" className="outline-none">
                  <CalculatorView config={config} />
                </TabsContent>

                {/* ─── Earnings tab ─── */}
                <TabsContent value="earnings" className="outline-none">
                  <EarningsView now={now} visitsApi={visitsApi} />
                </TabsContent>

                {/* ─── Menu Management tab ─── */}
                <TabsContent value="menu" className="outline-none">
                  <MenuManageView menuApi={menuApi} />
                </TabsContent>

                {/* ─── Settings tab ─── */}
                <TabsContent value="settings" className="outline-none">
                  <SettingsView
                    config={config}
                    onSaveConfig={setConfig}
                    onResetTables={handleResetTables}
                    onResetEverything={handleResetEverything}
                  />
                </TabsContent>
              </Tabs>
            </motion.div>
          )}

          {/* Occupied-table order popup */}
          {orderTable && (
            <TableOrderDialog
              table={orderTable}
              config={config}
              now={now}
              menu={menu}
              open={orderTableId !== null}
              onOpenChange={(o) => {
                if (!o) setOrderTableId(null);
              }}
              onUpdateOrder={updateOrder}
              onFinalBill={handleFinalBill}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
