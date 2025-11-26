import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Cerrah Akademi",
  description: "Spor analizlerinin cerrahı olun.",
};

import LayoutShell from "@/components/LayoutShell";

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <LayoutShell>
          {children}
        </LayoutShell>
      </body>
    </html>
  );
}
