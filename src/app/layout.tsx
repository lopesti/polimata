import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "tippy.js/dist/tippy.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Polimata — Aprenda qualquer coisa, do seu jeito",
  description:
    "Sistema local-first de pesquisa, estudo e domínio. Não um método. Uma orquestra.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  );
}
