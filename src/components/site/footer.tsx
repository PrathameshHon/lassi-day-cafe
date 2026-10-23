"use client";

import { Instagram, Lock } from "lucide-react";
import { NAV_LINKS, SITE } from "@/lib/site-data";
import { BrandLogo } from "./brand-logo";
import { useStaffStore } from "@/lib/store/staff";

export function Footer() {
  const setStaffOpen = useStaffStore((s) => s.setOpen);
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-white/10 bg-plum-900/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid gap-10 md:grid-cols-3">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-4">
              <BrandLogo className="w-14 h-14 ring-1 ring-gold-400/40" />
              <div>
                <p className="font-display text-xl font-bold text-cream-100">Lassi Day Cafe</p>
                <p className="text-[10px] tracking-[0.4em] text-gold-400 mt-1">KOPARGAON</p>
              </div>
            </div>
            <p className="mt-5 font-script text-2xl text-brand-300">{SITE.tagline}</p>
            <a
              href={SITE.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-xs font-semibold text-cream-200/80 hover:border-brand-400/60 hover:text-brand-300 transition-colors"
            >
              <Instagram className="w-3.5 h-3.5" />
              @{SITE.instagramHandle}
            </a>
          </div>

          {/* Quick links */}
          <nav aria-label="Footer navigation">
            <p className="text-[11px] font-bold uppercase tracking-[0.35em] text-cream-200/50">Explore</p>
            <ul className="mt-5 flex flex-col gap-3">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="text-sm text-cream-200/80 hover:text-gold-400 transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
              <li>
                <a
                  href={SITE.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-cream-200/80 hover:text-gold-400 transition-colors"
                >
                  Instagram
                </a>
              </li>
            </ul>
          </nav>

          {/* Visit */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.35em] text-cream-200/50">Visit Us</p>
            <ul className="mt-5 flex flex-col gap-3 text-sm text-cream-200/80">
              {SITE.addressLines.map((line) => (
                <li key={line}>{line}</li>
              ))}
              <li>{SITE.hours} · {SITE.hoursNote}</li>
              <li>
                <a
                  href={SITE.getDirectionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gold-400 hover:text-gold-300 transition-colors"
                >
                  Get Directions →
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-white/5">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-5 sm:flex-row sm:px-6 lg:px-8">
          <p className="text-xs text-cream-200/45">© {year} Lassi Day Cafe Kopargaon. All rights reserved.</p>
          <button
            onClick={() => setStaffOpen(true)}
            aria-label="Staff access"
            title="Staff access"
            className="inline-flex items-center gap-1.5 text-[11px] text-cream-200/30 hover:text-gold-400/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400/50 rounded px-2 py-1"
          >
            Staff
            <Lock className="w-3 h-3" />
          </button>
        </div>
      </div>
    </footer>
  );
}
