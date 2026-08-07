import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "FitControl",
  description:
    "Agenda inteligente para personal trainers organizarem aulas, cancelamentos e reposições.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className="antialiased">
      <body>{children}</body>
    </html>
  );
}
