"use client";

import { motion } from "framer-motion";
import { CupSoda } from "lucide-react";
import { SPECIALS } from "@/lib/menu-data";

const MARQUEE_ITEMS = ["Lassi", "Pizza", "Burgers", "Momos", "Sandwiches", "Desserts", "Shakes", "Fries"];

export function Specials() {
  return (
    <section id="specials" className="relative scroll-mt-16 py-20 sm:py-24 overflow-hidden">
      {/* Marquee strip */}
      <div aria-hidden className="relative border-y border-white/10 bg-plum-900/40 py-4 overflow-hidden">
        <div className="flex w-max animate-marquee gap-8">
          {[0, 1].map((copy) => (
            <div key={copy} className="flex items-center gap-8" aria-hidden={copy === 1}>
              {MARQUEE_ITEMS.map((word) => (
                <span key={`${copy}-${word}`} className="flex items-center gap-8">
                  <span className="font-display text-2xl sm:text-3xl font-bold uppercase tracking-wider text-cream-100/85">
                    {word}
                  </span>
                  <CupSoda className="w-5 h-5 text-brand-500" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="text-center"
        >
          <span className="inline-block rounded-full border border-coral-500/50 bg-plum-900/60 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.35em] text-coral-500">
            Running Now
          </span>
          <h2 className="mt-5 font-display text-4xl sm:text-5xl font-extrabold text-cream-100">
            Today&apos;s <span className="text-brand-400 text-glow-brand">Specials</span>
          </h2>
        </motion.div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {SPECIALS.map((offer, i) => (
            <motion.article
              key={offer.title}
              initial={{ opacity: 0, y: 36 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: i * 0.12 }}
              whileHover={{ y: -6 }}
              className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${offer.accent} p-[1px]`}
            >
              <div className="relative h-full rounded-3xl bg-plum-900/85 p-6 sm:p-7 backdrop-blur">
                <div
                  aria-hidden
                  className={`absolute -top-10 -right-10 h-32 w-32 rounded-full bg-gradient-to-br ${offer.accent} opacity-30 blur-2xl`}
                />
                <span aria-hidden className="text-4xl">{offer.emoji}</span>
                <h3 className="mt-4 font-display text-2xl font-bold text-cream-100">{offer.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-cream-200/70">{offer.desc}</p>
                <span className="mt-5 inline-block rounded-full border border-gold-400/50 bg-plum-950/60 px-4 py-1.5 font-display text-sm font-bold tracking-wider text-gold-400">
                  {offer.offer}
                </span>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
