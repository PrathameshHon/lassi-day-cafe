/**
 * Lassi Day Cafe — Kopargaon
 * Seating / Extended Stay Charge engine.
 *
 * Rule (configurable by the owner in Staff → Settings):
 *   - First `freeMinutes` of a stay are FREE
 *   - Every *completed* `intervalMinutes` block after that adds `intervalCharge`
 *
 * Example with defaults (45 min free, 60 min interval, ₹200):
 *   0:45:00        → ₹0
 *   1:45:00        → ₹200   (1 completed interval)
 *   2:45:00        → ₹400
 *   1:44:59        → ₹0     (no *completed* interval yet)
 */

export interface ChargeConfig {
  freeMinutes: number;
  intervalMinutes: number;
  intervalCharge: number;
}

export interface ChargeResult {
  /** Amount in ₹ */
  charge: number;
  /** How many completed charge intervals have elapsed */
  completedIntervals: number;
  /** Absolute stay-duration (ms) at which the NEXT charge lands */
  nextThresholdMs: number;
  /** ms remaining until the next charge lands */
  msToNextCharge: number;
  /** True while the guest is still inside the free window */
  inFreeWindow: boolean;
}

export const DEFAULT_CHARGE_CONFIG: ChargeConfig = {
  freeMinutes: 45,
  intervalMinutes: 60,
  intervalCharge: 200,
};

export function computeCharge(durationMs: number, config: ChargeConfig = DEFAULT_CHARGE_CONFIG): ChargeResult {
  const freeMs = Math.max(0, config.freeMinutes) * 60_000;
  // Tiny positive floor purely to avoid divide-by-zero (staff may set sub-minute intervals).
  const intervalMs = Math.max(0.01, config.intervalMinutes) * 60_000;
  const firstChargeAtMs = freeMs + intervalMs;

  if (durationMs < firstChargeAtMs) {
    return {
      charge: 0,
      completedIntervals: 0,
      nextThresholdMs: firstChargeAtMs,
      msToNextCharge: firstChargeAtMs - durationMs,
      inFreeWindow: true,
    };
  }

  const extraMs = durationMs - freeMs;
  const completedIntervals = Math.floor(extraMs / intervalMs);
  const nextThresholdMs = freeMs + (completedIntervals + 1) * intervalMs;

  return {
    charge: completedIntervals * config.intervalCharge,
    completedIntervals,
    nextThresholdMs,
    msToNextCharge: nextThresholdMs - durationMs,
    inFreeWindow: false,
  };
}

export function formatDuration(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

export function formatMinutes(ms: number): string {
  const totalMinutes = Math.floor(ms / 60_000);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h <= 0) return `${m} min`;
  if (m === 0) return `${h} hr`;
  return `${h} hr ${m} min`;
}

export function formatTimeOfDay(epochMs: number): string {
  return new Date(epochMs).toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export const formatINR = (n: number) => `₹${n.toLocaleString("en-IN")}`;

/**
 * Visual tier for a table card.
 *  free          → table not in use
 *  safe          → occupied, comfortably inside free window / far from next charge
 *  approaching   → within `warnMinutes` of the next charge boundary
 *  charge-active → charge > 0 is currently applied
 */
export type TableTier = "free" | "safe" | "approaching" | "charge-active";

export function tableTier(
  status: "free" | "occupied",
  durationMs: number,
  config: ChargeConfig = DEFAULT_CHARGE_CONFIG,
  warnMinutes = 15,
): TableTier {
  if (status !== "occupied") return "free";
  const result = computeCharge(durationMs, config);
  if (result.charge > 0) return "charge-active";
  if (result.msToNextCharge <= warnMinutes * 60_000) return "approaching";
  return "safe";
}
