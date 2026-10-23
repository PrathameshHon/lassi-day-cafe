"use client";

import { motion } from "framer-motion";
import { Clock, MapPin, Navigation } from "lucide-react";
import { SITE } from "@/lib/site-data";

export function VisitUs() {
  return (
    <section id="visit" className="relative scroll-mt-16 py-24 sm:py-32 overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,201,60,0.07),transparent_55%)]"
      />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <span className="inline-block rounded-full border border-gold-400/40 bg-plum-900/60 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.35em] text-gold-400">
              Find Your Table
            </span>
            <h2 className="mt-5 font-display text-4xl sm:text-5xl font-extrabold text-cream-100 leading-tight">
              Lassi Day Cafe —<br />
              <span className="text-gold-400 text-glow-gold">Kopargaon</span>
            </h2>

            <ul className="mt-8 flex flex-col gap-5">
              <li className="flex items-start gap-4">
                <span className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-600/25 text-brand-300">
                  <MapPin className="w-4 h-4" />
                </span>
                <div>
                  <p className="font-semibold text-cream-100">Address</p>
                  {SITE.addressLines.map((line) => (
                    <p key={line} className="text-sm text-cream-200/70">
                      {line}
                    </p>
                  ))}
                </div>
              </li>
              <li className="flex items-start gap-4">
                <span className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-600/25 text-brand-300">
                  <Clock className="w-4 h-4" />
                </span>
                <div>
                  <p className="font-semibold text-cream-100">Opening Hours</p>
                  <p className="text-sm text-cream-200/70">{SITE.hours} · {SITE.hoursNote}</p>
                </div>
              </li>
            </ul>

            <div className="mt-9 flex flex-wrap items-center gap-4">
              <a
                href={SITE.getDirectionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 rounded-full bg-gold-400 px-8 py-4 font-display text-sm font-bold tracking-[0.2em] text-plum-950 shadow-[0_0_30px_rgba(255,201,60,0.35)] hover:bg-gold-300 hover:scale-[1.03] transition-all"
              >
                GET DIRECTIONS
                <Navigation className="w-4 h-4" />
              </a>
              <p className="font-script text-2xl text-brand-300">walk-ins welcome!</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
            className="relative"
          >
            <div aria-hidden className="absolute -inset-3 rounded-[2rem] bg-brand-500/15 blur-2xl" />
            <div className="relative overflow-hidden rounded-[2rem] border border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.5)]">
              <iframe
                title="Map — Lassi Day Cafe Kopargaon, Station Road"
                src={SITE.mapsEmbed}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-80 w-full sm:h-96 lg:h-[480px] grayscale-[35%] contrast-[1.05]"
                allowFullScreen
              />
              <div aria-hidden className="pointer-events-none absolute inset-0 rounded-[2rem] ring-1 ring-inset ring-white/10" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
