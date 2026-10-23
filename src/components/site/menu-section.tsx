"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MENU, type MenuItem } from "@/lib/menu-data";
import { formatINR } from "@/lib/charge";

const TAG_STYLES: Record<NonNullable<MenuItem["tag"]>, string> = {
  Signature: "border-gold-400/60 text-gold-300",
  Bestseller: "border-coral-500/60 text-coral-500",
  New: "border-emerald-400/60 text-emerald-300",
  Value: "border-cream-200/40 text-cream-200/80",
};

function MenuCard({ item, index }: { item: MenuItem; index: number }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.35), ease: "easeOut" }}
      className="group relative overflow-hidden rounded-2xl bg-plum-900/70 border border-white/10 hover:border-gold-400/40 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(0,0,0,0.45)] transition-all duration-300"
    >
      <div className="relative aspect-square overflow-hidden">
        { }
        <img
          src={item.img}
          alt={item.name}
          loading="lazy"
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-plum-950/85 via-transparent to-transparent" />
        {item.tag && (
          <span
            className={`absolute top-3 left-3 rounded-full border bg-plum-950/70 backdrop-blur px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.15em] ${TAG_STYLES[item.tag]}`}
          >
            {item.tag}
          </span>
        )}
        <span className="absolute bottom-3 right-3 rounded-full bg-gold-400 px-3 py-1 font-display text-sm font-bold text-plum-950 shadow-[0_4px_14px_rgba(255,201,60,0.35)]">
          {formatINR(item.price)}
        </span>
      </div>
      <div className="p-4">
        <h3 className="font-display text-lg font-bold text-cream-100 leading-tight">{item.name}</h3>
        {item.desc && <p className="mt-1 text-xs leading-relaxed text-cream-200/60 line-clamp-2">{item.desc}</p>}
      </div>
    </motion.article>
  );
}

export function MenuSection() {
  const [active, setActive] = useState(MENU[0].id);
  const category = MENU.find((c) => c.id === active) ?? MENU[0];

  return (
    <section id="menu" className="relative scroll-mt-16 py-24 sm:py-32 overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(214,41,107,0.1),transparent_50%),radial-gradient(ellipse_at_bottom_right,rgba(255,201,60,0.06),transparent_50%)]"
      />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="text-center"
        >
          <span className="inline-block rounded-full border border-gold-400/40 bg-plum-900/60 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.35em] text-gold-400">
            Our Menu
          </span>
          <h2 className="mt-5 font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold text-cream-100">
            What are you having <span className="text-gold-400 text-glow-gold">today?</span>
          </h2>
          <p className="mt-4 font-script text-2xl sm:text-3xl text-brand-300">
            Fresh lassi, hot pizzas &amp; much more — just like at the counter
          </p>
        </motion.div>

        {/* Category tabs */}
        <div
          role="tablist"
          aria-label="Menu categories"
          className="mt-12 flex gap-2.5 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden justify-start sm:justify-center sm:flex-wrap"
        >
          {MENU.map((cat) => {
            const isActive = cat.id === active;
            return (
              <button
                key={cat.id}
                role="tab"
                aria-selected={isActive}
                onClick={() => setActive(cat.id)}
                className={`shrink-0 rounded-full border px-5 py-2.5 text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 ${
                  isActive
                    ? "border-gold-400 bg-gold-400 text-plum-950 shadow-[0_0_22px_rgba(255,201,60,0.35)]"
                    : "border-white/15 bg-plum-900/50 text-cream-200/80 hover:border-brand-400/50 hover:text-cream-100"
                }`}
              >
                <span aria-hidden className="mr-1.5">{cat.emoji}</span>
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Items */}
        <AnimatePresence mode="wait">
          <motion.div key={category.id} className="mt-10 grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 xl:grid-cols-4">
            {category.items.map((item, i) => (
              <MenuCard key={item.name} item={item} index={i} />
            ))}
          </motion.div>
        </AnimatePresence>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-12 text-center text-sm text-cream-200/50"
        >
          Prices in ₹ · Taxes included · Menu may vary — ask at the counter for today&apos;s specials
        </motion.p>
      </div>
    </section>
  );
}
