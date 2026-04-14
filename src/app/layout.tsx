import type { Metadata } from "next";
import { Manrope, Inter } from "next/font/google";
import { cookies } from "next/headers";
import { LanguageProvider } from "@/lib/i18n";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

// Material Symbols Outlined font for icon usage in history and other pages
const MATERIAL_SYMBOLS_URL =
  "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,0&display=swap";

export const metadata: Metadata = {
  title: "Our Sanctuary",
  description: "A shared digital space designed for the two of you",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const theme = cookieStore.get("theme")?.value ?? "light";
  const lang = (cookieStore.get("lang")?.value ?? "en") as "en" | "es";

  return (
    <html
      lang={lang}
      className={`${manrope.variable} ${inter.variable} h-full antialiased${theme === "dark" ? " dark" : ""}`}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link href={MATERIAL_SYMBOLS_URL} rel="stylesheet" />
      </head>
      <body className="min-h-full flex flex-col">
        <LanguageProvider lang={lang}>{children}</LanguageProvider>
      </body>
    </html>
  );
}
