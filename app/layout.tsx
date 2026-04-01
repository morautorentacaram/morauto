import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "MorAuto | Locadora de Veículos Premium",
  description: "A solução completa para locação de veículos, gestão de frota e contratos digitais no Brasil.",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

import { MobileNav } from "@/components/public/mobile-nav";
import InstallPWA from "@/components/public/InstallPWA";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.variable} ${outfit.variable} antialiased selection:bg-[#d4a017] selection:text-black mb-16 md:mb-0`}>
        {children}
        <MobileNav />
        <InstallPWA />
      </body>
    </html>
  );
}
