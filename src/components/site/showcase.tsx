"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { FEATURED } from "@/lib/menu-data";
import { formatINR } from "@/lib/charge";

export function Showcase() {
  return (
    <section aria-label="Signature food showcase" className="relative py-24 sm:py-32 overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(142,23,70,0.14),transparent_60%)]"
      />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="text-center"
        >
          <p className="font-script text-3xl text-brand-300">straight from our kitchen</p>
          <h2 className="mt-2 font-display text-4xl sm:text-5xl font-extrabold text-cream-100">
            The <span className="text-gold-400 text-glow-gold">Signatures</span>
          </h2>
        </motion.div>

        <div className="mt-16 flex flex-col gap-20 sm:gap-28">
          {FEATURED.map((item, i) => {
            const flipped = i % 2 === 1;
            return (
              <div
                key={item.id}
                className="grid items-center gap-8 md:grid-cols-2 md:gap-12 lg:gap-16"
              >
                <motion.div
                  initial={{ opacity: 0, x: flipped ? 70 : -70 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className={`relative ${flipped ? "md:order-2" : ""}`}
                >
                  <div
                    aria-hidden
                    className={`absolute -inset-4 rounded-[2rem] bg-gradient-to-tr ${
                      i === 0
                        ? "from-gold-500/25 to-brand-500/25"
                        : i === 1
                          ? "from-brand-500/25 to-coral-500/20"
                          : "from-coral-500/20 to-gold-500/25"
                    } blur-2xl`}
                  />
                  <div className="relative overflow-hidden rounded-[2rem] border border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.5)]">
                    { }
                    <img
                      src={item.img}
                      alt={item.name}
                      loading="lazy"
                      className="aspect-[4/3] w-full object-cover"
                    />
                    <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-plum-950/50 to-transparent" />
                  </div>
                  <motion.span
                    initial={{ scale: 0, rotate: -12 }}
                    whileInView={{ scale: 1, rotate: -4 }}
                    viewport={{ once: true }}
                    transition={{ type: "spring", stiffness: 200, damping: 14, delay: 0.35 }}
                    className={`absolute -bottom-5 ${flipped ? "right-6" : "left-6"} rounded-full bg-gold-400 px-6 py-2.5 font-display text-xl font-bold text-plum-950 shadow-[0_10px_30px_rgba(255,201,60,0.4)]`}
                  >
                    {formatINR(item.price)}
                  </motion.span>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.7, delay: 0.15 }}
                  className={`${flipped ? "md:order-1 md:text-right" : ""}`}
                >
                  <p className="font-script text-2xl sm:text-3xl text-brand-300">{item.kicker}</p>
                  <h3 className="mt-2 font-display text-4xl sm:text-5xl font-extrabold text-cream-100 text-glow-cream">
                    {item.name}
                  </h3>
                  <p className={`mt-4 max-w-md text-sm sm:text-base leading-relaxed text-cream-200/70 ${flipped ? "md:ml-auto" : ""}`}>
                    {item.desc}
                  </p>
                  <a
                    href="#menu"
                    className={`group mt-6 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-gold-400 hover:text-gold-300 transition-colors`}
                  >
                    See it on the menu
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </a>
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
