"use client";

import { useMemo, useState } from "react";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { useTick } from "@/hooks/use-tick";
import { computeCharge, formatINR, formatMinutes, type ChargeConfig } from "@/lib/charge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Mode = "duration" | "start";

const INPUT_CLS =
  "[color-scheme:dark] border-white/15 bg-plum-950/60 text-cream-100 placeholder:text-cream-100/30 focus-visible:ring-brand-500/40";

interface CalculatorViewProps {
  config: ChargeConfig;
}

/** Seating-charge calculator: "Duration" and "Start time" modes with live results. */
export default function CalculatorView({ config }: CalculatorViewProps) {
  const now = useTick(1000);
  const [mode, setMode] = useState<Mode>("duration");
  const [hours, setHours] = useState("2");
  const [minutes, setMinutes] = useState("0");
  const [timeValue, setTimeValue] = useState(() => {
    // Client-only component (inactive Radix tab panels never render on the server).
    const d = new Date(Date.now() - 60 * 60_000);
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  });

  const durationMs = useMemo(
    () => Math.max(0, (Number(hours) || 0) * 3_600_000 + (Number(minutes) || 0) * 60_000),
    [hours, minutes],
  );

  const startEpoch = useMemo(() => {
    const match = /^(\d{1,2}):(\d{2})$/.exec(timeValue.trim());
    if (!match) return null;
    const h = Number(match[1]);
    const m = Number(match[2]);
    if (h > 23 || m > 59) return null;
    const d = new Date();
    d.setHours(h, m, 0, 0);
    return d.getTime();
  }, [timeValue]);

  const activeMs =
    mode === "duration"
      ? durationMs
      : startEpoch !== null && now > 0
        ? Math.max(0, now - startEpoch)
        : 0;

  const result = computeCharge(activeMs, config);
  const startInFuture = startEpoch !== null && now > 0 && startEpoch > now;

  const copyAmount = async () => {
    try {
      await navigator.clipboard.writeText(String(result.charge));
      toast.success(`Copied ${formatINR(result.charge)} to clipboard`);
    } catch {
      toast.error("Could not access the clipboard");
    }
  };

  return (
    <section
      aria-label="Seating charge calculator"
      className="rounded-2xl border border-white/10 bg-plum-900/80 p-5 sm:p-6"
    >
      <h2 className="font-display text-lg font-bold text-cream-100">Seating Charge Calculator</h2>
      <p className="mt-0.5 text-xs text-cream-100/50">
        Preview what a guest owes before you close the table.
      </p>

      <Tabs value={mode} onValueChange={(v) => setMode(v as Mode)} className="mt-4">
        <TabsList className="h-10 rounded-xl border border-white/10 bg-plum-950/60 p-1">
          <TabsTrigger
            value="duration"
            className="rounded-lg px-4 text-cream-100/60 data-[state=active]:bg-brand-500 data-[state=active]:text-white"
          >
            Duration
          </TabsTrigger>
          <TabsTrigger
            value="start"
            className="rounded-lg px-4 text-cream-100/60 data-[state=active]:bg-brand-500 data-[state=active]:text-white"
          >
            Start time
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {mode === "duration" ? (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:max-w-[240px]">
          <div className="grid gap-1.5">
            <Label htmlFor="calc-hours" className="text-cream-100/80">
              Hours
            </Label>
            <Input
              id="calc-hours"
              type="number"
              min={0}
              step="any"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              className={INPUT_CLS}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="calc-minutes" className="text-cream-100/80">
              Minutes
            </Label>
            <Input
              id="calc-minutes"
              type="number"
              min={0}
              max={59}
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
              className={INPUT_CLS}
            />
          </div>
        </div>
      ) : (
        <div className="mt-4 sm:max-w-[240px]">
          <div className="grid gap-1.5">
            <Label htmlFor="calc-start" className="text-cream-100/80">
              Guests sat down at
            </Label>
            <Input
              id="calc-start"
              type="time"
              value={timeValue}
              onChange={(e) => setTimeValue(e.target.value)}
              className={INPUT_CLS}
            />
          </div>
          {startInFuture && (
            <p className="mt-1.5 text-xs text-coral-500">That time is later today — counting from now.</p>
          )}
        </div>
      )}

      <div className="mt-6 flex flex-col items-start gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-[11px] uppercase tracking-[0.2em] text-cream-100/50">
            {formatMinutes(activeMs)} stay
          </div>
          <div className="mt-1 font-display text-5xl font-bold tabular-nums text-gold-400 text-glow-gold">
            {formatINR(result.charge)}
          </div>
        </div>
        <Button
          type="button"
          onClick={copyAmount}
          variant="outline"
          className="border-white/15 bg-plum-950/60 text-cream-100 hover:bg-plum-800 hover:text-gold-400 focus-visible:ring-brand-500/40"
        >
          <Copy className="size-4" aria-hidden /> Copy amount
        </Button>
      </div>

      <div className="my-5 h-px w-full bg-white/10" aria-hidden />

      <ul className="flex flex-col gap-2 text-sm">
        <li className="flex items-center justify-between gap-3">
          <span className="text-cream-100/60">Free window — first {config.freeMinutes} min</span>
          <span className="tabular-nums text-cream-100/80">₹0</span>
        </li>
        <li className="flex items-center justify-between gap-3">
          <span className="text-cream-100/60">
            Completed intervals — {result.completedIntervals} × {config.intervalMinutes} min
          </span>
          <span className="tabular-nums text-cream-100/80">
            {formatINR(result.completedIntervals * config.intervalCharge)}
          </span>
        </li>
        <li className="flex items-center justify-between gap-3 font-semibold">
          <span className="text-cream-100">Total payable</span>
          <span className="tabular-nums text-gold-400">{formatINR(result.charge)}</span>
        </li>
      </ul>

      <p className="mt-5 text-xs text-cream-100/40">
        Rule: first {config.freeMinutes} min free, then {formatINR(config.intervalCharge)} per completed{" "}
        {config.intervalMinutes} min. Configure in Settings.
      </p>
    </section>
  );
}
