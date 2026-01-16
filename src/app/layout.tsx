import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Pensée du Jour",
  description: "Partagez votre unique pensée chaque jour.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="scroll-smooth">
      <body className={inter.className}>
        <Navbar />
        <main className="min-h-screen">
          {children}
        </main>
        <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Pensée du Jour. Tous droits réservés.</p>
        </footer>
      </body>
    </html>
  );
}
