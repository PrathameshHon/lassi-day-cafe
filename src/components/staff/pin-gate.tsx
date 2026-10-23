"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Delete, LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getPin, isDefaultPin } from "@/lib/staff-storage";
import { cn } from "@/lib/utils";

interface PinGateProps {
  onUnlock: () => void;
  onBack: () => void;
}

const DIGITS = ["1", "2", "3", "4", "5", "6", "7", "8", "9"] as const;

const KEY_CLASSES =
  "flex h-14 items-center justify-center rounded-xl border border-white/10 bg-plum-800/70 font-display text-xl font-semibold text-cream-100 transition hover:border-brand-500/40 hover:bg-plum-700 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500";

/** Full-screen PIN gate shown before the staff dashboard unlocks. */
export default function PinGate({ onUnlock, onBack }: PinGateProps) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  // PinGate only ever renders client-side (the overlay is closed during SSR),
  // so a lazy initializer reading localStorage is hydration-safe.
  const [showHint] = useState<boolean>(() => isDefaultPin());
  const [logoOk, setLogoOk] = useState(true);
  const busyRef = useRef(false);

  const verify = useCallback(
    (code: string) => {
      if (busyRef.current) return;
      busyRef.current = true;
      if (code === getPin()) {
        onUnlock();
        return; // gate unmounts — no need to reset busyRef
      }
      setError(true);
      setAttempt((a) => a + 1);
      window.setTimeout(() => {
        setPin("");
        setError(false);
        busyRef.current = false;
      }, 400);
    },
    [onUnlock],
  );

  const pushDigit = useCallback(
    (digit: string) => {
      if (busyRef.current || pin.length >= 4) return;
      const next = pin + digit;
      setPin(next);
      if (next.length === 4) verify(next);
    },
    [pin, verify],
  );

  const backspace = useCallback(() => {
    if (busyRef.current) return;
    setPin((p) => p.slice(0, -1));
  }, []);

  const clear = useCallback(() => {
    if (busyRef.current) return;
    setPin("");
    setError(false);
  }, []);

  // Physical keyboard support: digits + Backspace.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (/^[0-9]$/.test(e.key)) {
        e.preventDefault();
        pushDigit(e.key);
      } else if (e.key === "Backspace") {
        e.preventDefault();
        backspace();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pushDigit, backspace]);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,201,60,0.08),transparent_60%)]"
      />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="relative w-full max-w-xs rounded-2xl border border-white/10 bg-plum-900/80 p-6 shadow-2xl shadow-black/40"
      >
        <div className="flex flex-col items-center text-center">
          {logoOk ? (
            <img
              src="/images/logo.png"
              alt="Lassi Day Cafe logo"
              className="h-16 w-16 rounded-full border border-gold-400/40 object-cover"
              onError={() => setLogoOk(false)}
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-gold-400/40 bg-plum-800">
              <LockKeyhole className="size-7 text-gold-400" aria-hidden />
            </div>
          )}
          <h2 className="mt-4 font-display text-2xl font-bold text-cream-100">Staff Access</h2>
          <p className="mt-1 text-sm text-cream-100/55">Enter 4-digit PIN</p>
        </div>

        {/* Digit boxes — shake on a wrong attempt (key remount replays keyframes) */}
        <motion.div
          key={attempt}
          animate={error ? { x: [0, -12, 12, -8, 8, -4, 0] } : { x: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          role="group"
          aria-label="PIN entry"
          className="mt-6 flex justify-center gap-3"
        >
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              aria-hidden
              className={cn(
                "flex h-14 w-11 items-center justify-center rounded-xl border bg-plum-950/60 transition-colors duration-200",
                error ? "border-coral-500" : pin.length > i ? "border-gold-400/70" : "border-white/15",
              )}
            >
              {pin.length > i && <span className="size-3 rounded-full bg-gold-400" />}
            </div>
          ))}
        </motion.div>
        <span className="sr-only" aria-live="polite">
          {pin.length} of 4 digits entered
        </span>

        {/* Touch keypad (3×4 grid) */}
        <div className="mt-6 grid grid-cols-3 gap-2.5" aria-label="PIN keypad">
          {DIGITS.map((d) => (
            <button key={d} type="button" onClick={() => pushDigit(d)} aria-label={`Digit ${d}`} className={KEY_CLASSES}>
              {d}
            </button>
          ))}
          <button type="button" onClick={clear} aria-label="Clear entry" className={cn(KEY_CLASSES, "text-base")}>
            C
          </button>
          <button type="button" onClick={() => pushDigit("0")} aria-label="Digit 0" className={KEY_CLASSES}>
            0
          </button>
          <button type="button" onClick={backspace} aria-label="Delete last digit" className={KEY_CLASSES}>
            <Delete className="size-5" aria-hidden />
          </button>
        </div>

        {showHint && (
          <p className="mt-4 text-center text-xs text-gold-400/70">Default PIN: 1234 — change it in Settings</p>
        )}

        <Button
          variant="ghost"
          onClick={onBack}
          className="mt-5 w-full text-cream-100/55 hover:bg-white/5 hover:text-cream-100 focus-visible:ring-brand-500/40"
        >
          ← Back to site
        </Button>
      </motion.div>
    </div>
  );
}
