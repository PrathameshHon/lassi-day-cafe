"use client";

import { motion } from "framer-motion";
import { ChevronDown, CupSoda, Pizza, Sandwich, IceCreamCone, Cookie, Milk, Sparkles } from "lucide-react";
import { BrandLogo } from "./brand-logo";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.14, delayChildren: 0.15 } },
};

const item = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: { duration: 0.75, ease: "easeOut" } },
};

/** Faint floating food doodles — a nod to the brand's illustrated style. */
const DOODLES = [
  { Icon: CupSoda, className: "top-[16%] left-[8%] w-12 h-12", delay: "0s" },
  { Icon: Pizza, className: "top-[22%] right-[9%] w-14 h-14", delay: "1.2s" },
  { Icon: IceCreamCone, className: "bottom-[24%] left-[12%] w-10 h-10", delay: "2s" },
  { Icon: Sandwich, className: "bottom-[30%] right-[13%] w-12 h-12", delay: "0.6s" },
  { Icon: Cookie, className: "top-[48%] left-[4%] w-9 h-9", delay: "1.6s" },
  { Icon: Milk, className: "top-[52%] right-[5%] w-10 h-10", delay: "2.4s" },
  { Icon: Sparkles, className: "bottom-[14%] right-[26%] w-8 h-8", delay: "1s" },
  { Icon: Sparkles, className: "bottom-[16%] left-[26%] w-8 h-8", delay: "2.8s" },
];

export function Hero() {
  const enterCafe = () => {
    document.getElementById("walk-in")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="top" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Ambient brand glows */}
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(214,41,107,0.16),transparent_55%)]" />
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(142,23,70,0.28),transparent_60%)]" />
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(18,6,16,0.85)_100%)]" />

      {/* Floating doodles */}
      <div aria-hidden className="absolute inset-0 pointer-events-none text-gold-400">
        {DOODLES.map(({ Icon, className, delay }, i) => (
          <Icon
            key={i}
            className={`absolute opacity-[0.08] animate-float-slow ${className}`}
            style={{ animationDelay: delay }}
            strokeWidth={1.5}
          />
        ))}
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 flex flex-col items-center text-center px-6 py-28"
      >
        <motion.div variants={item} className="relative">
          <div
            aria-hidden
            className="absolute -inset-6 rounded-full bg-brand-500/25 blur-3xl animate-glow-pulse"
          />
          <BrandLogo className="relative w-36 h-36 sm:w-44 sm:h-44 ring-2 ring-gold-400/50 shadow-[0_0_60px_rgba(214,41,107,0.45)] animate-float" />
        </motion.div>

        <motion.h1
          variants={item}
          className="mt-8 font-display font-extrabold text-4xl sm:text-6xl tracking-tight text-cream-100 text-glow-cream"
        >
          LASSI DAY <span className="text-gold-400 text-glow-gold">CAFÉ</span>
        </motion.h1>

        <motion.p
          variants={item}
          className="mt-3 text-xs sm:text-sm tracking-[0.55em] text-gold-400 font-semibold pl-2"
        >
          KOPARGAON
        </motion.p>

        <motion.p variants={item} className="mt-5 font-script text-3xl sm:text-4xl text-brand-300 text-glow-brand">
          More Than Just Lassi!
        </motion.p>

        <motion.div variants={item} aria-hidden className="mt-8 flex items-center gap-3">
          <span className="h-px w-14 bg-gradient-to-r from-transparent to-gold-400/70" />
          <CupSoda className="w-4 h-4 text-gold-400" />
          <span className="h-px w-14 bg-gradient-to-l from-transparent to-gold-400/70" />
        </motion.div>

        <motion.p variants={item} className="mt-8 text-lg sm:text-xl font-light text-cream-200/90">
          Your table is waiting.
        </motion.p>

        <motion.button
          variants={item}
          onClick={enterCafe}
          className="group mt-8 inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-brand-600 to-brand-500 px-9 py-4 font-display text-base sm:text-lg font-bold tracking-[0.2em] text-cream-100 shadow-[0_0_35px_rgba(214,41,107,0.5)] hover:shadow-[0_0_55px_rgba(214,41,107,0.75)] hover:scale-[1.04] active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
        >
          ENTER CAFÉ
          <ChevronDown className="w-5 h-5 group-hover:translate-y-0.5 transition-transform" />
        </motion.button>

        <motion.p
          variants={item}
          className="mt-10 text-[11px] uppercase tracking-[0.35em] text-cream-200/50"
        >
          Scroll to walk in
        </motion.p>
      </motion.div>
    </section>
  );
}
