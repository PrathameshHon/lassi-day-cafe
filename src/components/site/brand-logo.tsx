'use client'

import { useState } from "react";

interface BrandLogoProps {
  className?: string;
  alt?: string;
}

/** Lassi Day circular logo with a graceful CSS fallback if the image is missing. */
export function BrandLogo({ className = "", alt = "Lassi Day Cafe logo" }: BrandLogoProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        aria-label={alt}
        className={`${className} rounded-full bg-brand-600 border-2 border-gold-400 flex items-center justify-center shrink-0`}
      >
        <span className="font-display font-bold text-cream-100 leading-none text-center">
          Lassi
          <br />
          Day
        </span>
      </div>
    );
  }

  return (
     
    <img
      src="/images/logo.png"
      alt={alt}
      className={`${className} rounded-full object-cover shrink-0`}
      onError={() => setFailed(true)}
    />
  );
}
