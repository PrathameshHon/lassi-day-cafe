# 🥤 Lassi Day Cafe — Kopargaon

Official website for **Lassi Day Cafe**, Bagul Complex, Station Road, Kopargaon — a scroll-driven storytelling site for guests, with a hidden **Staff Dashboard** for day-to-day cafe operations.

## ✨ Features

### For guests
- Scroll-driven storytelling homepage (hero, walk-in hook, menu, specials, vibe gallery, Instagram wall, visit info)
- Full menu with categories & pricing
- Google Maps directions, opening hours (10 AM – 11 PM daily), Instagram link

### For staff (hidden dashboard — **Staff Login** in navbar or **Staff** in footer)
- 🔐 **PIN gate login** — default PIN `1234` (change it in *Settings → Staff PIN* on the cafe device)
- ⏱ **Tables** — table slots with guest names, live seating timers, seating-charge engine (free window + interval charges), start-time backdating and live charge totals
- 🧾 **Orders & billing** — tap an occupied table to open the order popup: add/remove menu items & quantities, live food subtotal + seating charge + running total, final bill with Cash / UPI / Card
- 🍽 **Menu management** — add / edit / delete items and prices; changes apply instantly to table popups; past bills keep original name & price snapshots
- 💰 **Earnings** — per-customer daily records (arrival, departure, items, bill, payment method), auto day totals, and one-tap **Excel export** named by date (`LassiDay_2026-10-22.xlsx`)
- 🧮 **Calculator** — quick seating-charge estimates for any duration

> All staff data lives **on-device** in the browser (localStorage) — no backend, no accounts, nothing leaves the cafe device. Historic bills always keep the item names & prices used at the time, even after menu edits.

## 🛠 Tech stack

- [Next.js 16](https://nextjs.org) (App Router) + React 19 + TypeScript
- Tailwind CSS 4 + shadcn/ui (New York) + Lucide icons
- Framer Motion, Zustand, Sonner
- SheetJS (`xlsx`) for Excel export
- 100% frontend — no database required for the website to run

## 🚀 Run locally

Requires Node.js 20+ (or Bun 1.1+).

```bash
# npm
npm install
npm run dev

# or Bun
bun install
bun run dev
```

Open **http://localhost:3000**.

## ☁️ Deploy to Vercel

### Recommended: GitHub → Vercel

1. Upload this project to a GitHub repository (steps below).
2. Go to [vercel.com/new](https://vercel.com/new) and **Import** the repository.
3. Vercel auto-detects **Next.js** — leave Build Command, Output Directory and Install Command at their defaults.
4. No environment variables are needed — the site is fully client-side.
5. Click **Deploy**. Every future `git push` to `main` auto-redeploys the site.

### Alternative: Vercel CLI

```bash
npm i -g vercel
vercel          # run inside this folder, follow the prompts
vercel --prod   # production deployment
```

## ⬆️ Upload to GitHub

```bash
git init
git add .
git commit -m "Lassi Day Cafe — Kopargaon website"
git branch -M main
git remote add origin https://github.com/<your-username>/lassi-day-cafe.git
git push -u origin main
```

Or on github.com → **New repository** → *"uploading an existing folder"* → drag & drop the extracted project folder.

## 🔑 Staff access

1. Open the website → click **Staff Login** (navbar) or **Staff** (footer).
2. Enter the PIN — default is ****
3. Change the PIN immediately in **Settings → Staff PIN** on the device used at the cafe.

| Tab | What it does |
| --- | --- |
| Tables | Seat guests, run timers, manage orders, close bills |
| Calculator | Quick seating-charge estimates |
| Earnings | Daily records + Excel download |
| Menu | Manage menu items & prices |
| Settings | Seating charges, PIN, reset options |

## 📁 Project structure

```
src/
  app/            # Next.js App Router (page, layout, hello-world API stub)
  components/
    site/         # Public website sections (hero, menu, footer, ...)
    staff/        # Staff dashboard (PIN gate, tables, orders, menu, earnings)
    ui/           # shadcn/ui components
  lib/            # Data, storage & charging logic (all client-side)
  hooks/          # Shared React hooks
public/
  images/         # Cafe & food imagery (AI-generated placeholders — replace freely)
prisma/           # Template scaffold — not used by the website, safe to ignore
```

---

Made with ❤️ for Lassi Day Cafe, Kopargaon.
