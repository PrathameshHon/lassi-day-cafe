"use client";

import { motion } from "framer-motion";
import { Heart, Users, Clock } from "lucide-react";

const GALLERY = [
  { src: "/images/exterior.jpg", caption: "Our corner on Station Road", span: "col-span-2 row-span-2" },
  { src: "/images/interior.jpg", caption: "Warm lights, warm people", span: "" },
  { src: "/images/lassi-royal.jpg", caption: "The Royal treatment", span: "" },
  { src: "/images/pizza.jpg", caption: "Fresh from the oven", span: "col-span-2" },
  { src: "/images/table.jpg", caption: "Your table, always ready", span: "" },
  { src: "/images/momos.jpg", caption: "Steaming hot momos", span: "" },
  { src: "/images/burger.jpg", caption: "The perfect bite", span: "" },
  { src: "/images/brownie.jpg", caption: "End on a sweet note", span: "" },
];

const VALUES = [
  { Icon: Heart, title: "Made Fresh", desc: "Every lassi churned to order, every burger flame-kissed." },
  { Icon: Users, title: "Local Favourite", desc: "Kopargaon's adda for friends, families & college gangs." },
  { Icon: Clock, title: "Always Welcoming", desc: "Open 10 to 11, every single day. Walk in anytime." },
];

export function Vibe() {
  return (
    <section id="vibe" className="relative scroll-mt-16 py-24 sm:py-32 overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(214,41,107,0.1),transparent_55%)]"
      />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-end gap-8 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7 }}
          >
            <span className="inline-block rounded-full border border-brand-400/40 bg-plum-900/60 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.35em] text-brand-300">
              The Kopargaon Vibe
            </span>
            <h2 className="mt-5 font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold text-cream-100 leading-[1.05]">
              This is <span className="text-gold-400 text-glow-gold">our</span>
              <br />
              Kopargaon.
            </h2>
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="max-w-md text-sm sm:text-base leading-relaxed text-cream-200/70 lg:justify-self-end"
          >
            From the people, to the vibes, to the flavours — this is our corner of Kopargaon where good food, great
            friends and happy moments come together. One lassi at a time.
          </motion.p>
        </div>

        {/* Gallery */}
        <div className="mt-14 grid auto-rows-[150px] sm:auto-rows-[190px] grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {GALLERY.map((g, i) => (
            <motion.figure
              key={g.src + i}
              initial={{ opacity: 0, scale: 0.92 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.55, delay: Math.min(i * 0.06, 0.4) }}
              className={`group relative overflow-hidden rounded-2xl border border-white/10 ${g.span}`}
            >
              { }
              <img
                src={g.src}
                alt={g.caption}
                loading="lazy"
                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div
                aria-hidden
                className="absolute inset-0 bg-gradient-to-t from-plum-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              />
              <figcaption className="absolute bottom-3 left-3 right-3 translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                <span className="font-script text-xl text-gold-300">{g.caption}</span>
              </figcaption>
            </motion.figure>
          ))}
        </div>

        {/* Values */}
        <div className="mt-14 grid gap-5 sm:grid-cols-3">
          {VALUES.map(({ Icon, title, desc }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: i * 0.12 }}
              className="rounded-2xl border border-white/10 bg-plum-900/50 p-6 text-center hover:border-gold-400/30 transition-colors"
            >
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-brand-600/25 text-brand-300">
                <Icon className="w-5 h-5" />
              </span>
              <h3 className="mt-4 font-display text-xl font-bold text-cream-100">{title}</h3>
              <p className="mt-2 text-sm text-cream-200/65 leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
