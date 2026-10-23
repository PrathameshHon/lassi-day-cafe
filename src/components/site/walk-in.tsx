"use client";

import { useRef } from "react";
import {
  motion,
  useMotionTemplate,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { ArrowRight, ChevronDown } from "lucide-react";
import { BrandLogo } from "./brand-logo";

function DoorPanel({ side, x }: { side: "left" | "right"; x: MotionValue<string> }) {
  return (
    <motion.div
      style={{ x }}
      className={`absolute top-0 h-full w-1/2 z-20 bg-gradient-to-b from-plum-800 via-plum-900 to-plum-950 ${
        side === "left" ? "left-0" : "right-0"
      }`}
    >
      {/* Wood grain hint */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-30 bg-[repeating-linear-gradient(90deg,transparent_0px,transparent_34px,rgba(255,201,60,0.05)_35px,transparent_36px)]"
      />
      {/* Gold leading edge + handle */}
      <div
        aria-hidden
        className={`absolute top-0 h-full w-[6px] bg-gradient-to-b from-gold-500/90 via-gold-400/70 to-gold-500/90 ${
          side === "left" ? "right-0" : "left-0"
        }`}
      />
      <div
        aria-hidden
        className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-gold-400 shadow-[0_0_16px_rgba(255,201,60,0.8)] ${
          side === "left" ? "right-8" : "left-8"
        }`}
      />
      {side === "left" && (
        <div className="absolute top-[12%] right-10 rounded-md border border-gold-400/70 bg-plum-950/80 px-3 py-1 text-[10px] font-bold tracking-[0.3em] text-gold-400 animate-flicker neon-border">
          OPEN
        </div>
      )}
    </motion.div>
  );
}

export function WalkIn() {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  // ── Phase 1: outside the café (0 → 0.35)
  const extScale = useTransform(scrollYProgress, [0, 0.35], [1.06, 1.5]);
  const extBrightness = useTransform(scrollYProgress, [0, 0.28, 0.4], [0.55, 0.95, 1]);
  const extFilter = useMotionTemplate`brightness(${extBrightness})`;
  const extOpacity = useTransform(scrollYProgress, [0, 0.32, 0.46], [1, 1, 0]);

  // Hint text during approach
  const approachOpacity = useTransform(scrollYProgress, [0.02, 0.06, 0.2, 0.27], [0, 1, 1, 0]);
  const approachY = useTransform(scrollYProgress, [0.02, 0.1], [24, 0]);

  // ── Phase 2: the doors appear ahead of you and open (0.24 → 0.55)
  const doorX = useTransform(scrollYProgress, [0.3, 0.52], ["0%", "-103%"]);
  const doorXRight = useTransform(scrollYProgress, [0.3, 0.52], ["0%", "103%"]);
  const doorsOpacity = useTransform(scrollYProgress, [0, 0.16, 0.26, 0.5, 0.56], [0, 0, 1, 1, 0]);

  // ── Phase 3: inside — interior reveal (0.34 → 0.62)
  const intScale = useTransform(scrollYProgress, [0.34, 0.62], [1.32, 1.03]);
  const intOpacity = useTransform(scrollYProgress, [0.34, 0.47], [0, 1]);
  const intBrightness = useTransform(scrollYProgress, [0.34, 0.52, 0.62], [0.5, 0.95, 0.82]);
  const intFilter = useMotionTemplate`brightness(${intBrightness})`;

  const neonOpacity = useTransform(scrollYProgress, [0.44, 0.52, 0.6, 0.66], [0, 1, 1, 0]);
  const neonY = useTransform(scrollYProgress, [0.44, 0.55], [30, 0]);

  // ── Phase 4: walk to the table (0.58 → 0.85)
  const tableScale = useTransform(scrollYProgress, [0.58, 0.85], [1.2, 1]);
  const tableOpacity = useTransform(scrollYProgress, [0.58, 0.71], [0, 1]);

  const waitOpacity = useTransform(scrollYProgress, [0.62, 0.68, 0.8, 0.86], [0, 1, 1, 0]);
  const waitY = useTransform(scrollYProgress, [0.62, 0.72], [40, 0]);

  // ── Phase 5: the menu lands on the table (0.82 → 1)
  const menuOpacity = useTransform(scrollYProgress, [0.82, 0.9], [0, 1]);
  const menuY = useTransform(scrollYProgress, [0.82, 0.92], [70, 0]);
  const menuScale = useTransform(scrollYProgress, [0.82, 0.92], [0.85, 1]);
  const ctaOpacity = useTransform(scrollYProgress, [0.88, 0.94], [0, 1]);

  const hintOpacity = useTransform(scrollYProgress, [0, 0.04, 0.09], [1, 1, 0]);

  if (reducedMotion) {
    return (
      <section aria-label="Inside Lassi Day Cafe Kopargaon" className="relative">
        {[
          { src: "/images/exterior.jpg", caption: "Lassi Day Cafe — Station Road, Kopargaon" },
          { src: "/images/interior.jpg", caption: "Good food, good vibes only" },
          { src: "/images/table.jpg", caption: "Your table is waiting" },
        ].map((s) => (
          <div key={s.src} className="relative h-screen">
            { }
            <img src={s.src} alt={s.caption} className="absolute inset-0 h-full w-full object-cover" />
            <div aria-hidden className="absolute inset-0 bg-plum-950/40" />
            <p className="absolute bottom-16 inset-x-0 text-center font-script text-4xl text-gold-300">{s.caption}</p>
          </div>
        ))}
      </section>
    );
  }

  return (
    <section id="walk-in" ref={ref} aria-label="Walk into the cafe" className="relative h-[420vh]">
      <div className="sticky top-0 h-screen overflow-hidden bg-plum-950">
        {/* Layer 1 — exterior */}
        <motion.div style={{ scale: extScale, opacity: extOpacity, filter: extFilter }} className="absolute inset-0 will-change-transform">
          { }
          <img
            src="/images/exterior.jpg"
            alt="Lassi Day Cafe Kopargaon storefront glowing at night"
            className="h-full w-full object-cover"
          />
          <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-plum-950/70 via-transparent to-plum-950/60" />
        </motion.div>

        {/* Layer 2 — interior (revealed behind the doors) */}
        <motion.div style={{ scale: intScale, opacity: intOpacity, filter: intFilter }} className="absolute inset-0 z-10 will-change-transform">
          { }
          <img
            src="/images/interior.jpg"
            alt="Warm cafe interior with pendant lights and wooden tables"
            className="h-full w-full object-cover"
          />
          <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-plum-950/55 via-transparent to-plum-950/70" />
        </motion.div>

        {/* Neon line — interior moment */}
        <motion.div
          style={{ opacity: neonOpacity, y: neonY }}
          className="absolute inset-x-0 top-1/2 -translate-y-1/2 z-30 flex justify-center px-6 pointer-events-none"
        >
          <p className="text-center font-script text-4xl sm:text-6xl md:text-7xl text-gold-300 text-glow-gold">
            Good Food. Good Vibes. Only.
          </p>
        </motion.div>

        {/* The doors */}
        <motion.div style={{ opacity: doorsOpacity }} className="absolute inset-0 z-20 pointer-events-none">
          <DoorPanel side="left" x={doorX} />
          <DoorPanel side="right" x={doorXRight} />
        </motion.div>

        {/* Layer 3 — the table */}
        <motion.div style={{ scale: tableScale, opacity: tableOpacity }} className="absolute inset-0 z-10 will-change-transform">
          { }
          <img
            src="/images/table.jpg"
            alt="A cafe table with a creamy lassi and the menu card"
            className="h-full w-full object-cover"
          />
          <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-plum-950/60 via-plum-950/25 to-plum-950/75" />
        </motion.div>

        {/* Script moment — your table is waiting */}
        <motion.div
          style={{ opacity: waitOpacity, y: waitY }}
          className="absolute inset-x-0 top-[18%] z-30 flex flex-col items-center px-6 pointer-events-none"
        >
          <p className="font-script text-4xl sm:text-6xl text-cream-100 text-glow-cream">Your table is waiting...</p>
          <span aria-hidden className="mt-2 h-10 w-px bg-gradient-to-b from-gold-400/80 to-transparent" />
        </motion.div>

        {/* Final moment — the menu */}
        <motion.div
          style={{ opacity: menuOpacity }}
          className="absolute inset-x-0 top-1/2 -translate-y-1/2 z-30 flex justify-center px-6 pointer-events-none"
        >
          <div className="flex flex-col items-center gap-6 sm:gap-8">
            <motion.div style={{ y: menuY, scale: menuScale }} className="relative">
              <div
                aria-hidden
                className="absolute -inset-4 rounded-3xl bg-brand-500/20 blur-2xl"
              />
              <div className="relative w-44 h-56 sm:w-56 sm:h-72 -rotate-6 rounded-2xl bg-gradient-to-br from-plum-800 to-plum-950 border-2 border-gold-500/60 shadow-[0_25px_60px_rgba(0,0,0,0.6)] flex flex-col items-center justify-center gap-4 p-6">
                <BrandLogo className="w-16 h-16 sm:w-20 sm:h-20 ring-1 ring-gold-400/50" />
                <span className="font-display text-xl sm:text-2xl tracking-[0.35em] pl-2 text-gold-400">MENU</span>
                <span className="font-script text-base sm:text-lg text-cream-200/80">fresh lassi · pizza · more</span>
              </div>
            </motion.div>
            <div className="text-center">
              <h3 className="font-display text-2xl sm:text-4xl md:text-5xl font-bold text-cream-100 text-glow-cream">
                What are you having today?
              </h3>
              <p className="mt-2 font-script text-2xl sm:text-3xl text-brand-300">
                Fresh lassi, hot pizzas & much more
              </p>
            </div>
            <motion.a
              href="#menu"
              style={{ opacity: ctaOpacity }}
              className="pointer-events-auto inline-flex items-center gap-2 rounded-full bg-gold-400 px-8 py-3.5 font-display text-sm sm:text-base font-bold tracking-[0.2em] text-plum-950 shadow-[0_0_30px_rgba(255,201,60,0.4)] hover:bg-gold-300 hover:scale-[1.03] transition-all"
            >
              EXPLORE MENU
              <ArrowRight className="w-4 h-4" />
            </motion.a>
          </div>
        </motion.div>

        {/* Approach moment — before the doors */}
        <motion.div
          style={{ opacity: approachOpacity, y: approachY }}
          className="absolute inset-x-0 bottom-[16%] z-30 flex flex-col items-center gap-3 px-6 pointer-events-none"
        >
          <p className="font-script text-3xl sm:text-5xl text-gold-300 text-glow-gold">The doors are open...</p>
          <p className="text-[11px] uppercase tracking-[0.35em] text-cream-200/70">Lassi Day · Station Road · Kopargaon</p>
        </motion.div>

        {/* Scroll hint */}
        <motion.div
          style={{ opacity: hintOpacity }}
          className="absolute bottom-8 inset-x-0 z-30 flex flex-col items-center gap-1 pointer-events-none"
        >
          <span className="text-[10px] uppercase tracking-[0.4em] text-cream-200/60">Scroll to walk in</span>
          <ChevronDown className="w-5 h-5 text-gold-400 animate-bounce" />
        </motion.div>

        {/* Cinematic vignette */}
        <div aria-hidden className="absolute inset-0 z-40 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(18,6,16,0.55)_100%)]" />
      </div>
    </section>
  );
}
