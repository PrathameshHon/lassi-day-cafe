"use client";

import { Navbar } from "@/components/site/navbar";
import { Hero } from "@/components/site/hero";
import { WalkIn } from "@/components/site/walk-in";
import { MenuSection } from "@/components/site/menu-section";
import { Showcase } from "@/components/site/showcase";
import { Specials } from "@/components/site/specials";
import { Vibe } from "@/components/site/vibe";
import { InstagramWall } from "@/components/site/instagram";
import { VisitUs } from "@/components/site/visit";
import { Footer } from "@/components/site/footer";
import StaffOverlay from "@/components/staff/staff-overlay";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-plum-950 text-cream-100">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <WalkIn />
        <MenuSection />
        <Showcase />
        <Specials />
        <Vibe />
        <InstagramWall />
        <VisitUs />
      </main>
      <Footer />
      <StaffOverlay />
    </div>
  );
}
