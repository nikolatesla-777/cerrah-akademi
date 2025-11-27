import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata = {
  title: "Cerrah Akademi",
  description: "Spor analizlerinin cerrahı olun.",
};

import LayoutShell from "@/components/LayoutShell";

export default function RootLayout({ children }) {
  return (
    <html lang="tr" className={inter.variable}>
      <body className={inter.className} style={{ fontFamily: 'var(--font-inter), system-ui, sans-serif' }}>
        <LayoutShell>
          {children}
        </LayoutShell>
      </body>
    </html>
  );
}
