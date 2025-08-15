import type React from "react";
import type { Metadata, Viewport } from "next";
import { GeistMono } from "geist/font/mono";
import { Montserrat, Open_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "@/lib/providers";

export const metadata: Metadata = {
  title: "NutriAI - Elevate Your Nutrition. Simplify Your Meal Planning.",
  description:
    "Personalized meal recommendations tailored to your unique health goals with AI-powered nutrition coaching",
  generator: "v0.app",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#059669", // Updated to modern emerald color
};

const montserrat = Montserrat({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "600", "800"], // Added 800 for Black weight
  variable: "--font-montserrat",
});

const openSans = Open_Sans({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600"],
  variable: "--font-open-sans",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${montserrat.variable} ${openSans.variable} antialiased`}
    >
      <head>
        <style>{`
html {
  font-family: ${openSans.style.fontFamily};
  --font-sans: ${openSans.variable};
  --font-mono: ${GeistMono.variable};
  --font-montserrat: ${montserrat.style.fontFamily};
  --font-open-sans: ${openSans.style.fontFamily};
}
        `}</style>
      </head>
      <body className="bg-white text-neutral-dark">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
