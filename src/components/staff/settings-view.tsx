"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { IndianRupee, KeyRound, Save, Trash2, TriangleAlert, type LucideIcon } from "lucide-react";
import { toast } from "sonner";
import { computeCharge, formatINR, formatMinutes, type ChargeConfig } from "@/lib/charge";
import { DEFAULT_PIN, setPin } from "@/lib/staff-storage";
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

const PREVIEW_MINUTES = [45, 105, 165, 225, 285] as const;

interface SectionCardProps {
  title: string;
  description?: string;
  icon: LucideIcon;
  danger?: boolean;
  children: ReactNode;
}

function SectionCard({ title, description, icon: Icon, danger = false, children }: SectionCardProps) {
  return (
    <section
      className={cn(
        "rounded-2xl border bg-plum-900/80 p-5 sm:p-6",
        danger ? "border-coral-500/25" : "border-white/10",
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-xl border",
            danger ? "border-coral-500/30 bg-coral-500/10" : "border-brand-500/30 bg-brand-500/10",
          )}
        >
          <Icon className={cn("size-5", danger ? "text-coral-500" : "text-brand-400")} aria-hidden />
        </div>
        <div>
          <h2 className="font-display text-base font-bold text-cream-100">{title}</h2>
          {description && <p className="mt-0.5 text-xs text-cream-100/50">{description}</p>}
        </div>
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

interface SettingsViewProps {
  config: ChargeConfig;
  onSaveConfig: (config: ChargeConfig) => void;
  onResetTables: () => void;
  onResetEverything: () => void;
}

/** Staff settings: charge rule, PIN and danger zone. */
export default function SettingsView({ config, onSaveConfig, onResetTables, onResetEverything }: SettingsViewProps) {
  // Charge config draft — re-synced whenever the saved config changes.
  const [freeMin, setFreeMin] = useState(String(config.freeMinutes));
  const [intervalMin, setIntervalMin] = useState(String(config.intervalMinutes));
  const [chargeAmt, setChargeAmt] = useState(String(config.intervalCharge));
  // PIN draft
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");

  useEffect(() => {
    setFreeMin(String(config.freeMinutes));
    setIntervalMin(String(config.intervalMinutes));
    setChargeAmt(String(config.intervalCharge));
  }, [config]);

  const draftConfig = useMemo<ChargeConfig>(
    () => ({
      freeMinutes: Number(freeMin) || 0,
      intervalMinutes: Number(intervalMin) || 0,
      intervalCharge: Number(chargeAmt) || 0,
    }),
    [freeMin, intervalMin, chargeAmt],
  );

  const saveConfig = () => {
    if (freeMin.trim() === "" || intervalMin.trim() === "" || chargeAmt.trim() === "") {
      toast.error("Fill in all three values first");
      return;
    }
    const free = Number(freeMin);
    const interval = Number(intervalMin);
    const amount = Number(chargeAmt);
    // No artificial limits — staff set whatever rule the cafe wants.
    // Only guard values that would break the math itself.
    if (!Number.isFinite(free) || free < 0) {
      toast.error("Free time must be 0 minutes or more");
      return;
    }
    if (!Number.isFinite(interval) || interval <= 0) {
      toast.error("Charge interval must be more than 0 minutes");
      return;
    }
    if (!Number.isFinite(amount) || amount < 0) {
      toast.error("Charge amount must be ₹0 or more");
      return;
    }
    onSaveConfig({ freeMinutes: free, intervalMinutes: interval, intervalCharge: amount });
    toast.success("Charge settings saved");
  };

  const changePin = () => {
    if (!/^\d{4}$/.test(newPin)) {
      toast.error("New PIN must be exactly 4 digits");
      return;
    }
    if (newPin !== confirmPin) {
      toast.error("PINs do not match");
      return;
    }
    if (newPin === DEFAULT_PIN) {
      toast.error("Choose something other than the default 1234");
      return;
    }
    setPin(newPin);
    setNewPin("");
    setConfirmPin("");
    toast.success("Staff PIN updated");
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Seating / extended stay charge */}
      <SectionCard
        title="Seating / Extended Stay Charge"
        description="First minutes free, then a charge for every completed interval."
        icon={IndianRupee}
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="grid gap-1.5">
            <Label htmlFor="cfg-free" className="text-cream-100/80">
              Free time (min)
            </Label>
            <Input
              id="cfg-free"
              type="number"
              min={0}
              step="any"
              value={freeMin}
              onChange={(e) => setFreeMin(e.target.value)}
              className={INPUT_CLS}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="cfg-interval" className="text-cream-100/80">
              Charge interval (min)
            </Label>
            <Input
              id="cfg-interval"
              type="number"
              min={0}
              step="any"
              value={intervalMin}
              onChange={(e) => setIntervalMin(e.target.value)}
              className={INPUT_CLS}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="cfg-amount" className="text-cream-100/80">
              Charge amount (₹)
            </Label>
            <Input
              id="cfg-amount"
              type="number"
              min={0}
              step="any"
              value={chargeAmt}
              onChange={(e) => setChargeAmt(e.target.value)}
              className={INPUT_CLS}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button
            type="button"
            onClick={saveConfig}
            className="bg-brand-500 text-white hover:bg-brand-600 focus-visible:ring-brand-500/40"
          >
            <Save className="size-4" aria-hidden /> Save charge settings
          </Button>
          <span className="text-xs text-cream-100/40">Any values allowed — applies to all tables instantly.</span>
        </div>

        {/* Live mini preview (draft values) */}
        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between text-[11px] font-semibold uppercase tracking-widest text-cream-100/45">
            <span>Stay length</span>
            <span>Charge</span>
          </div>
          <div className="flex flex-col gap-1.5">
            {PREVIEW_MINUTES.map((m) => {
              const r = computeCharge(m * 60_000, draftConfig);
              return (
                <div
                  key={m}
                  className="flex items-center justify-between rounded-lg bg-plum-950/50 px-3 py-2 text-sm"
                >
                  <span className="text-cream-100/70">{formatMinutes(m * 60_000)}</span>
                  <span className={cn("font-semibold tabular-nums", r.charge > 0 ? "text-gold-400" : "text-emerald-400")}>
                    {formatINR(r.charge)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </SectionCard>

      {/* Staff PIN */}
      <SectionCard title="Staff PIN" description="Ask the counter staff to type this before opening the panel." icon={KeyRound}>
        <p className="mb-4 text-sm text-cream-100/60">
          Current PIN: <span className="tracking-[0.35em] text-cream-100">••••</span>
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <Label htmlFor="pin-new" className="text-cream-100/80">
              New 4-digit PIN
            </Label>
            <Input
              id="pin-new"
              type="password"
              inputMode="numeric"
              autoComplete="new-password"
              maxLength={4}
              placeholder="e.g. 2468"
              value={newPin}
              onChange={(e) => setNewPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
              className={INPUT_CLS}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="pin-confirm" className="text-cream-100/80">
              Confirm PIN
            </Label>
            <Input
              id="pin-confirm"
              type="password"
              inputMode="numeric"
              autoComplete="off"
              maxLength={4}
              placeholder="Repeat PIN"
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
              className={INPUT_CLS}
            />
          </div>
        </div>
        <div className="mt-4">
          <Button
            type="button"
            onClick={changePin}
            className="bg-brand-500 text-white hover:bg-brand-600 focus-visible:ring-brand-500/40"
          >
            <KeyRound className="size-4" aria-hidden /> Change PIN
          </Button>
        </div>
      </SectionCard>

      {/* Danger zone */}
      <SectionCard title="Danger Zone" description="Careful — these actions cannot be undone." icon={TriangleAlert} danger>
        <div className="flex flex-col gap-3 sm:flex-row">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="border-coral-500/40 bg-coral-500/10 text-coral-500 hover:bg-coral-500/20 hover:text-coral-500 focus-visible:ring-coral-500/40"
              >
                <Trash2 className="size-4" aria-hidden /> Reset all tables
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-2xl border-white/10 bg-plum-900 text-cream-100">
              <AlertDialogHeader>
                <AlertDialogTitle className="font-display">Reset all tables?</AlertDialogTitle>
                <AlertDialogDescription className="text-cream-100/60">
                  Every running timer stops and every table returns to FREE. No charge log entries are created.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="border-white/15 bg-transparent text-cream-100 hover:bg-white/10 hover:text-cream-100">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={onResetTables}
                  className="bg-coral-500 text-white hover:bg-coral-500/90 focus-visible:ring-coral-500/40"
                >
                  Yes, reset tables
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                type="button"
                className="bg-coral-500 text-white hover:bg-coral-500/90 focus-visible:ring-coral-500/40"
              >
                <TriangleAlert className="size-4" aria-hidden /> Reset everything
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-2xl border-white/10 bg-plum-900 text-cream-100">
              <AlertDialogHeader>
                <AlertDialogTitle className="font-display">Reset everything?</AlertDialogTitle>
                <AlertDialogDescription className="text-cream-100/60">
                  Wipes tables, shift log, charge settings and the staff PIN back to factory defaults. This cannot be
                  undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="border-white/15 bg-transparent text-cream-100 hover:bg-white/10 hover:text-cream-100">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={onResetEverything}
                  className="bg-coral-500 text-white hover:bg-coral-500/90 focus-visible:ring-coral-500/40"
                >
                  Yes, wipe everything
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </SectionCard>
    </div>
  );
}
