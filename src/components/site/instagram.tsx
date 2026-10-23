"use client";

import { motion } from "framer-motion";
import { Instagram } from "lucide-react";
import { SITE } from "@/lib/site-data";

const WALL = [
  "/images/lassi-sweet.jpg",
  "/images/pizza.jpg",
  "/images/mojito.jpg",
  "/images/burger.jpg",
  "/images/brownie.jpg",
  "/images/lassi-mango.jpg",
  "/images/coldcoffee.jpg",
  "/images/momos.jpg",
];

export function InstagramWall() {
  return (
    <section id="instagram" className="relative scroll-mt-16 py-24 sm:py-28 overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(214,41,107,0.12),transparent_55%)]"
      />
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 26 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="text-center"
        >
          <p className="font-script text-3xl sm:text-4xl text-brand-300">Still scrolling?</p>
          <h2 className="mt-2 font-display text-4xl sm:text-5xl font-extrabold text-cream-100">
            We post <span className="text-gold-400 text-glow-gold">food</span> too.
          </h2>
          <a
            href={SITE.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center gap-2 rounded-full border border-brand-400/40 bg-plum-900/60 px-5 py-2 text-sm font-semibold text-cream-100 hover:border-brand-400 hover:text-brand-300 transition-colors"
          >
            <Instagram className="w-4 h-4 text-brand-400" />
            @{SITE.instagramHandle}
          </a>
        </motion.div>

        <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          {WALL.map((src, i) => (
            <motion.a
              key={src + i}
              href={SITE.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`See our post on Instagram — ${src.split("/").pop()?.replace(".jpg", "")}`}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.45, delay: Math.min(i * 0.05, 0.3) }}
              className="group relative aspect-square overflow-hidden rounded-xl border border-white/10"
            >
              { }
              <img
                src={src}
                alt="Lassi Day Cafe Kopargaon Instagram post"
                loading="lazy"
                className="h-full w-full object-cover group-hover:scale-108 group-hover:rotate-1 transition-transform duration-500"
              />
              <div
                aria-hidden
                className="absolute inset-0 flex items-center justify-center bg-brand-600/0 group-hover:bg-brand-600/45 transition-colors duration-300"
              >
                <Instagram className="w-7 h-7 text-cream-100 opacity-0 scale-50 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300" />
              </div>
            </motion.a>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-10 text-center"
        >
          <a
            href={SITE.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 rounded-full bg-gradient-to-r from-brand-600 via-brand-500 to-gold-500 p-[2px] hover:scale-[1.03] transition-transform"
          >
            <span className="inline-flex items-center gap-2.5 rounded-full bg-plum-950 px-7 py-3 font-display text-sm font-bold tracking-[0.15em] text-cream-100">
              <Instagram className="w-4 h-4 text-brand-400" />
              FOLLOW US
            </span>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
