"use client";

import { useState } from "react";
import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { Instagram, KeyRound, Menu as MenuIcon } from "lucide-react";
import { NAV_LINKS, SITE } from "@/lib/site-data";
import { useStaffStore } from "@/lib/store/staff";
import { BrandLogo } from "./brand-logo";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { scrollY } = useScroll();
  const setStaffOpen = useStaffStore((s) => s.setOpen);

  useMotionValueEvent(scrollY, "change", (v) => setScrolled(v > 60));

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-plum-950/85 backdrop-blur-md border-b border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.35)]"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <nav
        aria-label="Main navigation"
        className="mx-auto max-w-7xl flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8"
      >
        <a href="#top" className="flex items-center gap-3 group" aria-label="Lassi Day Cafe Kopargaon — home">
          <BrandLogo className="w-9 h-9 ring-1 ring-gold-400/40 group-hover:ring-gold-400/80 transition" />
          <span className="flex flex-col leading-none">
            <span className="font-display font-bold text-cream-100 text-sm tracking-wide">LASSI DAY</span>
            <span className="text-[10px] tracking-[0.35em] text-gold-400 mt-0.5">KOPARGAON</span>
          </span>
        </a>

        <ul className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="text-xs font-medium uppercase tracking-[0.18em] text-cream-200/75 hover:text-gold-400 transition-colors"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <a
            href={SITE.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Instagram @${SITE.instagramHandle}`}
            className="hidden sm:inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-cream-200/80 hover:text-brand-400 hover:border-brand-400/60 transition"
          >
            <Instagram className="w-4 h-4" />
          </a>
          <button
            type="button"
            onClick={() => setStaffOpen(true)}
            aria-label="Staff login"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-white/15 px-4 h-9 text-xs font-bold uppercase tracking-[0.15em] text-cream-200/80 hover:border-gold-400/60 hover:text-gold-400 transition-colors"
          >
            <KeyRound className="w-3.5 h-3.5" aria-hidden />
            Staff Login
          </button>
          <a
            href="#menu"
            className="hidden sm:inline-flex items-center rounded-full bg-gold-400 px-5 h-9 text-xs font-bold uppercase tracking-[0.15em] text-plum-950 hover:bg-gold-300 transition-colors shadow-[0_0_20px_rgba(255,201,60,0.25)]"
          >
            View Menu
          </a>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button
                aria-label="Open menu"
                className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-cream-100"
              >
                <MenuIcon className="w-5 h-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-plum-900 border-white/10 text-cream-100 w-72">
              <SheetTitle className="font-display text-gold-400 tracking-widest">LASSI DAY CAFÉ</SheetTitle>
              <ul className="mt-8 flex flex-col gap-6">
                {NAV_LINKS.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className="font-display text-xl text-cream-100 hover:text-gold-400 transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
                <li>
                  <a
                    href={SITE.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-display text-xl text-brand-400 hover:text-brand-300 transition-colors"
                  >
                    Instagram
                  </a>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      setStaffOpen(true);
                    }}
                    className="inline-flex items-center gap-2 font-display text-xl text-cream-100 hover:text-gold-400 transition-colors"
                  >
                    <KeyRound className="size-5" aria-hidden /> Staff Login
                  </button>
                </li>
              </ul>
              <a
                href="#menu"
                onClick={() => setOpen(false)}
                className="mt-10 inline-flex items-center justify-center rounded-full bg-gold-400 px-6 h-11 text-xs font-bold uppercase tracking-[0.15em] text-plum-950"
              >
                View Menu
              </a>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </motion.header>
  );
}
