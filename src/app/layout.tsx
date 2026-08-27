import type { Metadata } from "next";
import "./globals.css";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import MobileNav from "../components/layout/MobileNav"; 

export const metadata: Metadata = {
  title: "E-Ledger",
  description: "Tu libro mayor para gestión de gastos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased bg-brand-bg text-brand-dark flex flex-col min-h-screen">
        
        <Navbar />
        
        {/* LA SOLUCIÓN: Agregamos pb-28 (padding bottom) en celulares, y md:pb-0 en escritorio */}
        <div className="flex-grow pb-18 md:pb-0">
          {children}
        </div>

        <Footer />
        
        <MobileNav />
        
      </body>
    </html>
  );
}