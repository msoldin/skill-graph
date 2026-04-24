import { Inter } from "next/font/google";

import "./globals.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Skill Graph",
  description: "Roadmaps and study content for backend learning",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={inter.className}>
      <body className="bg-[#fafafa]">{children}</body>
    </html>
  );
}
