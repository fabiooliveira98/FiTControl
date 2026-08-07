import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "FitControl",
  description: "Sistema de agenda, reposições e gestão operacional para personal trainer.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className="antialiased">
      <body>{children}</body>
    </html>
  );
}
