import type { Metadata, Viewport } from "next";
import { Poppins, Baloo_2, Caveat } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

const baloo = Baloo_2({
  variable: "--font-baloo",
  subsets: ["latin"],
  display: "swap",
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Lassi Day Cafe — Kopargaon | More Than Just Lassi!",
  description:
    "Your table is waiting. Walk into Lassi Day Cafe Kopargaon — creamy lassis, hot pizzas, juicy burgers, momos & desserts. Bagul Complex, Station Road, Kopargaon. Open daily 10 AM – 11 PM.",
  keywords: [
    "Lassi Day Cafe",
    "Kopargaon",
    "lassi",
    "cafe Kopargaon",
    "pizza",
    "burger",
    "momos",
    "desserts",
    "Station Road Kopargaon",
  ],
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
  },
  openGraph: {
    title: "Lassi Day Cafe — Kopargaon",
    description: "Your table is waiting. More Than Just Lassi!",
    type: "website",
    locale: "en_IN",
  },
};

export const viewport: Viewport = {
  themeColor: "#120610",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${poppins.variable} ${baloo.variable} ${caveat.variable} antialiased bg-plum-950 text-cream-100 font-body`}
      >
        {children}
        <Toaster />
        <SonnerToaster position="top-center" richColors theme="dark" />
      </body>
    </html>
  );
}
